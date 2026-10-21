import type { MantineColorsTuple } from "@mantine/core";

// A Brand's own colours (GLOSSARY.md, Brand Colours): the accents, which read the same in
// either Colour Mode.
export type BrandColours = {
	brand: MantineColorsTuple;
	// Sign-up and money actions: Register, Deposit, the header wallet button.
	cta: MantineColorsTuple;
	neon: MantineColorsTuple;
	gold: MantineColorsTuple;
	silver: MantineColorsTuple;
	bronze: MantineColorsTuple;
	danger: MantineColorsTuple;
};

// What a Colour Mode supplies: the page's surfaces and text.
export type ModeNeutrals = {
	// Mantine's dark scheme reads text from dark[0], dimmed text from dark[2],
	// placeholders from dark[3], borders from dark[4], hovers from dark[5], inputs and cards
	// from dark[6] and the body from dark[7]; dark[9] is ink for text on bright fills.
	dark: MantineColorsTuple;
	surface: MantineColorsTuple;
};

// Every colour role a component may use. Components only ever use these roles, so a
// Brand Theme changes colours by giving each role its own values.
export type BrandPalette = BrandColours & ModeNeutrals;

const SHADES = 10;
const FILLED_SHADE = 6;

// A colour used only as a fill: Mantine fills with shade 6 and hovers with shade 7.
export const fillTuple = (fill: string, hover: string): MantineColorsTuple =>
	Array.from({ length: SHADES }, (_, shade) =>
		shade <= FILLED_SHADE ? fill : hover,
	) as unknown as MantineColorsTuple;
