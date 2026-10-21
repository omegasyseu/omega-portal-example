import { describe, expect, it } from "vitest";
import { storedBirthDate } from "./stored-birth-date";

describe("storedBirthDate", () => {
	it("splits the date IPS stores into the selects' values", () => {
		expect(storedBirthDate("22-06-1988 00:00:00")).toEqual({
			month: "6",
			day: "22",
			year: "1988",
		});
	});

	it("leaves the selects empty when no date is stored", () => {
		const empty = { month: "", day: "", year: "" };
		expect(storedBirthDate(undefined)).toEqual(empty);
		expect(storedBirthDate(null)).toEqual(empty);
		expect(storedBirthDate("")).toEqual(empty);
	});
});

describe("storedBirthDate with a date it can't read", () => {
	it("leaves the selects empty rather than showing today", () => {
		expect(storedBirthDate("not a date")).toEqual({
			month: "",
			day: "",
			year: "",
		});
	});
});
