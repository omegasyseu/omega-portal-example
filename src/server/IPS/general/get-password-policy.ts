import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { IPS_AXIOS_CLIENT } from "../IPS_CONFIG";

// A brand's rules for player passwords, as IPS checks them on sign-up, reset and
// change. Only the fields the portal checks are read.
const passwordPolicySchema = z.object({
	minLength: z.number().nullish(),
	maxLength: z.number().nullish(),
	requireUppercase: z.boolean().nullish(),
	requireLowercase: z.boolean().nullish(),
	requireNumber: z.boolean().nullish(),
	requireSpecialChar: z.boolean().nullish(),
	disallowUsername: z.boolean().nullish(),
	disallowSequentialNumbers: z.boolean().nullish(),
	disallowSequentialLetters: z.boolean().nullish(),
	disallowRepeatedChars: z.boolean().nullish(),
	customRegexPattern: z.string().nullish(),
	customRegexMessage: z.string().nullish(),
	// One incomplete entry shouldn't cost the player the rest of the policy.
	bannedWords: z.array(z.object({ word: z.string().nullish() })).nullish(),
	bannedRules: z
		.array(
			z.object({
				regexPattern: z.string().nullish(),
				message: z.string().nullish(),
			}),
		)
		.nullish(),
});

export type PasswordPolicy = z.infer<typeof passwordPolicySchema>;

const responseSchema = z.union([
	passwordPolicySchema.extend({ status: z.literal("SUCCESS") }),
	z.object({ status: z.literal("NOT_FOUND") }),
]);

// The policy rarely changes, so it is fetched once a quarter hour at most.
const POLICY_STALE_TIME = 15 * 60 * 1000;

const getPasswordPolicy = async (
	brandId: string,
): Promise<PasswordPolicy | null> => {
	const res = await IPS_AXIOS_CLIENT.get<unknown>(
		"/getPasswordPolicyRulesForPlayers",
		{ params: { brandId } },
	);
	const data = responseSchema.parse(res.data);
	return data.status === "SUCCESS" ? data : null;
};

export const passwordPolicyOptions = (brandId: string | undefined) =>
	queryOptions({
		queryKey: ["password-policy", brandId],
		queryFn: () => getPasswordPolicy(brandId ?? ""),
		enabled: Boolean(brandId),
		staleTime: POLICY_STALE_TIME,
	});

export const useGetPasswordPolicy = (brandId: string | undefined) =>
	useQuery(passwordPolicyOptions(brandId));
