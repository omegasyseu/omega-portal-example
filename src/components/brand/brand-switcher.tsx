import { type BoxProps, Select } from "@mantine/core";
import { IconBuildingStore, IconLock } from "@tabler/icons-react";
import { useSelectedBrand } from "@/components/brand/use-selected-brand.ts";
import { MENU_ICON_SIZE, SEARCH_ICON_SIZE } from "@/constants/ui-sizes.ts";

// The Brand switcher: picks the Selected Brand the whole portal shows, from the Brands IPS
// lists. Hidden when there is only one, and locked (with a padlock where the chevron was)
// to the player's own Brand while they are signed in.
export function BrandSwitcher(props: BoxProps) {
	const { brands, brandId, isSwitcherShown, isSwitcherLocked, selectBrand } =
		useSelectedBrand();

	if (!isSwitcherShown) return null;

	return (
		<Select
			{...props}
			aria-label="Brand"
			size="md"
			data={brands.map((brand) => ({
				value: String(brand.id),
				label: brand.name,
			}))}
			value={brandId ?? null}
			onChange={(value) => {
				if (value) selectBrand(value);
			}}
			// An environment can list dozens of Brands.
			searchable
			nothingFoundMessage="No brands match"
			allowDeselect={false}
			disabled={isSwitcherLocked}
			leftSection={<IconBuildingStore size={SEARCH_ICON_SIZE} aria-hidden />}
			rightSection={
				isSwitcherLocked ? (
					<IconLock size={MENU_ICON_SIZE} aria-hidden />
				) : undefined
			}
		/>
	);
}
