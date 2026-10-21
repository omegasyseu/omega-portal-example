import { z } from "zod";
import { requiredError } from "@/schemas-types/required-error";

// The new password is checked against the brand's rules, which the screen loads and
// passes in.
export const changePasswordSchema = (newPassword: z.ZodType<string>) =>
	z
		.object({
			password: z
				.string({ error: requiredError("Current password is required") })
				.min(1, {
					message: "Confirm password is required",
				})
				.max(100, {
					message: "Confirm password is too long",
				}),
			newPassword,
			confirmPassword: z
				.string()
				.min(1, {
					message: "Confirm password is required",
				})
				.max(100, {
					message: "Confirm password is too long",
				}),
		})
		.refine((data) => data.newPassword === data.confirmPassword, {
			message: "Passwords do not match",
			path: ["confirmPassword"],
		})
		.refine((d) => d.password !== d.newPassword, {
			message: "New password cannot be the same as old password",
			path: ["newPassword"],
		});

export type ChangePasswordSchemaType = z.infer<
	ReturnType<typeof changePasswordSchema>
>;
