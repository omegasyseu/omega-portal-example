import { TextInput, type TextInputProps } from "@mantine/core";
import classes from "../form-inputs.module.css";

export const PortalTextInput = (props: TextInputProps) => {
	return (
		<TextInput
			classNames={{
				input: classes.input,
				root: classes.root,
				label: classes.label,
				error: classes.error,
			}}
			{...props}
		/>
	);
};
