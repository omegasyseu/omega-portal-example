import {
	CheckIcon,
	Combobox,
	Group,
	Input,
	Pill,
	type PillProps,
	PillsInput,
	type PillsInputProps,
	useCombobox,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import classes from "../form-inputs.module.css";

interface DataItem {
	value: string;
	label: string;
}

interface CustomInputProps {
	value?: string[]; // Expecting an array of strings for initial values
	onChange: (selectedItems: string[]) => void; // Callback to notify parent component
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	error?: string;
	data: DataItem[];
	pillsInputProps: Omit<PillsInputProps, "value">;
	pillProps?: PillProps;
}

const MAX_DISPLAYED_VALUES = 2;

export function PortalComboboxWithLimit({
	value: initialValue = [],
	onChange,
	data,
	pillsInputProps,
	pillProps,
}: CustomInputProps) {
	const combobox = useCombobox({
		onDropdownClose: () => combobox.resetSelectedOption(),
		onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
	});

	const [selectedValues, setSelectedValues] = useState<string[]>(initialValue);

	const handleValueSelect = (val: string) => {
		const isSelected = selectedValues?.includes(val);
		const newSelectedValues = isSelected
			? selectedValues.filter((item) => item !== val)
			: [...selectedValues, val];
		setSelectedValues(newSelectedValues);
		onChange(newSelectedValues);
	};

	const handleValueRemove = (val: string) => {
		const newSelectedValues = selectedValues.filter((item) => item !== val);
		setSelectedValues(newSelectedValues);
		onChange(newSelectedValues);
	};

	return (
		<Combobox
			store={combobox}
			onOptionSubmit={handleValueSelect}
			withinPortal={false}
		>
			<Combobox.DropdownTarget>
				<PillsInput
					pointer
					onClick={() => combobox.toggleDropdown()}
					classNames={{
						root: classes.root,
						input: classes.inputSelect,
						label: classes.inputSelectLabel,
					}}
					rightSection={
						pillsInputProps.rightSection || <IconChevronDown size={20} />
					}
					rightSectionPointerEvents="none"
					{...pillsInputProps}
				>
					<Pill.Group>
						{selectedValues?.length > 0 ? (
							<>
								{selectedValues
									?.slice(
										0,
										selectedValues.length > MAX_DISPLAYED_VALUES
											? MAX_DISPLAYED_VALUES - 1
											: MAX_DISPLAYED_VALUES,
									)
									.map((value) => {
										const item = data.find((d) => d.value === value);
										return (
											<Pill
												key={value}
												withRemoveButton
												onRemove={() => handleValueRemove(value)}
												bg={pillProps?.bg || "brand.6"}
												c={pillProps?.c || "dark.0"}
												fz={pillProps?.fz || "xs"}
												{...pillProps}
											>
												{item ? item.label : value}
											</Pill>
										);
									})}
								{selectedValues.length > MAX_DISPLAYED_VALUES && (
									<Pill>
										+{selectedValues.length - MAX_DISPLAYED_VALUES + 1} more
									</Pill>
								)}
							</>
						) : (
							<Input.Placeholder>{pillsInputProps.label}</Input.Placeholder>
						)}
						<Combobox.EventsTarget>
							<PillsInput.Field
								type="hidden"
								onBlur={() => combobox.closeDropdown()}
								onKeyDown={(event) => {
									if (event.key === "Backspace") {
										event.preventDefault();
										handleValueRemove(
											selectedValues[selectedValues.length - 1],
										);
									}
								}}
							/>
						</Combobox.EventsTarget>
					</Pill.Group>
				</PillsInput>
			</Combobox.DropdownTarget>
			<Combobox.Dropdown>
				<Combobox.Options>
					{data.map((item, _) => (
						<Combobox.Option
							value={item.value}
							key={item.value}
							active={selectedValues?.includes(item.value)}
							my={2}
							bg={
								selectedValues.includes(item.value)
									? "var(--mantine-primary-color-filled)"
									: ""
							}
							c={
								selectedValues.includes(item.value)
									? "var(--mantine-color-dark-0)"
									: ""
							}
						>
							<Group gap="sm">
								{selectedValues?.includes(item.value) ? (
									<CheckIcon size={12} />
								) : null}
								{item.label}
							</Group>
						</Combobox.Option>
					))}
				</Combobox.Options>
			</Combobox.Dropdown>
		</Combobox>
	);
}
