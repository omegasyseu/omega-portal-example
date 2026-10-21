import type { SelectProps } from "@mantine/core";
import { SimpleGrid, Stack, Text, type TextInputProps } from "@mantine/core";
import { useId } from "react";
import { formatedCountries } from "@/components/auth/constants";
import { PortalSelect, PortalTextInput } from "@/ui/form-inputs";
import classes from "./address-fields.module.css";

// The space between the address fields: tighter than between other fields, so they
// read as one block.
const ADDRESS_GAP = 4;

type Props = {
	address: TextInputProps;
	city: TextInputProps;
	country: SelectProps;
	province: TextInputProps;
	postalCode: TextInputProps;
	// The profile keeps the street number apart; sign-up takes it in the address.
	streetNumber?: TextInputProps;
};

// Address, city, country, province and postal code as one tight group under an
// "Address" label, as on Omega Wins.
export function AddressFields({
	address,
	city,
	country,
	province,
	postalCode,
	streetNumber,
}: Props) {
	const labelId = useId();
	return (
		<Stack gap={ADDRESS_GAP} role="group" aria-labelledby={labelId}>
			<Text id={labelId} className={classes.label}>
				Address
			</Text>
			{streetNumber ? (
				<div className={classes.street}>
					<PortalTextInput
						aria-label="Street number"
						placeholder="No."
						{...streetNumber}
					/>
					<PortalTextInput
						aria-label="Street name"
						placeholder="Street name"
						autoComplete="address-line1"
						{...address}
					/>
				</div>
			) : (
				<PortalTextInput
					aria-label="Address"
					placeholder="Address"
					autoComplete="street-address"
					{...address}
				/>
			)}
			<SimpleGrid cols={2} spacing={ADDRESS_GAP} verticalSpacing={ADDRESS_GAP}>
				<PortalTextInput
					aria-label="City"
					placeholder="City"
					autoComplete="address-level2"
					{...city}
				/>
				<PortalSelect
					aria-label="Country"
					placeholder="Country"
					searchable
					allowDeselect={false}
					data={formatedCountries}
					{...country}
				/>
				<PortalTextInput
					aria-label="Province"
					placeholder="Province"
					autoComplete="address-level1"
					{...province}
				/>
				<PortalTextInput
					aria-label="Postal code"
					placeholder="Postal code"
					autoComplete="postal-code"
					{...postalCode}
				/>
			</SimpleGrid>
		</Stack>
	);
}
