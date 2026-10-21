import type { MantineColor } from "@mantine/core";

// A status with no colour of its own (Under Review, Not Verified, an expired document).
// Plain "dark" would read as near-black, since the theme's dark scale starts from white.
export const NEUTRAL_BADGE_COLOR: MantineColor = "dark.2";

// The same, for a light (tinted) badge. Given a shade such as dark.2, that variant fills
// with the shade itself and can't be read in either Colour Mode; the whole ladder gives a
// dark fill under white in Dark Mode and a grey tint under dark text in Light Mode
// (default.ts).
export const NEUTRAL_LIGHT_BADGE_COLOR: MantineColor = "dark";
