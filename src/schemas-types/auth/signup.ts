import { z } from "zod";
import {
	acceptMarketing,
	acceptTerms,
	birthDate,
	email,
	mobile,
	passwordSchema,
	sentCode,
	username,
	verificationTarget,
} from "@/schemas-types/auth/general";
import { stepTwoRes } from "@/schemas-types/auth/quick-signup";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";
import { isOneOf } from "@/schemas-types/is-one-of";
import { requiredError } from "@/schemas-types/required-error";

export const currencies = z
	.string({ error: requiredError("Currency is required") })
	.min(3, {
		message: "Please select one of the options",
	})
	.max(3, {
		message: "Please select one of the options",
	});
export const firstName = z
	.string({ error: requiredError("First name is required") })
	.min(2, {
		message: "Name must be at least 2 characters",
	})
	.max(50, {
		message: "Name must be at most 50 characters",
	});
export const lastName = z
	.string({ error: requiredError("Last name is required") })
	.min(2, {
		message: "Last name must be at least 2 characters",
	})
	.max(50, {
		message: "Last name must be at most 50 characters",
	});

export const gender = z
	.string({ error: requiredError("Select a gender") })
	.min(1, {
		message: "Please select one of the options",
	})
	.refine(isOneOf("F", "M", "X"), {
		message: "Please select a gender",
	});

export const langCode = z
	.string({ error: requiredError("Language is required") })
	.min(1, {
		message: "Please select one of the options",
	});
export const address = z
	.string({ error: requiredError("Address is required") })
	.min(2, {
		message: "Address must be at least 2 characters",
	})
	.max(75, {
		message: "Address must be at most 75 characters",
	});
export const city = z
	.string({ error: requiredError("City is required") })
	.min(2, {
		message: "City must be at least 2 characters",
	})
	.max(30, {
		message: "City must be at most 30 characters",
	});

export const postalCode = z
	.string({ error: requiredError("Postal code is required") })
	.min(2, {
		message: "Zip code must be at least 2 characters",
	})
	.max(30, {
		message: "Zip code must be at most 30 characters",
	});
export const country = z
	.string({ error: requiredError("Country is required") })
	.nonempty({
		message: "Country is required",
	})
	.min(2, {
		message: "Country must be at least 2 characters",
	})
	.max(30, {
		message: "Country must be at most 30 characters",
	});

export const streetNumber = z
	.string({ error: requiredError("Street number is required") })
	.min(1, {
		message: "Street must be at least 2 characters",
	})
	.max(75, {
		message: "Street must be at most 75 characters",
	});

export const province = z
	.string({ error: requiredError("Province is required") })
	.min(2, {
		message: "Province must be at least 2 characters",
	})
	.max(30, {
		message: "Province must be at most 30 characters",
	});
export const SignupSchema = z
	.object({
		username,
		email: email,
		mobile: mobile,
		phone: mobile,

		password: passwordSchema,
		birthDate: birthDate,
		currency: currencies,
		secondaryCurrencies: currencies.optional(),

		firstName,
		lastName,
		gender,
		langCode,
		address,
		city,

		postalCode,
		country,
		verificationTarget: verificationTarget,

		acceptTerms: acceptTerms,

		streetNumber,

		province,
		acceptMarketing: acceptMarketing,
		brandId: z.string().optional(),
		referralCode: z.string().optional(),
	})
	.refine(
		(data) => {
			if (typeof data.secondaryCurrencies === "undefined") {
				return true;
			}
			return data.currency !== data.secondaryCurrencies;
		},
		{
			message: "Please select a different currency",
			path: ["secondaryCurrencies"],
		},
	);

//CODESCHEMA FOR SECOND STEP
export const codeSchema = z.object({
	confirmationCode: sentCode,
});

export type SignupSchemaType = z.infer<typeof SignupSchema>;
export type CodeSchemaType = z.infer<typeof codeSchema>;

/// THIS IS USED IN API ips/signup/index.tsx
const stringDate = z.object({
	birthDate: z.string(),
});
export const ParamsSchema = z
	.object({
		username,
		email: email,
		mobile: mobile,
		phone: mobile,
		password: passwordSchema,
		birthDate: birthDate,
		currency: currencies.optional(),
		secondaryCurrencies: currencies.optional(),
		firstName,
		lastName,
		gender,
		langCode,
		address,
		city,
		postalCode,
		country,
		verificationTarget: verificationTarget,
		acceptTerms: acceptTerms,
		streetNumber,
		province,
		acceptMarketing: acceptMarketing,
		referralCode: z.string().optional(),
		brandId: z
			.string({ error: requiredError("BrandId is required") })
			.optional(),
	})
	.merge(stringDate);
export type SignupStepOneTypeRequest = z.infer<typeof ParamsSchema>;
export const signupSchema = BASE_RESPONSE_SCHEMA.merge(stepTwoRes).optional();

export type SignupSchemaTypeFull = z.infer<typeof signupSchema>;
