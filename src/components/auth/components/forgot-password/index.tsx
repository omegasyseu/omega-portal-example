import { Button, Stack, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { z } from "zod";
import { useMantineForm } from "@/hooks/use-form";
import { email } from "@/schemas-types/auth/general";
import { PortalTextInput } from "@/ui/form-inputs/portal-text-input";
import { useForgotPassword } from "../../hooks/use-forgot-password";

const resetPasswordSchema = z.object({
	email: email,
});

export const ForgotPassword = () => {
	const form = useMantineForm({
		validate: resetPasswordSchema,
		initialValues: {
			email: "",
		},
	});

	const [_, setEmail] = useLocalStorage({
		key: "portal-5-email-info",
		defaultValue: "",
	});

	const { mutate } = useForgotPassword();

	const resetPassword = async (formResponse: { email: string }) => {
		setEmail(formResponse.email);
		mutate(formResponse.email);
	};

	return (
		<form
			id="forgot-password"
			// Our inline errors, not the browser's bubble on the email field.
			noValidate
			onSubmit={form.onSubmit(resetPassword)}
		>
			{/* Laid out like the reset step that follows it. */}
			<Stack maw={460} mx="auto" mt="md" pb="xl" gap="md">
				<Text c="dark.1" ta="center">
					Enter your email to receive instructions on how to reset your password
				</Text>
				<PortalTextInput
					name={"email"}
					placeholder={"Email"}
					aria-label={"Email"}
					type="email"
					autoComplete="email"
					spellCheck={false}
					{...form.getInputProps("email")}
					error={form.errors?.email}
				/>
				<Button type={"submit"} fullWidth>
					Send Code
				</Button>
			</Stack>
		</form>
	);
};
