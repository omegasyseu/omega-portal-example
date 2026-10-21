import { PasswordInput, type PasswordInputProps } from "@mantine/core";
import classes from "../form-inputs.module.css";

export const PortalPasswordInput = (props: PasswordInputProps) => {
	return (
		<PasswordInput
			classNames={{
				root: classes.root,
				input: classes.passwordInput,
				innerInput: classes.passwordInnerInput,
				label: classes.label,
				error: classes.error,
				visibilityToggle: classes.visibilityToggle,
			}}
			{...props}
		/>
	);
};
