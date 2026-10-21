import type { ParsedCountry } from "react-international-phone";

// How closely a country matches, best first: its two-letter code, then its name's start,
// then the start of a later word ("kingdom"), then anywhere in its name.
const ISO2 = 0;
const NAME_START = 1;
const WORD_START = 2;
const NAME_PART = 3;
const NO_MATCH = Number.POSITIVE_INFINITY;

// Lower case without accents, so "curacao" finds Curaçao.
const plain = (text: string) =>
	text
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase();

const textRank = (country: ParsedCountry, query: string) => {
	const name = plain(country.name);
	if (country.iso2 === query) return ISO2;
	if (name.startsWith(query)) return NAME_START;
	if (name.split(/[\s-]+/).some((word) => word.startsWith(query))) {
		return WORD_START;
	}
	return name.includes(query) ? NAME_PART : NO_MATCH;
};

// Countries the library gives no priority come after those it does.
const NO_PRIORITY = 999;
// Above every exact dial code's rank, so the longer codes come after them.
const LONGER_CODES = 100_000;

// A dial code typed with or without its "+": the exact code first, countries that share it
// in the library's priority (+1: United States first), then longer codes in order (+3:
// Greece +30, the Netherlands +31…).
const dialRank = (country: ParsedCountry, digits: string) => {
	if (!country.dialCode.startsWith(digits)) return NO_MATCH;
	return country.dialCode === digits
		? (country.priority ?? NO_PRIORITY)
		: LONGER_CODES + Number(country.dialCode);
};

// The countries the player's search finds, best match first; all of them, in the
// library's order, until something is typed.
export const searchCountries = (
	countries: readonly ParsedCountry[],
	search: string,
) => {
	const query = plain(search.trim());
	if (!query) return [...countries];
	const digits = query.replace(/^\+/, "");
	const isDialCode = /^\d+$/.test(digits);
	return countries
		.map((country, index) => ({
			country,
			index,
			rank: isDialCode ? dialRank(country, digits) : textRank(country, query),
		}))
		.filter(({ rank }) => rank !== NO_MATCH)
		.sort((a, b) => a.rank - b.rank || a.index - b.index)
		.map(({ country }) => country);
};
