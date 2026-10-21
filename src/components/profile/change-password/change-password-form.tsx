import { Button, Stack } from "@mantine/core";
import { PasswordRules } from "@/components/auth/components/password-rules.tsx";
import { usePasswordRules } from "@/components/auth/hooks/use-password-rules.ts";
import { passwordMeeting } from "@/components/auth/password-policy.ts";
import { useChangePassword } from "@/components/profile/change-password/hooks/use-change-password.tsx";
import { useMantineForm } from "@/hooks/use-form";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { changePasswordSchema } from "@/schemas-types/profile/update-password.ts";
import { useGetPlayerInfo } from "@/server/IPS/user/get-player-info.ts";
import { PortalPasswordInput } from "@/ui/form-inputs";

const UpdatePasswordForm = () => {
	const { mutate, isPending } = useChangePassword();
	const { session } = useSession();
	const { data: playerInfo } = useGetPlayerInfo();
	// The rules of the brand the player signed in to (getPlayerInfo doesn't name it).
	const passwordRules = usePasswordRules(
		session?.user?.loggedInBrand?.id?.toString(),
		{ username: playerInfo?.userId },
	);
	const form = useMantineForm({
		validate: changePasswordSchema(passwordMeeting(passwordRules)),
		initialValues: {
			confirmPassword: "",
			newPassword: "",
			password: "",
		},
	});

	return (
		<form
			id={"update-password"}
			onSubmit={form.onSubmit((d) => {
				mutate(
					{
						newPassword: d.newPassword,
						oldPassword: d.password,
					},
					{
						onSuccess: () => {
							form.reset();
						},
					},
				);
			})}
		>
			<Stack gap={"md"}>
				<PortalPasswordInput
					placeholder={"Current password"}
					aria-label={"Current password"}
					autoComplete="current-password"
					{...form.getInputProps("password")}
				/>
				<PortalPasswordInput
					placeholder={"New password"}
					aria-label={"New password"}
					autoComplete="new-password"
					{...form.getInputProps("newPassword")}
				/>
				<PasswordRules
					rules={passwordRules}
					value={form.getValues().newPassword}
					isRefused={Boolean(form.errors.newPassword)}
				/>
				<PortalPasswordInput
					placeholder={"Confirm new password"}
					aria-label={"Confirm new password"}
					autoComplete="new-password"
					{...form.getInputProps("confirmPassword")}
				/>
				<Button
					loading={isPending}
					form={"update-password"}
					type={"submit"}
					w="fit-content"
				>
					Change password
				</Button>
			</Stack>
		</form>
	);
};
export default UpdatePasswordForm;
