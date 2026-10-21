import { colorsTuple, type MantineColorsTuple } from "@mantine/core";
import { type BrandColours, fillTuple } from "./brand-palette.ts";
import { omegaWinsColours } from "./omega-wins-colours.ts";

// The colours of the Kambi sportsbook the portal embeds, taken from the computed styles of
// its live front end: navy carries actions, cyan marks what is active, Cash Out green the
// money actions.

// Shade 6 is Kambi's navy (its panels and buttons); shade 8 its top bar.
const brand: MantineColorsTuple = [
	"#E6EEF5",
	"#C4D6E6",
	"#9DBBD4",
	"#7099BE",
	"#4B7EAB",
	"#2A649A",
	"#004572",
	"#013A61",
	"#002B47",
	"#011E33",
];

const danger: MantineColorsTuple = [
	"#FDECEB",
	"#FBD0CD",
	"#F7A39D",
	"#F3766D",
	"#F1574C",
	"#F0473B",
	"#EF382C",
	"#D42A1F",
	"#B02219",
	"#8C1A13",
];

// The Kambi colours, the Light Theme's.
export const kambiColours: BrandColours = {
	brand,
	cta: fillTuple("#0E8668", "#0C6E55"),
	neon: colorsTuple("#00C4DE"),
	gold: colorsTuple("#FFD23A"),
	// Kambi has no podium colours of its own.
	silver: omegaWinsColours.silver,
	bronze: omegaWinsColours.bronze,
	danger,
};
