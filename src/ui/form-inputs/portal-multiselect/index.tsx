import { MultiSelect, type MultiSelectProps } from "@mantine/core";

export const PortalMultiselect = (props: MultiSelectProps) => {
	return (
		<MultiSelect
			// classNames={{
			//     root: classes.root,
			//     input: classes.inputSelect,
			//     label: classes.inputSelectLabel,
			//     error: classes.error,
			// }}
			{...props}
		/>
	);
};
