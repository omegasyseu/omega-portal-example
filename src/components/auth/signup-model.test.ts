import { describe, expect, it } from "vitest";
import {
	adultBirthYear,
	birthDateFrom,
	birthDatePartsOf,
	birthYears,
	consentedVersionsFor,
	daysInMonth,
	formatBirthDate,
	isAdult,
	isCredentialTaken,
	mandatoryConsents,
	toCompletionRequest,
	toQuickSignupRequest,
	toSignupRequest,
} from "./signup-model";

describe("daysInMonth", () => {
	it("knows short months and leap years", () => {
		expect(daysInMonth(1, 2000)).toBe(31);
		expect(daysInMonth(4, 2000)).toBe(30);
		expect(daysInMonth(2, 2000)).toBe(29);
		expect(daysInMonth(2, 1999)).toBe(28);
	});

	it("allows 31 days until the month is chosen", () => {
		expect(daysInMonth(undefined, undefined)).toBe(31);
		expect(daysInMonth(2, undefined)).toBe(29);
	});
});

describe("birthYears", () => {
	it("offers every year from this one back to 1900, newest first", () => {
		const years = birthYears(new Date(2026, 9, 4));
		expect(years[0]).toBe("2026");
		expect(years[years.length - 1]).toBe("1900");
		expect(years).toHaveLength(127);
	});
});

describe("adultBirthYear", () => {
	it("is the year someone turning 18 this year was born", () => {
		expect(adultBirthYear(new Date(2026, 9, 4))).toBe("2008");
	});
});

describe("birthDateFrom", () => {
	it("builds the date once month, day and year are all chosen", () => {
		expect(birthDateFrom({ month: "2", day: "29", year: "2000" })).toEqual(
			new Date(2000, 1, 29),
		);
	});

	it("gives nothing while a part is missing or the day doesn't exist", () => {
		expect(
			birthDateFrom({ month: "2", day: "", year: "2000" }),
		).toBeUndefined();
		expect(
			birthDateFrom({ month: "2", day: "30", year: "2000" }),
		).toBeUndefined();
	});
});

describe("birthDatePartsOf", () => {
	it("splits a date into the three selects' values", () => {
		expect(birthDatePartsOf(new Date(1988, 5, 21))).toEqual({
			month: "6",
			day: "21",
			year: "1988",
		});
	});

	it("leaves the selects empty without a date", () => {
		expect(birthDatePartsOf(undefined)).toEqual({
			month: "",
			day: "",
			year: "",
		});
	});

	it("leaves the selects empty for a date that isn't one", () => {
		expect(birthDatePartsOf(new Date("not a date"))).toEqual({
			month: "",
			day: "",
			year: "",
		});
	});
});

describe("formatBirthDate", () => {
	it("writes the selects' date the way IPS reads it", () => {
		expect(formatBirthDate({ month: "6", day: "1", year: "1988" })).toBe(
			"1988-06-01",
		);
	});

	it("has no date while a select is empty", () => {
		expect(
			formatBirthDate({ month: "6", day: "", year: "1988" }),
		).toBeUndefined();
	});
});

describe("isAdult", () => {
	const TODAY = new Date(2026, 9, 3);

	it("counts 18 years to the day", () => {
		expect(isAdult(new Date(2008, 9, 3), TODAY)).toBe(true);
		expect(isAdult(new Date(2008, 9, 4), TODAY)).toBe(false);
	});
});

describe("isCredentialTaken", () => {
	it("reads checkCredential's answer", () => {
		expect(
			isCredentialTaken({
				status: "SUCCESS",
				exists: "true",
				fieldExist: true,
			}),
		).toBe(true);
		expect(
			isCredentialTaken({
				status: "SUCCESS",
				exists: "false",
				fieldExist: false,
			}),
		).toBe(false);
	});
});

describe("consentedVersionsFor", () => {
	const consents = [
		{ key: "MANDATORY", consentVersionId: 77 },
		{ key: "MARKETING", consentVersionId: 9 },
	];

	it("lists the versions of the consents the player ticked", () => {
		expect(
			consentedVersionsFor(
				{ acceptTerms: true, acceptMarketing: true },
				consents,
			),
		).toBe("77,9");
		expect(
			consentedVersionsFor(
				{ acceptTerms: true, acceptMarketing: false },
				consents,
			),
		).toBe("77");
		expect(
			consentedVersionsFor({ acceptTerms: false, acceptMarketing: false }, []),
		).toBeUndefined();
	});
});

describe("mandatoryConsents", () => {
	it("makes marketing mandatory only when the brand says so", () => {
		expect(
			mandatoryConsents([{ key: "MARKETING", isMandatory: false }, undefined]),
		).toEqual({ isMarketingMandatory: false });
		expect(
			mandatoryConsents([{ key: "MARKETING", isMandatory: true }]),
		).toEqual({ isMarketingMandatory: true });
	});
});

describe("toSignupRequest", () => {
	const values = {
		email: "player@example.com",
		password: "Secret123",
		firstName: "Ada",
		lastName: "Lovelace",
		username: "adalove",
		birthMonth: "12",
		birthDay: "10",
		birthYear: "1990",
		address: "1 Main St",
		city: "Toronto",
		country: "ca",
		province: "ON",
		postalCode: "M5V 2T6",
		mobile: "+14165550142",
		currency: "EUR",
		secondaryCurrencies: "",
		verificationTarget: "email",
		referralCode: "",
		acceptTerms: true,
		acceptMarketing: false,
	};

	it("opens the account in the Selected Brand, sends the date as YYYY-MM-DD, the mobile without +, and leaves out empty values", () => {
		expect(
			toSignupRequest(values, {
				brandId: "1",
				isSocialBrand: false,
				consentedVersions: "77",
			}),
		).toEqual({
			brandId: "1",
			email: "player@example.com",
			password: "Secret123",
			firstName: "Ada",
			lastName: "Lovelace",
			username: "adalove",
			birthDate: "1990-12-10",
			address: "1 Main St",
			city: "Toronto",
			country: "ca",
			province: "ON",
			postalCode: "M5V 2T6",
			mobile: "14165550142",
			currency: "EUR",
			verificationTarget: "email",
			consentedVersions: "77",
		});
	});

	it("sends no currency on a social brand", () => {
		const request = toSignupRequest(values, {
			brandId: "1",
			isSocialBrand: true,
			consentedVersions: undefined,
		});
		expect(request).not.toHaveProperty("currency");
		expect(request).not.toHaveProperty("consentedVersions");
	});
});

describe("toCompletionRequest", () => {
	it("sends the details quickSignupCompletion asks for, without empty ones", () => {
		expect(
			toCompletionRequest({
				firstName: "Ada",
				lastName: "Lovelace",
				address: "1 Main St",
				city: "Toronto",
				country: "ca",
				province: "",
				postalCode: "M5V 2T6",
			}),
		).toEqual({
			firstName: "Ada",
			lastName: "Lovelace",
			address: "1 Main St",
			city: "Toronto",
			country: "ca",
			postalCode: "M5V 2T6",
		});
	});
});

describe("toQuickSignupRequest", () => {
	it("sends the quick sign-up fields in the Selected Brand, the date as YYYY-MM-DD and no empty referral code", () => {
		expect(
			toQuickSignupRequest(
				{
					username: "adalove",
					email: "player@example.com",
					mobile: "+14165550142",
					password: "Secret123",
					birthMonth: "1",
					birthDay: "5",
					birthYear: "1991",
					verificationTarget: "email",
					referralCode: "",
					acceptTerms: false,
					acceptMarketing: false,
				},
				{ brandId: "1", consentedVersions: undefined },
			),
		).toEqual({
			brandId: "1",
			username: "adalove",
			email: "player@example.com",
			mobile: "14165550142",
			password: "Secret123",
			birthDate: "1991-01-05",
			verificationTarget: "email",
		});
	});
});
