import { describe, expect, it } from "vitest";
import { toDayjsFormats } from "@/utils/ips-date-pattern.ts";

describe("toDayjsFormats", () => {
	it("reads the server's date.pattern month first", () => {
		expect(toDayjsFormats("MM-dd-yyyy HH:mm:ss")).toEqual({
			dateTime: "MM-DD-YYYY HH:mm:ss",
			date: "MM-DD-YYYY",
		});
	});

	it("reads the server's date.pattern day first", () => {
		expect(toDayjsFormats("dd-MM-yyyy HH:mm:ss")).toEqual({
			dateTime: "DD-MM-YYYY HH:mm:ss",
			date: "DD-MM-YYYY",
		});
	});

	it("assumes the time is HH:mm:ss when only the date part is set", () => {
		expect(toDayjsFormats("MM-dd-yyyy")).toEqual({
			dateTime: "MM-DD-YYYY HH:mm:ss",
			date: "MM-DD-YYYY",
		});
	});

	it("falls back to day first when no pattern is set", () => {
		const dayFirst = { dateTime: "DD-MM-YYYY HH:mm:ss", date: "DD-MM-YYYY" };
		expect(toDayjsFormats(undefined)).toEqual(dayFirst);
		expect(toDayjsFormats("")).toEqual(dayFirst);
		expect(toDayjsFormats("  ")).toEqual(dayFirst);
	});
});
