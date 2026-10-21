import {
	Card,
	type CSSVariablesResolver,
	createTheme,
	DEFAULT_THEME,
	isLightColor,
	mergeMantineTheme,
	Notification,
} from "@mantine/core";
import type { BrandPalette } from "@/providers/mantine-theme/brand-palette.ts";
import { OmegaButton } from "@/providers/mantine-theme/mantine-button";

const FONT_FAMILY =
	"'Outfit Variable', BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji";

// A toast's icon sits on the toast's colour: ink on light fills such as neon and gold,
// white on dark ones such as a navy brand. The threshold counts the Omega Wins blue as light.
const TOAST_FILL_SHADE = 6;
const LIGHT_FILL_LUMINANCE = 0.2;

// Type, radius and components are the same for every Brand Theme; only the palette changes.
const themeOverrideFor = (palette: BrandPalette) =>
	createTheme({
		primaryColor: "brand",
		primaryShade: 6,
		colors: palette,
		fontFamily: FONT_FAMILY,
		headings: {
			fontFamily: FONT_FAMILY,
			fontWeight: "700",
			sizes: {
				h1: {
					fontSize: "calc(3rem * var(--mantine-scale))",
					lineHeight: "1.2",
				},
				h2: {
					fontSize: "calc(40px * var(--mantine-scale))",
					lineHeight: "1.35",
					fontWeight: "500",
				},
				h3: {
					fontSize: "calc(1.375rem * var(--mantine-scale))",
					lineHeight: "1.4",
				},
				h4: {
					fontSize: "calc(1.125rem * var(--mantine-scale))",
					lineHeight: "1.45",
				},
				h5: {
					fontSize: "calc(1rem * var(--mantine-scale))",
					lineHeight: "1.5",
				},
				h6: {
					fontSize: "calc(0.875rem * var(--mantine-scale))",
					lineHeight: "1.5",
				},
			},
		},
		// Controls use md (8px); cards and game tiles use lg (16px).
		radius: {
			xs: "calc(0.25rem * var(--mantine-scale))",
			sm: "calc(0.375rem * var(--mantine-scale))",
			md: "calc(0.5rem * var(--mantine-scale))",
			lg: "calc(1rem * var(--mantine-scale))",
			xl: "calc(1.5rem * var(--mantine-scale))",
		},
		defaultRadius: "md",
		// Modal, drawer and menu transitions follow prefers-reduced-motion.
		respectReducedMotion: true,

		other: {},
		// OWN COMPONENTS THAT WE CAN CHANGE CSS and use Variant
		components: {
			Button: OmegaButton,
			Card: Card.extend({ defaultProps: { radius: "lg" } }),
			Notification: Notification.extend({
				styles: (theme, { color }) => {
					const fill =
						theme.colors[color ?? theme.primaryColor]?.[TOAST_FILL_SHADE];
					const isLightFill =
						fill === undefined || isLightColor(fill, LIGHT_FILL_LUMINANCE);
					return {
						icon: {
							color: isLightFill
								? "var(--mantine-color-dark-9)"
								: "var(--mantine-color-white)",
						},
					};
				},
			}),
		},
	});

export const mantineThemeFor = (palette: BrandPalette) =>
	mergeMantineTheme(DEFAULT_THEME, themeOverrideFor(palette));

const filled = (role: string) => `var(--mantine-color-${role}-filled)`;
const mixed = (role: string, percent: number, other: string) =>
	`color-mix(in srgb, ${filled(role)} ${percent}%, ${other})`;

// How much of the colour is kept when it is darkened for white pages, or lightened for a
// colour too dark to read on black (the Omega Wins CTA blue).
const DARKENED_PERCENT = 50;
const LIGHTENED_PERCENT = 55;
const darkened = (role: string) =>
	mixed(role, DARKENED_PERCENT, "var(--mantine-color-black)");
const lightened = (role: string) =>
	mixed(role, LIGHTENED_PERCENT, "var(--mantine-color-white)");

// The light variant (badges, alerts, and the hover and text of subtle buttons). These roles
// are one colour (or a fill and its hover) throughout, so Mantine's own variant puts the
// text on its own colour: the light scheme fills with shade 1 and writes in shade 9, the
// dark scheme fills with the colour darkened and writes in shade 0. In both modes they get
// a faint tint of the colour instead, with text that stands off the page: darkened on
// white, the colour itself (or lightened) on black.
const LIGHT_TINT_PERCENT = 15;
const LIGHT_TINT_HOVER_PERCENT = 22;
const tinted = (role: string, percent: number) =>
	mixed(role, percent, "transparent");
const lightVariant = (role: string, text: string) => ({
	[`--mantine-color-${role}-light`]: tinted(role, LIGHT_TINT_PERCENT),
	[`--mantine-color-${role}-light-hover`]: tinted(
		role,
		LIGHT_TINT_HOVER_PERCENT,
	),
	[`--mantine-color-${role}-light-color`]: text,
});

// The signals (neon, gold) also glow as plain text and outlines on black, too faint on
// white, so those are darkened too.
const signal = (role: string) => ({
	[`--mantine-color-${role}-text`]: darkened(role),
	[`--mantine-color-${role}-outline`]: darkened(role),
	...lightVariant(role, darkened(role)),
});

// A neutral light badge (the ladder, "dark"): Mantine's light scheme would fill it with
// ladder shade 1, the dark text grey, so it gets a tint of the dimmed grey instead.
const NEUTRAL_TINT = "var(--mantine-color-dark-2)";
const neutralLightVariant = {
	"--mantine-color-dark-light": `color-mix(in srgb, ${NEUTRAL_TINT} ${LIGHT_TINT_PERCENT}%, transparent)`,
	"--mantine-color-dark-light-hover": `color-mix(in srgb, ${NEUTRAL_TINT} ${LIGHT_TINT_HOVER_PERCENT}%, transparent)`,
	"--mantine-color-dark-light-color": "var(--mantine-color-dark-1)",
};

// The roles bright enough to write in as they are on black.
const BRIGHT_ROLES = ["neon", "gold", "silver", "bronze"];
const brightOnBlack = Object.assign(
	{},
	...BRIGHT_ROLES.map((role) => lightVariant(role, filled(role))),
);

// The CTA blue is too dark as text on black wherever it is used as text.
const ctaOnBlack = {
	...lightVariant("cta", lightened("cta")),
	"--mantine-color-cta-text": lightened("cta"),
	"--mantine-color-cta-outline": lightened("cta"),
};

// Error and danger text: Mantine's own red and the brand's shade 6 are too faint on white;
// on black, Mantine's red 8 is too dark and its danger text a pink, so they take the
// design's Danger, shade 6.
const dangerIn = (shade: string) => ({
	"--mantine-color-error": shade,
	"--mantine-color-danger-text": shade,
	"--mantine-color-danger-outline": shade,
});

// Light Mode draws the page in Mantine's light scheme, whose own text, surfaces and borders
// are greys; they are pointed at the palette's ladder (colour-modes.ts) so Mantine's
// components match the portal's own. Signal colours made to glow on black are too faint
// as text or outlines on white, so those are darkened. The dark scheme keeps Mantine's own
// but for the light variant and errors.
export const cssVariablesResolver: CSSVariablesResolver = () => ({
	variables: {},
	light: {
		"--mantine-color-body": "var(--mantine-color-dark-7)",
		"--mantine-color-text": "var(--mantine-color-dark-0)",
		"--mantine-color-bright": "var(--mantine-color-dark-0)",
		"--mantine-color-dimmed": "var(--mantine-color-dark-2)",
		"--mantine-color-placeholder": "var(--mantine-color-dark-3)",
		"--mantine-color-default": "var(--mantine-color-dark-6)",
		"--mantine-color-default-hover": "var(--mantine-color-dark-5)",
		"--mantine-color-default-color": "var(--mantine-color-dark-0)",
		"--mantine-color-default-border": "var(--mantine-color-dark-4)",
		...signal("neon"),
		...signal("gold"),
		...lightVariant("silver", darkened("silver")),
		...lightVariant("bronze", darkened("bronze")),
		...lightVariant("cta", darkened("cta")),
		...neutralLightVariant,
		...dangerIn("var(--mantine-color-danger-7)"),
	},
	dark: {
		...brightOnBlack,
		...ctaOnBlack,
		...dangerIn("var(--mantine-color-danger-6)"),
	},
});
