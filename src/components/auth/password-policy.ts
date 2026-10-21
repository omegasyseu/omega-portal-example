import { z } from "zod";
import { requiredError } from "@/schemas-types/required-error";
import type { PasswordPolicy } from "@/server/IPS/general/get-password-policy.ts";

// The brand's password policy as rules the player sees and the browser checks, the way
// IPS checks them (LibPasswordService.validatePassword). IPS still has the last word:
// a rule the browser can't check (reusing an old password, a pattern it can't read) is
// left to it.

export type PasswordRule = {
	// Unique in a policy, where two rules can share a label.
	id: string;
	label: string;
	isMet: (password: string) => boolean;
};

// Until the policy loads, or when it can't, the length the portal has always asked for.
const FALLBACK_MIN = 6;
const FALLBACK_MAX = 16;

// IPS's own symbols (PasswordUtil.SPECIAL_CHAR_PATTERN).
const SYMBOL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
const NUMBER_SEQUENCES = [
	"012",
	"123",
	"234",
	"345",
	"456",
	"567",
	"678",
	"789",
	"890",
];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const LETTER_SEQUENCES = Array.from({ length: ALPHABET.length - 2 }, (_, i) =>
	ALPHABET.slice(i, i + 3),
);
const REPEATED_CHAR = /(.)\1\1/;

const lengthLabel = (min?: number | null, max?: number | null) => {
	if (min != null && max != null) return `${min}–${max} characters`;
	if (min != null) return `At least ${min} characters`;
	return `At most ${max} characters`;
};

const lengthRule = (
	min?: number | null,
	max?: number | null,
): PasswordRule => ({
	id: "length",
	label: lengthLabel(min, max),
	isMet: (password) =>
		(min == null || password.length >= min) &&
		(max == null || password.length <= max),
});

export const FALLBACK_PASSWORD_RULES: PasswordRule[] = [
	lengthRule(FALLBACK_MIN, FALLBACK_MAX),
];

// IPS matches a policy pattern against the whole password (Java's matches()). The
// strict (u) syntax refuses Java-only escapes such as \p{Punct} or \A rather than
// reading them as letters, so a pattern the browser can't read the same way is
// skipped here.
const wholeMatch = (pattern: string) => {
	try {
		return new RegExp(`^(?:${pattern})$`, "u");
	} catch {
		return null;
	}
};

const patternRule = (
	id: string,
	pattern: string | null | undefined,
	label: string,
	isMetWhenMatched: boolean,
): PasswordRule[] => {
	const regex = pattern ? wholeMatch(pattern) : null;
	if (!regex) return [];
	return [
		{
			id,
			label,
			isMet: (password) => regex.test(password) === isMetWhenMatched,
		},
	];
};

const containsAny = (text: string, parts: string[]) =>
	parts.some((part) => part !== "" && text.includes(part));

export const passwordRules = (
	policy: PasswordPolicy | null | undefined,
	{ username }: { username?: string } = {},
): PasswordRule[] => {
	if (!policy) return FALLBACK_PASSWORD_RULES;
	const bannedWords = (policy.bannedWords ?? [])
		.map(({ word }) => (word ?? "").toLowerCase())
		.filter(Boolean);
	const rules: (PasswordRule | false)[] = [
		(policy.minLength != null || policy.maxLength != null) &&
			lengthRule(policy.minLength, policy.maxLength),
		Boolean(policy.requireUppercase) && {
			id: "uppercase",
			label: "An uppercase letter",
			isMet: (password) => /[A-Z]/.test(password),
		},
		Boolean(policy.requireLowercase) && {
			id: "lowercase",
			label: "A lowercase letter",
			isMet: (password) => /[a-z]/.test(password),
		},
		Boolean(policy.requireNumber) && {
			id: "number",
			label: "A number",
			isMet: (password) => /[0-9]/.test(password),
		},
		Boolean(policy.requireSpecialChar) && {
			id: "symbol",
			label: "A symbol",
			isMet: (password) => SYMBOL.test(password),
		},
		Boolean(policy.disallowUsername && username) && {
			id: "username",
			label: "Not your username",
			isMet: (password) =>
				!password.toLowerCase().includes((username ?? "").toLowerCase()),
		},
		bannedWords.length > 0 && {
			id: "banned-words",
			label: "No blocked words",
			isMet: (password) => !containsAny(password.toLowerCase(), bannedWords),
		},
		Boolean(policy.disallowSequentialNumbers) && {
			id: "sequential-numbers",
			label: "No numbers in sequence (123)",
			isMet: (password) => !containsAny(password, NUMBER_SEQUENCES),
		},
		Boolean(policy.disallowSequentialLetters) && {
			id: "sequential-letters",
			label: "No letters in sequence (abc)",
			isMet: (password) =>
				!containsAny(password.toLowerCase(), LETTER_SEQUENCES),
		},
		Boolean(policy.disallowRepeatedChars) && {
			id: "repeated-chars",
			label: "No character 3 times in a row",
			isMet: (password) => !REPEATED_CHAR.test(password),
		},
	];
	return [
		...rules.filter((rule): rule is PasswordRule => rule !== false),
		...(policy.bannedRules ?? []).flatMap((rule, index) =>
			patternRule(
				`banned-rule-${index}`,
				rule.regexPattern,
				rule.message || "Not a blocked pattern",
				false,
			),
		),
		...(policy.customRegexPattern
			? patternRule(
					"custom",
					policy.customRegexPattern,
					// IPS's own message when the policy gives none.
					policy.customRegexMessage ||
						"Password does not meet custom requirements",
					true,
				)
			: []),
	];
};

// No rule counts as met before anything is typed, so an empty field shows none ticked.
export const meetsRule = (rule: PasswordRule, password: string) =>
	password !== "" && rule.isMet(password);

export const unmetRules = (rules: PasswordRule[], password: string) =>
	rules.filter((rule) => !meetsRule(rule, password));

const ENTER_PASSWORD = "Enter a password";

export const passwordError = (rules: PasswordRule[], password: string) => {
	if (password === "") return ENTER_PASSWORD;
	return unmetRules(rules, password).length > 0
		? "Your password doesn't meet every rule below"
		: null;
};

// The same check for a form validated with zod.
export const passwordMeeting = (rules: PasswordRule[]) =>
	z
		.string({ error: requiredError(ENTER_PASSWORD) })
		.superRefine((password, ctx) => {
			const message = passwordError(rules, password);
			if (message) ctx.addIssue({ code: "custom", message });
		});
