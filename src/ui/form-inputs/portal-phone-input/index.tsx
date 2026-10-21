import {
	Combobox,
	Flex,
	Group,
	Text,
	UnstyledButton,
	useCombobox,
} from "@mantine/core";
import { useState } from "react";
import {
	type CountryIso2,
	defaultCountries,
	FlagImage,
	type ParsedCountry,
	parseCountry,
	usePhoneInput,
} from "react-international-phone";
import type { UserCountryType } from "@/schemas-types";
import { PortalTextInput } from "@/ui/form-inputs";
import { searchCountries } from "./country-search.ts";
import { phoneForForm, phoneForInput } from "./phone-value.ts";

type MantinePhoneInput = {
	value?: string;
	onChange: (event: string | undefined) => void;
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
	error?: string;
	label: string;
	defaultCountryInfo?: UserCountryType | string;
};

export const PortalPhoneInput = ({
	value,
	onChange,
	error,
	label,
	defaultCountryInfo,
	...rest
}: MantinePhoneInput) => {
	// The form's value drives the input, so a number that arrives after the first render
	// (a profile loading) shows instead of being replaced by the bare dial code.
	const { inputValue, inputRef, handlePhoneValueChange, country, setCountry } =
		usePhoneInput({
			defaultCountry:
				typeof defaultCountryInfo === "string"
					? defaultCountryInfo
					: (defaultCountryInfo?.countryInfo?.iso2Code?.toLowerCase() ?? "us"),
			value: phoneForInput(value),
			countries: defaultCountries,
			onChange: (data) =>
				onChange(phoneForForm(data.phone, data.country.dialCode)),
			// The dial code can be typed over: "+44…" switches the flag to the UK.
			// A stored number longer than its country's format is shown whole, not cut
			// short (and then saved cut short).
			allowMaskOverflow: true,
		});

	return (
		<PortalTextInput
			// The hook keeps the caret in place as it reformats the number.
			ref={inputRef}
			// The phone keypad, with its "+", on a phone.
			type="tel"
			autoComplete="tel"
			label={label}
			value={inputValue}
			error={error}
			onChange={(e) => {
				handlePhoneValueChange(e);
			}}
			leftSection={<CountryPicker country={country} setCountry={setCountry} />}
			styles={{
				input: {
					paddingLeft: 50,
				},
			}}
			{...rest}
		/>
	);
};

const COUNTRIES = defaultCountries.map((country) => parseCountry(country));
const FLAG_SIZE = 35;
const OPTION_FLAG_SIZE = 20;
const PICKER_WIDTH = 300;
const LIST_HEIGHT = 280;
const SEARCH_LABEL = "Search country or code";

type PickerProps = {
	country: ParsedCountry;
	setCountry: (
		countryIso2: CountryIso2,
		options?: {
			focusOnInput: boolean;
		},
	) => void;
};

// The country beside the number: its flag opens a list the player can search by country
// name, two-letter code or dial code. Enter picks the first match.
const CountryPicker = ({ country, setCountry }: PickerProps) => {
	const [search, setSearch] = useState("");
	const combobox = useCombobox({
		onDropdownOpen: () => {
			combobox.focusSearchInput();
			// The list opens on the current country, once its rows are there.
			requestAnimationFrame(() =>
				combobox.updateSelectedOptionIndex("active", { scrollIntoView: true }),
			);
		},
		onDropdownClose: () => {
			combobox.resetSelectedOption();
			setSearch("");
		},
	});
	const matches = searchCountries(COUNTRIES, search);

	return (
		<Flex ml="xs" align="center" justify="center">
			<Combobox
				store={combobox}
				width={PICKER_WIDTH}
				position="bottom-start"
				onOptionSubmit={(iso2) => {
					setCountry(iso2 as CountryIso2, { focusOnInput: true });
					combobox.closeDropdown();
				}}
			>
				<Combobox.Target targetType="button" withExpandedAttribute>
					<UnstyledButton
						w={FLAG_SIZE}
						h={FLAG_SIZE}
						aria-label={`Country code: ${country.name} (+${country.dialCode})`}
						onClick={() => combobox.toggleDropdown()}
					>
						<FlagImage
							size={FLAG_SIZE}
							iso2={country.iso2}
							style={{ borderRadius: "50%" }}
						/>
					</UnstyledButton>
				</Combobox.Target>
				<Combobox.Dropdown>
					<Combobox.Search
						value={search}
						onChange={(event) => {
							setSearch(event.currentTarget.value);
							// The best match is highlighted, so Enter picks it.
							requestAnimationFrame(() => combobox.selectFirstOption());
						}}
						placeholder={SEARCH_LABEL}
						aria-label={SEARCH_LABEL}
					/>
					{/* A plain scrolling list, as in Mantine's Combobox examples: the rows
					    can't grow wider than the list, so the dial codes stay in view. */}
					<Combobox.Options mah={LIST_HEIGHT} style={{ overflowY: "auto" }}>
						{matches.length > 0 ? (
							matches.map((option) => (
								<Combobox.Option
									key={option.iso2}
									value={option.iso2}
									active={option.iso2 === country.iso2}
								>
									<Group gap="xs" wrap="nowrap">
										<FlagImage iso2={option.iso2} size={OPTION_FLAG_SIZE} />
										<Text size="sm" flex={1} truncate>
											{option.name}
										</Text>
										{/* Never shrinks, so a long name truncates instead. */}
										<Text size="sm" style={{ flexShrink: 0 }}>
											+{option.dialCode}
										</Text>
									</Group>
								</Combobox.Option>
							))
						) : (
							<Combobox.Empty>No country matches</Combobox.Empty>
						)}
					</Combobox.Options>
				</Combobox.Dropdown>
			</Combobox>
		</Flex>
	);
};
