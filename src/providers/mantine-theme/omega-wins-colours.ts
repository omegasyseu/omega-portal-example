import {
	colorsTuple,
	DEFAULT_THEME,
	type MantineColorsTuple,
} from "@mantine/core";
import { type BrandColours, fillTuple } from "./brand-palette.ts";

// Omega Wins look. Shade 6 is the primary
// blue measured on the reference site.
const brand: MantineColorsTuple = [
	"#EAF4FF",
	"#D2E6FF",
	"#A9CDFF",
	"#7DB2FF",
	"#5A9EFF",
	"#4793FF",
	"#3A8DFF",
	"#3078E0",
	"#3568C2",
	"#24508F",
];

// The Omega Wins colours, the Dark Theme's.
export const omegaWinsColours: BrandColours = {
	brand,
	// The register call-to-action blue, a shade deeper than the primary.
	cta: fillTuple(brand[8], brand[9]),
	// Single-value accents: the reference site uses one shade of each.
	neon: colorsTuple("#E6FF01"),
	gold: colorsTuple("#F4C542"),
	// Second and third place on leaderboards, beside gold for first.
	silver: colorsTuple("#C7CCD6"),
	bronze: colorsTuple("#D08A4E"),
	// Destructive actions (cancel a Bonus, self-exclude) use Mantine's red, named for its role.
	danger: DEFAULT_THEME.colors.red,
};
