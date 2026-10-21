import { describe, expect, it } from "vitest";
import { z } from "zod";
import { searchValue } from "@/schemas-types/search-value";

const schema = z.object({ code: searchValue });

describe("searchValue", () => {
	it("keeps text", () => {
		expect(schema.parse({ code: "AB12" })).toEqual({ code: "AB12" });
	});

	// The router's default search parser reads ?code=12345 as the number 12345.
	// It stays a number: the router rewrites the URL when validation changes a
	// value, and a string would show up as ?code="12345".
	it("keeps a numeric value as a number", () => {
		expect(schema.parse({ code: 12345 })).toEqual({ code: 12345 });
	});

	it("is undefined when the URL has no value", () => {
		expect(schema.parse({})).toEqual({ code: undefined });
	});

	it.each([{ a: 1 }, [1], true, null])(
		"reads %j as missing instead of failing the route",
		(code) => {
			expect(schema.parse({ code })).toEqual({ code: undefined });
		},
	);
});
