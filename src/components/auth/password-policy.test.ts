import { describe, expect, it } from "vitest";
import {
	FALLBACK_PASSWORD_RULES,
	passwordError,
	passwordMeeting,
	passwordRules,
	unmetRules,
} from "@/components/auth/password-policy";
import type { PasswordPolicy } from "@/server/IPS/general/get-password-policy";

// Brand 1's player policy on dev, as /getPasswordPolicyRulesForPlayers returns it.
const DEV_POLICY: PasswordPolicy = {
	minLength: 6,
	maxLength: 32,
	requireUppercase: true,
	requireLowercase: true,
	requireNumber: true,
	requireSpecialChar: true,
	disallowUsername: false,
	disallowSequentialNumbers: false,
	disallowSequentialLetters: false,
	disallowRepeatedChars: false,
	customRegexPattern: "^(?!.*(.)\\1{2}).*$",
	customRegexMessage: "No character three times in a row",
	bannedWords: [],
	bannedRules: [
		{
			regexPattern: "^[0-9]+$",
			message: "Password cannot contain only numbers",
		},
	],
};

const labelsOf = (rules: ReturnType<typeof passwordRules>) =>
	rules.map((rule) => rule.label);

const unmetLabels = (policy: PasswordPolicy, password: string) =>
	labelsOf(unmetRules(passwordRules(policy), password));

describe("passwordRules", () => {
	it("lists the rules the brand's policy sets", () => {
		expect(labelsOf(passwordRules(DEV_POLICY))).toEqual([
			"6–32 characters",
			"An uppercase letter",
			"A lowercase letter",
			"A number",
			"A symbol",
			"Password cannot contain only numbers",
			"No character three times in a row",
		]);
	});

	it("leaves out the rules the policy doesn't set", () => {
		expect(labelsOf(passwordRules({ minLength: 8, maxLength: null }))).toEqual([
			"At least 8 characters",
		]);
		expect(labelsOf(passwordRules({ maxLength: 20 }))).toEqual([
			"At most 20 characters",
		]);
	});

	it("checks only the length when there is no policy", () => {
		expect(passwordRules(null)).toBe(FALLBACK_PASSWORD_RULES);
		expect(passwordRules(undefined)).toBe(FALLBACK_PASSWORD_RULES);
		expect(labelsOf(FALLBACK_PASSWORD_RULES)).toEqual(["6–16 characters"]);
	});
});

describe("unmetRules", () => {
	it("passes a password that meets every rule", () => {
		expect(unmetLabels(DEV_POLICY, "Omega123!")).toEqual([]);
	});

	it("names each rule a password misses", () => {
		expect(unmetLabels(DEV_POLICY, "omega123!")).toEqual([
			"An uppercase letter",
		]);
		expect(unmetLabels(DEV_POLICY, "OMEGA123!")).toEqual([
			"A lowercase letter",
		]);
		expect(unmetLabels(DEV_POLICY, "Omega123")).toEqual(["A symbol"]);
		expect(unmetLabels(DEV_POLICY, "Omega!!!x")).toEqual([
			"A number",
			"No character three times in a row",
		]);
	});

	it("counts the length in characters, with both ends allowed", () => {
		expect(unmetLabels(DEV_POLICY, "Om1!x")).toEqual(["6–32 characters"]);
		expect(unmetLabels(DEV_POLICY, "Om1!xy")).toEqual([]);
		expect(unmetLabels(DEV_POLICY, `Om1!${"ab".repeat(14)}`)).toEqual([]);
		expect(unmetLabels(DEV_POLICY, `Om1!${"ab".repeat(15)}`)).toEqual([
			"6–32 characters",
		]);
	});

	it("takes IPS's symbols as symbols", () => {
		for (const symbol of "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?") {
			expect(unmetLabels(DEV_POLICY, `Omega12${symbol}`)).toEqual([]);
		}
		// IPS doesn't count these.
		expect(unmetLabels(DEV_POLICY, "Omega12~")).toEqual(["A symbol"]);
		expect(unmetLabels(DEV_POLICY, "Omega12 ")).toEqual(["A symbol"]);
	});

	it("matches a banned rule's pattern against the whole password", () => {
		expect(
			unmetLabels({ bannedRules: DEV_POLICY.bannedRules }, "123456"),
		).toEqual(["Password cannot contain only numbers"]);
		expect(
			unmetLabels({ bannedRules: DEV_POLICY.bannedRules }, "123456a"),
		).toEqual([]);
	});

	it("names a banned rule that has no message", () => {
		const policy = { bannedRules: [{ regexPattern: "^abc.*$" }] };
		expect(unmetLabels(policy, "abcdef")).toEqual(["Not a blocked pattern"]);
	});

	it("refuses a password with a banned word in it, in any case", () => {
		const policy = { bannedWords: [{ word: "omega" }, { word: "" }] };
		expect(unmetLabels(policy, "MyOMEGApass")).toEqual(["No blocked words"]);
		expect(unmetLabels(policy, "Mypass")).toEqual([]);
	});

	it("refuses three numbers or letters in sequence, as IPS does", () => {
		const policy = {
			disallowSequentialNumbers: true,
			disallowSequentialLetters: true,
		};
		expect(unmetLabels(policy, "pass123")).toEqual([
			"No numbers in sequence (123)",
		]);
		expect(unmetLabels(policy, "pass890")).toEqual([
			"No numbers in sequence (123)",
		]);
		expect(unmetLabels(policy, "XYZ19")).toEqual([
			"No letters in sequence (abc)",
		]);
		expect(unmetLabels(policy, "pass135acx")).toEqual([]);
	});

	it("refuses a character three times in a row", () => {
		const policy = { disallowRepeatedChars: true };
		expect(unmetLabels(policy, "paaass")).toEqual([
			"No character 3 times in a row",
		]);
		expect(unmetLabels(policy, "paass")).toEqual([]);
	});

	it("matches the custom pattern against the whole password", () => {
		const policy = {
			customRegexPattern: "[a-z]+",
			customRegexMessage: "Lowercase letters only",
		};
		expect(unmetLabels(policy, "abc")).toEqual([]);
		expect(unmetLabels(policy, "abc1")).toEqual(["Lowercase letters only"]);
	});

	it("names a custom rule that has no message as IPS does", () => {
		expect(labelsOf(passwordRules({ customRegexPattern: "[a-z]+" }))).toEqual([
			"Password does not meet custom requirements",
		]);
	});

	it("leaves a pattern the browser can't read to IPS", () => {
		const policy = {
			customRegexPattern: "(?i)omega",
			bannedRules: [{ regexPattern: "a++", message: "No a's" }],
		};
		expect(labelsOf(passwordRules(policy))).toEqual([]);
	});

	it("leaves Java-only syntax to IPS instead of reading it another way", () => {
		// Read loosely, \p{Punct} would be the letters "p{Punct}" and \A an "A".
		for (const pattern of ["(?=.*\\p{Punct}).{8,}", "\\A.{8,}\\z", "\\h*"]) {
			expect(labelsOf(passwordRules({ customRegexPattern: pattern }))).toEqual(
				[],
			);
		}
	});

	it("still parses a rule that has no pattern or a word that is empty", () => {
		const policy = {
			bannedWords: [{ word: null }, { word: "omega" }],
			bannedRules: [{ regexPattern: null, message: "Broken" }],
		};
		expect(labelsOf(passwordRules(policy))).toEqual(["No blocked words"]);
	});

	it("refuses the player's username when the policy asks", () => {
		const policy = { disallowUsername: true };
		const rules = passwordRules(policy, { username: "Stanley" });
		expect(labelsOf(unmetRules(rules, "mystanley1"))).toEqual([
			"Not your username",
		]);
		expect(labelsOf(unmetRules(rules, "mypass1"))).toEqual([]);
		// Not known yet, so not checked.
		expect(labelsOf(passwordRules(policy, { username: "" }))).toEqual([]);
	});

	it("meets no rule while the password is empty", () => {
		expect(unmetRules(passwordRules(DEV_POLICY), "")).toHaveLength(7);
	});
});

describe("passwordMeeting", () => {
	const schema = passwordMeeting(passwordRules(DEV_POLICY));
	const errorOf = (value: unknown) => {
		const result = schema.safeParse(value);
		return result.success ? null : result.error.issues[0]?.message;
	};

	it("gives a zod form the same verdicts", () => {
		expect(errorOf(undefined)).toBe("Enter a password");
		expect(errorOf("")).toBe("Enter a password");
		expect(errorOf("omega")).toBe(
			"Your password doesn't meet every rule below",
		);
		expect(errorOf("Omega123!")).toBeNull();
	});
});

describe("passwordError", () => {
	const rules = passwordRules(DEV_POLICY);

	it("asks for a password when there is none", () => {
		expect(passwordError(rules, "")).toBe("Enter a password");
	});

	it("points at the rules when one is missed", () => {
		expect(passwordError(rules, "omega")).toBe(
			"Your password doesn't meet every rule below",
		);
	});

	it("accepts a password that meets them all", () => {
		expect(passwordError(rules, "Omega123!")).toBeNull();
	});
});
