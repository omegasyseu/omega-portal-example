import { colorsTuple, type MantineColorsTuple } from "@mantine/core";
import type { BrandColours, ModeNeutrals } from "./brand-palette.ts";

export type ColourModeName = "DARK" | "LIGHT";

// A Colour Mode (GLOSSARY.md): whether the page is dark or light. It supplies the
// surfaces and text; the Brand Colours supply the accents.
export type ColourMode = ModeNeutrals & {
	name: ColourModeName;
	// The Mantine colour scheme the page is drawn in.
	scheme: "dark" | "light";
	// The browser's tab and address-bar colour, which matches the header.
	browserColour: (colours: BrandColours) => string;
};

const DARK_LADDER: MantineColorsTuple = [
	"#FFFFFF",
	"#C3C2CC",
	"#8A8F9C",
	"#5C6373",
	"#1C2330",
	"#1A1E26",
	"#14181F",
	"#101012",
	"#0C0C0E",
	"#08080A",
];

const BODY = 7;

// The Omega Wins cabinet: near-black body, raised panels such as the sidebar between the
// body and the inputs. The header is the body.
export const darkMode: ColourMode = {
	name: "DARK",
	scheme: "dark",
	dark: DARK_LADDER,
	surface: colorsTuple("#161618"),
	browserColour: () => DARK_LADDER[BODY],
};

// The components' own styles read the same ladder in both modes (dark-0 is text, dark-6
// cards and fields), so Light Mode fills it with dark text and light surfaces; default.ts
// points Mantine's light scheme at it. Measured on the Kambi sportsbook: light grey page,
// white cards and fields.
const LIGHT_LADDER: MantineColorsTuple = [
	"#2D3032",
	"#4D4D4D",
	"#6C6C6C",
	"#767676",
	"#E4E4E4",
	"#EEF1F4",
	"#FFFFFF",
	"#F6F6F7",
	"#ECEDEF",
	"#00272C",
];

const BRAND_DEEPEST = 8;

// A light page under a shell (header, sidebar, phone menu, bottom nav) in the brand's
// deepest shade, so the header and browser chrome carry the brand.
export const lightMode: ColourMode = {
	name: "LIGHT",
	scheme: "light",
	dark: LIGHT_LADDER,
	surface: colorsTuple("#FFFFFF"),
	browserColour: ({ brand }) => brand[BRAND_DEEPEST],
};
