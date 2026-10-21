import { afterEach, describe, expect, it, vi } from "vitest";
import { formatIpsDate, parseDateString, readIpsDate } from "@/utils/date.ts";

const config = vi.hoisted(() => ({ datePattern: "" }));
vi.mock("@/server/config.ts", () => ({
	getDatePattern: () => config.datePattern,
}));

afterEach(() => {
	config.datePattern = "";
});

describe("formatIpsDate", () => {
	it("reads IPS dates day first", () => {
		expect(formatIpsDate("07-10-2026 16:19:18", "D MMM YYYY")).toBe(
			"7 Oct 2026",
		);
	});

	it("reads days above 12, which month-first parsing rejects", () => {
		expect(formatIpsDate("24-01-2020 13:28:23", "D MMM YYYY")).toBe(
			"24 Jan 2020",
		);
	});

	it("has nothing to show for a date it can't read", () => {
		expect(formatIpsDate("not a date", "D MMM YYYY")).toBeUndefined();
		expect(formatIpsDate("", "D MMM YYYY")).toBeUndefined();
	});
});

describe("IPS dates on a server whose date.pattern is month first", () => {
	it("reads a birth date month first", () => {
		config.datePattern = "MM-dd-yyyy HH:mm:ss";
		expect(readIpsDate("01-15-1990 00:00:00")).toEqual(new Date(1990, 0, 15));
	});

	it("reads a document's expiry as the date the player picked, not one rolled over", () => {
		config.datePattern = "MM-dd-yyyy HH:mm:ss";
		expect(parseDateString("12-31-2028 00:00:00")).toEqual(
			new Date(2028, 11, 31),
		);
	});

	it("formats a month-first date", () => {
		config.datePattern = "MM-dd-yyyy";
		expect(formatIpsDate("10-04-2026 11:14:39", "D MMM YYYY")).toBe(
			"4 Oct 2026",
		);
	});
});
