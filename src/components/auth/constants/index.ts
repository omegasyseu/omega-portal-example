import { defaultCountries } from "react-international-phone";

export const GENDERS = [
	{
		value: "F",
		label: "Female",
	},
	{
		value: "M",
		label: "Male",
	},
	{
		value: "X",
		label: "Other",
	},
];

export const LANGS = [
	{
		id: 4084,
		isDefault: 0,
		languageCountry: "ar_SA",
		language: {
			iso2Code: "ar",
			name: "Arabic",
			iso3Code: "ara",
		},
	},
	{
		id: 4086,
		isDefault: 1,
		languageCountry: "en_GB",
		language: {
			iso2Code: "en",
			name: "English",
			iso3Code: "eng",
		},
	},
	{
		id: 4087,
		isDefault: 0,
		languageCountry: "ja_JP",
		language: {
			iso2Code: "ja",
			name: "Japanese",
			iso3Code: "jpn",
		},
	},
	{
		id: 4088,
		isDefault: 0,
		languageCountry: "pt_PT",
		language: {
			iso2Code: "pt",
			name: "Portuguese",
			iso3Code: "por",
		},
	},
	{
		id: 4089,
		isDefault: 0,
		languageCountry: "th",
		language: {
			iso2Code: "th",
			name: "Thai",
			iso3Code: "tha",
		},
	},
	{
		id: 4090,
		isDefault: 0,
		languageCountry: "vi",
		language: {
			iso2Code: "vi",
			name: "Vietnamese",
			iso3Code: "vie",
		},
	},
	{
		id: 4085,
		isDefault: 0,
		languageCountry: "zh_CN",
		language: {
			iso2Code: "zh",
			name: "Chinese",
			iso3Code: "chi",
		},
	},
];

export const LANGSFormated = LANGS.map((lang) => {
	return {
		value: lang.language.iso2Code,
		label: lang.language.name,
	};
});

// TEMPINFO CONSTANT FOR LOGIN THE USER AFTER SIGNUP or QUICK sing up completion

export const TEMPINFOCOOKIE = "portal-temp-info";

export const formatedCountries = defaultCountries.map((country) => {
	return {
		value: country[1],
		label: country[0],
	};
});
