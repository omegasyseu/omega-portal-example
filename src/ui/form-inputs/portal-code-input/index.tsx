import { TextInput, type TextInputProps } from "@mantine/core";
import classes from "../form-inputs.module.css";
import { codeDigits } from "./code-digits.ts";

type Props = Omit<TextInputProps, "onChange"> & {
	// The code's digits, whatever was typed or pasted.
	onChange?: (code: string) => void;
};

// The portal's one field for an emailed or texted code (sign-up, password reset, the
// security code before a change). One box, since each brand sets its codes' length.
export const PortalCodeInput = ({ onChange, ...props }: Props) => {
	return (
		<TextInput
			inputMode="numeric"
			autoComplete="one-time-code"
			spellCheck={false}
			// No maxLength: the browser would cut a pasted "Your code: 482916" before
			// its digits are picked out. codeDigits keeps at most CODE_MAX_LENGTH.
			classNames={{
				root: classes.root,
				label: classes.label,
				input: `${classes.input} ${classes.codeInput}`,
				error: classes.error,
			}}
			{...props}
			onChange={(event) => onChange?.(codeDigits(event.currentTarget.value))}
		/>
	);
};
