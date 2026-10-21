/// <reference types="node" />
// The guard reads the source tree, so this one test uses Node's file APIs.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

// Every colour comes from the Mantine theme. This guard
// fails when a raw colour or a colour outside the theme reappears in a component or CSS
// module; the palette files under providers/mantine-theme are where colours belong.

const SRC = import.meta.dirname;
const ALLOWED = [
	"providers/mantine-theme/",
	"routeTree.gen.ts",
	"theme-colour-guard.test.ts",
];

// Mantine's own palettes and the previous design's: components use the theme's roles
// (brand, cta, neon, gold, silver, bronze, surface, danger, dark) instead.
const OUTSIDE_PALETTES = [
	"white",
	"black",
	"red",
	"pink",
	"grape",
	"violet",
	"indigo",
	"blue",
	"cyan",
	"teal",
	"green",
	"lime",
	"yellow",
	"orange",
	"gray",
	"grey",
	"peri",
	"midnight",
	"omegaLight",
	"sky",
	"rouge",
	"horizon",
].join("|");

// CSS's own colour names that a stylesheet might reach for instead of a token.
const CSS_COLOUR_NAMES =
	"white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|gold|silver|cyan|teal|navy|maroon";
const SHADE = "(?:\\.\\d+)?";

// No /g flag: each rule tests one line at a time, so nothing carries over between lines.
const RULES: { name: string; pattern: RegExp }[] = [
	{ name: "hex colour", pattern: /(?<![&\w])#[0-9a-fA-F]{3,8}\b(?![-\w])/ },
	{
		name: "functional colour",
		pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i,
	},
	{
		// Props such as c="white", color={"blue.5"}, or a ternary that picks one.
		name: "colour prop outside the theme",
		pattern: new RegExp(
			`\\b(?:c|color|bg|fill|stroke)=\\{?[^}>]*?[\x60"'](?:${OUTSIDE_PALETTES})${SHADE}[\x60"']`,
			"i",
		),
	},
	{
		// Options and style objects: { color: "green" }, { backgroundColor: "red" }, gradient from/to.
		name: "colour option outside the theme",
		pattern: new RegExp(
			`\\b(?:color|backgroundColor|background|borderColor|from|to):\\s*[\x60"'](?:${OUTSIDE_PALETTES})${SHADE}[\x60"']`,
			"i",
		),
	},
	{
		// Helpers and ternaries that hand back a colour name: return "teal", cond ? "red" : x.
		name: "colour value outside the theme",
		pattern: new RegExp(
			`(?:\\breturn|\\?)\\s*[\x60"'](?:${OUTSIDE_PALETTES})${SHADE}[\x60"']`,
			"i",
		),
	},
	{
		name: "border prop outside the theme",
		pattern: new RegExp(`\\bbd=["'][^"']*\\b(?:${CSS_COLOUR_NAMES})\\b`, "i"),
	},
	{
		name: "theme palette outside the roles",
		pattern: new RegExp(`\\btheme\\.colors\\.(?:${OUTSIDE_PALETTES})\\b`, "i"),
	},
	{
		// --mantine-color-white and -black are the theme's own, for shadows and overlays.
		name: "colour variable outside the theme",
		pattern: new RegExp(
			`--mantine-color-(?:${OUTSIDE_PALETTES.replace("white|black|", "")})(?:-\\d|-filled|-light|-text)?\\b`,
			"i",
		),
	},
	{
		// Quoted values are JS options, which the option rule checks against the theme's roles.
		name: "named CSS colour",
		pattern: new RegExp(
			`(?:^|[;{\\s])(?:color|background(?:-color|-image)?|border(?:-[a-z]+)?|fill|stroke|outline(?:-color)?|box-shadow|text-shadow|caret-color|text-decoration-color):(?!\\s*[\x60"'])[^;{}]*(?<![-\\w])(?:${CSS_COLOUR_NAMES})\\b`,
			"i",
		),
	},
];

type ColourViolation = { file: string; line: number; rule: string };

// The colours a file uses that don't come from the theme.
const findColourViolations = (file: string, text: string): ColourViolation[] =>
	text.split("\n").flatMap((lineText, index) =>
		RULES.filter(({ pattern }) => pattern.test(lineText)).map(({ name }) => ({
			file,
			line: index + 1,
			rule: name,
		})),
	);

const sourceFiles = (dir: string): string[] =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) {
			return sourceFiles(path);
		}
		return /\.(tsx?|css)$/.test(name) ? [path] : [];
	});

describe("findColourViolations", () => {
	it("flags raw colours", () => {
		expect(
			findColourViolations("a.css", ".a { color: #1A1C20; }").map(
				(v) => v.rule,
			),
		).toEqual(["hex colour"]);
		expect(
			findColourViolations("a.css", "box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);"),
		).toHaveLength(1);
	});

	it("flags colour props and options outside the theme", () => {
		expect(findColourViolations("a.tsx", '<Text c="white">')).toHaveLength(1);
		expect(
			findColourViolations("a.tsx", '<Button color="blue.5">'),
		).toHaveLength(1);
		expect(
			findColourViolations("a.tsx", 'notifications.show({ color: "green" })'),
		).toHaveLength(1);
		expect(
			findColourViolations(
				"a.css",
				"color: var(--mantine-color-omegaLight-9);",
			),
		).toHaveLength(1);
	});

	it("flags colours hidden in other forms", () => {
		for (const line of [
			".a { color: red; }",
			".a { box-shadow: 0 0 4px Black; }",
			"color: oklch(0.7 0.1 200);",
			'<Text c={isActive ? "white" : "dark.1"}>',
			'<Button color="red.10">',
			'style={{ backgroundColor: "red" }}',
			'gradient={{ from: "blue", to: "dark.6" }}',
			'<Box bd="1px solid red">',
			"theme.colors.blue[6]",
			'		return "teal";',
			'const tone = isError ? "red" : base;',
		]) {
			expect(findColourViolations("a.tsx", line)).not.toEqual([]);
		}
	});

	it("accepts the theme's own colours", () => {
		expect(
			findColourViolations(
				"a.tsx",
				'<Text c="dark.1"><Button color="neon"><Badge color="danger">',
			),
		).toEqual([]);
		expect(
			findColourViolations(
				"a.css",
				"color: var(--mantine-color-dark-0); border: 1px solid alpha(var(--mantine-color-gold-filled), 0.2);",
			),
		).toEqual([]);
		expect(
			findColourViolations(
				"a.css",
				"background-color: var(--mantine-color-black); color: var(--mantine-color-white);",
			),
		).toEqual([]);
	});

	it("ignores things that only look like colours", () => {
		expect(
			findColourViolations("a.tsx", '<a href="#main">&#39;<div id="add">'),
		).toEqual([]);
	});
});

describe("the colour guard", () => {
	it("finds no colour outside the theme in src", () => {
		const violations = sourceFiles(SRC)
			.map((path) => relative(SRC, path))
			.filter((file) => !ALLOWED.some((allowed) => file.startsWith(allowed)))
			.flatMap((file) =>
				findColourViolations(file, readFileSync(join(SRC, file), "utf8")),
			)
			.map(({ file, line, rule }) => `${file}:${line} ${rule}`);

		expect(violations).toEqual([]);
	});
});
