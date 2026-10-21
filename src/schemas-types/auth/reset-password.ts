import { z } from "zod";
import { sentCode } from "@/schemas-types/auth/general";

// The new password is checked against the brand's rules, which the screen loads and
// passes in.
export const resetPasswordFrontSchema = (newPassword: z.ZodType<string>) =>
	z.object({
		resetPasswordKey: sentCode,
		newPassword,
	});
