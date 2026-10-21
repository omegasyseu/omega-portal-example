import { z } from "zod";
import {
	acceptMarketing,
	acceptTerms,
	birthDate,
	email,
	mobile,
	passwordSchema,
	username,
	verificationTarget,
} from "@/schemas-types/auth/general";
import { requiredError } from "@/schemas-types/required-error";

export const QuickSignupStepOne = z.object({
	username: username,
	email: email,
	password: passwordSchema,
	mobile: mobile,
	acceptTerms: acceptTerms,
	// multiselect currencies is an array of string at least one should be selected
	currency: z
		.array(
			z.string({ error: requiredError("Please select at least one currency") }),
			{ error: requiredError("Please select at least one currency") },
		)
		.min(1, {
			message: "Please select at least one currency",
		}),
	verificationTarget: verificationTarget,
	referralCode: z.string().optional(),
	acceptMarketing: acceptMarketing,
});

export const SimplifiedStepOne = QuickSignupStepOne.omit({
	currency: true,
}).extend({
	birthDate: birthDate,
	brandId: z.string({ error: requiredError("BrandId is required") }),
	secondaryCurrencies: z.string().optional(),
});

export const quickSignUpRequestFields = z.object({
	username: z.string(),
	email: z.string(),
	mobile: z.string(),
	password: z.string(),
	birthDate: z.string(),
	verificationTarget: z.string(),
	referralCode: z.string().optional(),
	brandId: z.string().optional(),
	secondaryCurrencies: z.string().optional(),
});

export type QuickSignUpRequestFields = z.infer<typeof quickSignUpRequestFields>;
export type SimplifiedStepOneType = z.infer<typeof SimplifiedStepOne>;

// Schema USED FOR quick-signup/index.tsx

export const stepOneRes = z.object({
	errors: z.array(z.object({ field: z.string(), error: z.string() })),
	status: z.string(),
	message: z.null(),
	advices: z.array(z.unknown()),
	additionalInfo: z.array(z.object({ key: z.string(), value: z.string() })),
});

export const stepTwoRes = z.object({
	errors: z.array(z.object({ field: z.string(), error: z.string() })),
	status: z.string(),
	message: z.string(),
	advices: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
	sessionKey: z.string().optional(),
	additionalInfo: z
		.array(z.object({ key: z.string(), value: z.string() }))
		.optional(),
	associateAccounts: z
		.array(
			z.object({
				partyId: z.number(),
				currency: z.string(),
				sessionKey: z.string(),
				isPrimary: z.boolean(),
			}),
		)
		.optional(),
});
// Optional SCHEMA
export const stepTwoResOptional = stepTwoRes.optional();

export type apiResponseSignup = z.infer<typeof stepTwoResOptional>;

export const mergedSignUpValidation = stepOneRes.merge(stepTwoRes).optional();
export type mergedSignUpValidation = z.infer<typeof mergedSignUpValidation>;
