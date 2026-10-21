import { DateInput, type DateInputProps } from "@mantine/dates";
import { IconChevronDown } from "@tabler/icons-react";
import dayjs from "dayjs";
import classes from "../form-inputs.module.css";

type PortalDateInputProps = Omit<DateInputProps, "onChange"> & {
	onChange?: (value: Date | null) => void;
};

// Mantine 8+ reports dates as "YYYY-MM-DD" strings; the portal's forms and
// schemas work with Date, so convert back (local midnight, as Mantine 7 did).
export const PortalDateInput = ({
	onChange,
	...props
}: PortalDateInputProps) => {
	return (
		<DateInput
			classNames={{
				root: classes.root,
				input: classes.input,
				label: classes.label,
				error: classes.error,
			}}
			rightSection={props.rightSection || <IconChevronDown size={20} />}
			rightSectionPointerEvents="none"
			{...props}
			onChange={(value) => onChange?.(value ? dayjs(value).toDate() : null)}
		/>
	);
};
