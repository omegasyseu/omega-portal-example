import { Button, Stack, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { PasswordRules } from "@/components/auth/components/password-rules.tsx";
import { usePasswordRules } from "@/components/auth/hooks/use-password-rules.ts";
import { passwordMeeting } from "@/components/auth/password-policy.ts";
import { ResendCode } from "@/components/resend-code/resend-code.tsx";
import { useMantineForm } from "@/hooks/use-form";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import { resetPasswordFrontSchema } from "@/schemas-types/auth/reset-password";
import { PortalCodeInput, PortalPasswordInput } from "@/ui/form-inputs";
import { useForgotPassword } from "../../hooks/use-forgot-password";
import { useResetPassword } from "../../hooks/use-reset-password";
export const ResetPassword = () => {
	const { mutate, isPending } = useResetPassword();
	// The forgot-password step saved the email the code went to; sending it again
	// issues a new code.
	const [email] = useLocalStorage({
		key: "portal-5-email-info",
		defaultValue: "",
	});
	const sendCodeAgain = useForgotPassword();
	// Only the email is known here, not the player's brand, so the Selected Brand's
	// rules; IPS checks the player's own brand when the password is saved.
	const passwordRules = usePasswordRules(useShownBrandId());
	const form = useMantineForm({
		validate: resetPasswordFrontSchema(passwordMeeting(passwordRules)),
		initialValues: {
			resetPasswordKey: "",
			newPassword: "",
		},
	});

	const handleSubmit = async (formResponse: {
		resetPasswordKey: string;
		newPassword: string;
	}) => {
		mutate(formResponse);
	};

	// Laid out like sign-up's code step: where the code went, then labelled fields.
	return (
		<form id="reset-password" onSubmit={form.onSubmit(handleSubmit)}>
			<Stack maw={460} mx="auto" mt="md" pb="xl" gap="md">
				<Text c="dark.1" ta="center">
					{email ? (
						<>
							We&#39;ve sent a code to{" "}
							<Text span fw={700} c="dark.0">
								{email}
							</Text>
							. Enter it, then choose a new password.
						</>
					) : (
						"Enter the code we emailed you, then choose a new password."
					)}
				</Text>
				<PortalCodeInput
					label="Code"
					{...form.getInputProps("resetPasswordKey")}
				/>
				<PortalPasswordInput
					label="New password"
					autoComplete="new-password"
					{...form.getInputProps("newPassword")}
				/>
				<PasswordRules
					rules={passwordRules}
					value={form.getValues().newPassword}
					isRefused={Boolean(form.errors.newPassword)}
				/>
				<Button type="submit" fullWidth loading={isPending}>
					Reset Password
				</Button>
				{email ? (
					<ResendCode
						onResend={(onSent) =>
							sendCodeAgain.mutate(email, { onSuccess: onSent })
						}
						isResending={sendCodeAgain.isPending}
						isDisabled={isPending}
					/>
				) : null}
			</Stack>
		</form>
	);
};
