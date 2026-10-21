import { Select, type SelectProps } from "@mantine/core";
import classes from "../form-inputs.module.css";

export const PortalSelect = (props: SelectProps) => {
	return (
		<Select
			classNames={{
				root: classes.root,
				input: classes.inputSelect,
				label: classes.inputSelectLabel,
				error: classes.error,
			}}
			{...props}
		/>
	);
};
