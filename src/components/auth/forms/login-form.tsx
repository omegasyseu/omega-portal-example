import { Anchor, Button, Flex } from "@mantine/core";
import { useGoToAuthStep } from "@/components/auth/hooks/use-auth-dialog.ts";
import { useLogin } from "@/components/auth/hooks/use-login.tsx";
import { useMantineForm } from "@/hooks/use-form";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import { loginSchema } from "@/schemas-types";
import { PortalPasswordInput, PortalTextInput } from "@/ui/form-inputs";
import classes from "../authentication-styles.module.css";

// Signs in to the Selected Brand.
const LoginForm = () => {
	const { mutate, isPending } = useLogin();
	const goToStep = useGoToAuthStep();
	const brandId = useShownBrandId();
	const form = useMantineForm({
		validate: loginSchema,
		initialValues: {
			username: "",
			password: "",
		},
	});

	return (
		<form
			style={{
				width: "100%",
			}}
			id={"login-form"}
			onSubmit={form.onSubmit((e) => {
				mutate({
					brandId,
					password: e.password,
					username: e.username,
				});
			})}
		>
			<Flex direction={"column"} gap={"xs"}>
				<PortalTextInput
					placeholder={"Username or Email"}
					aria-label={"Username or Email"}
					autoComplete="username"
					spellCheck={false}
					{...form.getInputProps("username")}
				/>
				<PortalPasswordInput
					placeholder={"Password"}
					aria-label={"Password"}
					autoComplete="current-password"
					{...form.getInputProps("password")}
				/>
				<Button
					my={"md"}
					type={"submit"}
					fullWidth
					form={"login-form"}
					loading={isPending}
				>
					Sign In
				</Button>
			</Flex>
			<Flex align={"center"} direction={"column"} gap={"xs"}>
				{/* Steps inside the flow replace the history entry and keep the return-to page. */}
				<Anchor
					component="button"
					type="button"
					onClick={() => goToStep("forgot-password")}
					className={classes.links}
				>
					Forgot your password?
				</Anchor>
			</Flex>
		</form>
	);
};

export default LoginForm;
