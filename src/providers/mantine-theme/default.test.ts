import { DEFAULT_THEME } from "@mantine/core";
import { describe, expect, it } from "vitest";
import { cssVariablesResolver } from "@/providers/mantine-theme/default.ts";

const { light, dark } = cssVariablesResolver(DEFAULT_THEME);

// The Brand Colours roles drawn in one colour (or a fill and its hover). Mantine draws their
// light variant with the text on its own colour in both schemes.
const SINGLE_SHADE_ROLES = ["neon", "gold", "silver", "bronze", "cta"];
// Of those, the ones bright enough to write in as they are on black.
const BRIGHT_ROLES = SINGLE_SHADE_ROLES.filter((role) => role !== "cta");

const mix = (role: string, percent: number, other: string) =>
	`color-mix(in srgb, var(--mantine-color-${role}-filled) ${percent}%, ${other})`;
const tint = (role: string) => mix(role, 15, "transparent");
const hoverTint = (role: string) => mix(role, 22, "transparent");
const darkened = (role: string) => mix(role, 50, "var(--mantine-color-black)");
const lightened = (role: string) => mix(role, 55, "var(--mantine-color-white)");

describe("Light Mode colours", () => {
	it.each(SINGLE_SHADE_ROLES)(
		"draws a light %s badge as a tint with darker text",
		(role) => {
			expect(light[`--mantine-color-${role}-light`]).toBe(tint(role));
			expect(light[`--mantine-color-${role}-light-hover`]).toBe(
				hoverTint(role),
			);
			expect(light[`--mantine-color-${role}-light-color`]).toBe(darkened(role));
		},
	);

	it("draws a light neutral badge as a grey tint with dark text", () => {
		expect(light["--mantine-color-dark-light"]).toBe(
			"color-mix(in srgb, var(--mantine-color-dark-2) 15%, transparent)",
		);
		expect(light["--mantine-color-dark-light-color"]).toBe(
			"var(--mantine-color-dark-1)",
		);
	});

	it("writes errors and danger text in the deeper red", () => {
		for (const variable of ["error", "danger-text", "danger-outline"]) {
			expect(light[`--mantine-color-${variable}`]).toBe(
				"var(--mantine-color-danger-7)",
			);
		}
	});
});

describe("Dark Mode colours", () => {
	it.each(SINGLE_SHADE_ROLES)(
		"draws a light %s badge as a faint tint",
		(role) => {
			expect(dark[`--mantine-color-${role}-light`]).toBe(tint(role));
			expect(dark[`--mantine-color-${role}-light-hover`]).toBe(hoverTint(role));
		},
	);

	it.each(BRIGHT_ROLES)(
		"writes on a light %s badge in the colour itself",
		(role) => {
			expect(dark[`--mantine-color-${role}-light-color`]).toBe(
				`var(--mantine-color-${role}-filled)`,
			);
		},
	);

	it("lightens the CTA colour wherever it is text on black", () => {
		for (const variable of ["light-color", "text", "outline"]) {
			expect(dark[`--mantine-color-cta-${variable}`]).toBe(lightened("cta"));
		}
	});

	it("writes errors and danger text in the design's Danger", () => {
		for (const variable of ["error", "danger-text", "danger-outline"]) {
			expect(dark[`--mantine-color-${variable}`]).toBe(
				"var(--mantine-color-danger-6)",
			);
		}
	});
});
