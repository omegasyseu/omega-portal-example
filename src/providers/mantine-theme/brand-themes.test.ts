import { describe, expect, it } from "vitest";
import { brandThemeFor } from "./brand-themes.ts";
import { darkMode, lightMode } from "./colour-modes.ts";
import { kambiColours } from "./kambi-colours.ts";
import { omegaWinsColours } from "./omega-wins-colours.ts";

describe("brandThemeFor", () => {
	it("gives a Brand without a theme the Dark Theme", () => {
		expect(brandThemeFor(undefined).name).toBe("DARK");
		expect(brandThemeFor("").name).toBe("DARK");
	});

	it("gives a LIGHT Brand the Light Theme, however it is typed", () => {
		expect(brandThemeFor("LIGHT").name).toBe("LIGHT");
		expect(brandThemeFor(" light ").name).toBe("LIGHT");
	});

	it("falls back to the Dark Theme for a theme it doesn't know", () => {
		expect(brandThemeFor("KAMBI").name).toBe("DARK");
	});

	it("makes the Dark Theme the Omega Wins colours in Dark Mode", () => {
		const theme = brandThemeFor("DARK");
		expect(theme.colourMode).toBe(darkMode);
		expect(theme.colours).toBe(omegaWinsColours);
	});

	it("makes the Light Theme the Kambi colours in Light Mode", () => {
		const theme = brandThemeFor("LIGHT");
		expect(theme.colourMode).toBe(lightMode);
		expect(theme.colours).toBe(kambiColours);
	});

	it("takes surfaces and text from the Colour Mode and accents from the Brand Colours", () => {
		const { palette } = brandThemeFor("LIGHT");
		expect(palette.dark).toBe(lightMode.dark);
		expect(palette.surface).toBe(lightMode.surface);
		expect(palette.brand).toBe(kambiColours.brand);
		expect(palette.neon).toBe(kambiColours.neon);
	});

	it("colours the browser chrome like the header: the page in Dark Mode, the brand's deepest navy in Light Mode", () => {
		expect(brandThemeFor("DARK").browserColour).toBe("#101012");
		expect(brandThemeFor("LIGHT").browserColour).toBe("#002B47");
	});
});
