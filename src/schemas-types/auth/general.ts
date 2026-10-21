import { z } from "zod";
import { isOneOf } from "@/schemas-types/is-one-of";
import { requiredError } from "@/schemas-types/required-error";

const CODE_MESSAGE = "Please enter a valid code";
// The shortest code a brand sends (verification.code.digit is 4 or 6 today).
const CODE_MIN_LENGTH = 4;

// A code we emailed or texted (sign-up, password reset). Each brand sets its codes'
// length, so only a minimum is checked.
export const sentCode = z
	.string({ error: requiredError(CODE_MESSAGE) })
	.min(CODE_MIN_LENGTH, { message: CODE_MESSAGE });

export const passwordSchema = z
	.string({ error: requiredError("Password is required") })
	.min(6, {
		message: "Password must be at least 6 characters",
	})
	.max(16, {
		message: "Password must be at most 16 characters",
	});

export const email = z
	.string({ error: requiredError("Email is required") })
	.email({
		message: "Email must be a valid email",
	})
	.max(50, {
		message: "Email must be at most 50 characters",
	});

export const username = z
	.string({ error: requiredError("Username is required") })
	.min(6, {
		message: "Username must be at least 6 characters",
	})
	.max(100, {
		message: "Username must be at most 30 characters",
	});

export const birthDate = z.date({ error: "Birth date is required" }).refine(
	(value) => {
		const today = new Date();
		const birthDate = new Date(value);
		let age = today.getFullYear() - birthDate.getFullYear();
		const m = today.getMonth() - birthDate.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age >= 18;
	},
	{
		message: "You must be at least 18 years old",
	},
);

export const mobile = z
	.string({ error: requiredError("Number is required") })
	.min(6, {
		message: "Please enter a valid  number",
	})
	.max(20, {
		message: "Please enter a valid  number",
	})
	.transform((value) => value.replace("+", ""));

export const verificationTarget = z
	.string({ error: requiredError("Please select one of the options") })
	.refine(isOneOf("mobile", "email"), {
		message: "Please select one of the options",
	});

export const acceptTerms = z
	.boolean({ error: requiredError("You must accept the terms and conditions") })
	.optional();
// .refine((value) => value, {
//   message: 'You must accept the terms and conditions',
// });
export const acceptMarketing = z.boolean().optional();
