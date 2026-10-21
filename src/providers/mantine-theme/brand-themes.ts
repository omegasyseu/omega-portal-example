import type {
	BrandColours,
	BrandPalette,
} from "@/providers/mantine-theme/brand-palette.ts";
import {
	type ColourMode,
	darkMode,
	lightMode,
} from "@/providers/mantine-theme/colour-modes.ts";
import { kambiColours } from "@/providers/mantine-theme/kambi-colours.ts";
import { omegaWinsColours } from "@/providers/mantine-theme/omega-wins-colours.ts";

// The Brand Themes an editor can pick: Strapi's Brand theme enum
// (strapi/src/api/brand/content-types/brand/schema.json) and the seed's THEMES
// (strapi/scripts/seed-inputs.js) list the same names; change all three together.
export type BrandThemeName = "DARK" | "LIGHT";

// A Brand Theme (GLOSSARY.md): a Colour Mode and the Brand Colours. Layout, type and
// components are shared. The logo is the Brand's own, from its content in Strapi.
export type BrandTheme = {
	name: BrandThemeName;
	colourMode: ColourMode;
	colours: BrandColours;
	// Every colour role, as the Mantine theme and third-party widgets receive them.
	palette: BrandPalette;
	// The browser's tab and address-bar colour.
	browserColour: string;
};

const brandTheme = (
	name: BrandThemeName,
	colourMode: ColourMode,
	colours: BrandColours,
): BrandTheme => ({
	name,
	colourMode,
	colours,
	palette: { ...colours, dark: colourMode.dark, surface: colourMode.surface },
	browserColour: colourMode.browserColour(colours),
});

const THEMES: Record<BrandThemeName, () => BrandTheme> = {
	DARK: () => brandTheme("DARK", darkMode, omegaWinsColours),
	LIGHT: () => brandTheme("LIGHT", lightMode, kambiColours),
};

const isBrandThemeName = (name: string): name is BrandThemeName =>
	Object.hasOwn(THEMES, name);

// The Brand's theme as set in Strapi; the Dark Theme when it is unset or unknown.
export const brandThemeFor = (setting: string | undefined): BrandTheme => {
	const name = setting?.trim().toUpperCase() ?? "";
	return isBrandThemeName(name) ? THEMES[name]() : THEMES.DARK();
};

// Gives the browser chrome the theme's colour.
export const applyBrandTheme = ({ browserColour }: BrandTheme) => {
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute("content", browserColour);
};
