import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
	address,
	city,
	codeSchema,
	country,
	currencies,
	firstName,
	gender,
	langCode,
	lastName,
	postalCode,
	province,
	streetNumber,
} from "@/schemas-types/auth/signup";

const firstError = (schema: z.ZodTypeAny, value: unknown) => {
	const result = schema.safeParse(value);
	return result.success ? null : result.error.issues[0]?.message;
};

describe("signup field schemas", () => {
	it.each([
		["currency", currencies, "Currency is required"],
		["first name", firstName, "First name is required"],
		["last name", lastName, "Last name is required"],
		["gender", gender, "Select a gender"],
		["language", langCode, "Language is required"],
		["address", address, "Address is required"],
		["city", city, "City is required"],
		["postal code", postalCode, "Postal code is required"],
		["country", country, "Country is required"],
		["street number", streetNumber, "Street number is required"],
		["province", province, "Province is required"],
	])("requires a %s", (_name, schema, message) => {
		expect(firstError(schema, undefined)).toBe(message);
	});

	it.each([
		[
			"currency that is not a 3-letter code",
			currencies,
			"EU",
			"Please select one of the options",
		],
		[
			"one-letter first name",
			firstName,
			"A",
			"Name must be at least 2 characters",
		],
		["empty gender", gender, "", "Please select one of the options"],
		["unknown gender", gender, "Q", "Please select a gender"],
		["one-letter city", city, "A", "City must be at least 2 characters"],
	])("rejects a %s", (_name, schema, value, message) => {
		expect(firstError(schema, value)).toBe(message);
	});

	it.each(["F", "M", "X"])("accepts gender %s", (value) => {
		expect(firstError(gender, value)).toBeNull();
	});
});

describe("codeSchema", () => {
	const codeError = (confirmationCode: string) =>
		firstError(codeSchema, { confirmationCode });

	it("accepts a code of the length the brand sends, 4 digits or more", () => {
		expect(codeError("4821")).toBeNull();
		expect(codeError("482916")).toBeNull();
		expect(codeError("48291637")).toBeNull();
	});

	it("asks for a code until at least 4 digits are entered", () => {
		expect(codeError("482")).toBe("Please enter a valid code");
	});
});
