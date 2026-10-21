import { passwordRules } from "@/components/auth/password-policy.ts";
import { useGetPasswordPolicy } from "@/server/IPS/general/get-password-policy.ts";

// The brand's password rules; the length alone until its policy loads, or if it can't.
export const usePasswordRules = (
	brandId: string | undefined,
	options: { username?: string } = {},
) => {
	const { data: policy } = useGetPasswordPolicy(brandId);
	return passwordRules(policy, options);
};
