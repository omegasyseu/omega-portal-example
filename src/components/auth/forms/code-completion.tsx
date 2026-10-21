import { Button, Flex, Text } from "@mantine/core";
import { useSearch } from "@tanstack/react-router";
import { useQuickSignupStepTwo } from "@/components/auth/hooks/use-quick-signup-step-two.tsx";
import { useResendPasscode } from "@/components/auth/hooks/use-resend-passcode.tsx";
import { ResendCode } from "@/components/resend-code/resend-code.tsx";
import { useMantineForm } from "@/hooks/use-form";
import { codeSchema } from "@/schemas-types";
import { PortalCodeInput } from "@/ui/form-inputs";

const CodeCompletion = () => {
	const resend = useResendPasscode();
	const { mutate, isPending: stepTwoPending } = useQuickSignupStepTwo();
	const form = useMantineForm({
		validate: codeSchema,
		initialValues: { confirmationCode: "" },
	});
	// Rendered by both the signup and the quick sign-up code routes.
	const { username } = useSearch({ strict: false });

	return (
		<Flex
			maw={460}
			w={"100%"}
			direction={"column"}
			mx={"auto"}
			mt={"xl"}
			justify={"center"}
			gap={"xl"}
			pb={"xl"}
		>
			<div>
				<Text component={"div"} c={"dark.1"} ta={"center"} pb={"xs"}>
					We&#39;ve sent a code to{" "}
					<Text span fw={700} c={"dark.0"}>
						{username}
					</Text>
					.
				</Text>

				<Text c={"dark.1"} size={"sm"} ta={"center"}>
					Don&#39;t forget to check your junk or spam if you can’t find the
					email.
				</Text>
			</div>
			<form
				id={"verify-code"}
				onSubmit={form.onSubmit((e) => {
					mutate({
						confirmationCode: e.confirmationCode,
					});
				})}
			>
				<PortalCodeInput
					aria-label={"One time code"}
					{...form.getInputProps("confirmationCode")}
				/>
			</form>
			<Flex gap="md" direction="column" align="center">
				<Button
					form={"verify-code"}
					fullWidth
					type={"submit"}
					loading={stepTwoPending}
				>
					Verify
				</Button>
				<ResendCode
					onResend={(onSent) => resend.mutate(undefined, { onSuccess: onSent })}
					isResending={resend.isPending}
					isDisabled={stepTwoPending}
				/>
			</Flex>
		</Flex>
	);
};
export default CodeCompletion;
