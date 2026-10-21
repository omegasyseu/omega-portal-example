import { defaultCountries, parseCountry } from "react-international-phone";
import { describe, expect, it } from "vitest";
import { searchCountries } from "./country-search";

const countries = defaultCountries.map((country) => parseCountry(country));
const names = (query: string) =>
	searchCountries(countries, query).map((country) => country.name);

describe("searchCountries", () => {
	it("lists every country until the player types", () => {
		expect(searchCountries(countries, "")).toHaveLength(countries.length);
		expect(searchCountries(countries, "  ")).toHaveLength(countries.length);
	});

	it("finds a country by its name, whatever the case", () => {
		expect(names("germ")).toEqual(["Germany"]);
		expect(names("UNITED KING")).toEqual(["United Kingdom"]);
	});

	it("puts countries whose name starts with the search first", () => {
		const united = names("united");
		expect(united.slice(0, 3)).toEqual(
			expect.arrayContaining(["United Kingdom", "United States"]),
		);
	});

	it("finds a country by its dial code, with or without the +", () => {
		expect(names("44")).toContain("United Kingdom");
		expect(names("+44")).toContain("United Kingdom");
		expect(names("+1")[0]).toBe("United States");
	});

	it("lists longer dial codes in order while the code is only partly typed", () => {
		expect(names("+3").slice(0, 2)).toEqual(["Greece", "Netherlands"]);
	});

	it("finds a country whose name has accents without typing them", () => {
		expect(names("curacao")).toEqual(["Curaçao"]);
		expect(names("cote")).toEqual(["Côte d'Ivoire"]);
		expect(names("sao tome")).toEqual(["São Tomé and Príncipe"]);
	});

	it("finds a country by its two-letter code", () => {
		expect(names("de")[0]).toBe("Germany");
	});
});
