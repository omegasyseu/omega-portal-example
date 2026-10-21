import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import {
	birthDate,
	email,
	mobile,
	passwordSchema,
	username,
	verificationTarget,
} from "@/schemas-types/auth/general";

const firstError = (schema: z.ZodTypeAny, value: unknown) => {
	const result = schema.safeParse(value);
	return result.success ? null : result.error.issues[0]?.message;
};

describe("auth field schemas", () => {
	it.each([
		["password", passwordSchema, "Password is required"],
		["email", email, "Email is required"],
		["username", username, "Username is required"],
		["mobile", mobile, "Number is required"],
		[
			"verification target",
			verificationTarget,
			"Please select one of the options",
		],
		["birth date", birthDate, "Birth date is required"],
	])("requires a %s", (_name, schema, message) => {
		expect(firstError(schema, undefined)).toBe(message);
	});

	it.each([
		[
			"short password",
			passwordSchema,
			"12345",
			"Password must be at least 6 characters",
		],
		[
			"long password",
			passwordSchema,
			"a".repeat(17),
			"Password must be at most 16 characters",
		],
		["malformed email", email, "not-an-email", "Email must be a valid email"],
		[
			"short username",
			username,
			"abc",
			"Username must be at least 6 characters",
		],
		["short mobile", mobile, "123", "Please enter a valid  number"],
		[
			"unknown verification target",
			verificationTarget,
			"fax",
			"Please select one of the options",
		],
		[
			"birth date that is not a date",
			birthDate,
			"1990-01-01",
			"Birth date is required",
		],
	])("rejects a %s", (_name, schema, value, message) => {
		expect(firstError(schema, value)).toBe(message);
	});

	it.each([
		["password", passwordSchema, "secret1"],
		["email", email, "player@example.com"],
		["username", username, "player1"],
		["verification target", verificationTarget, "email"],
	])("accepts a valid %s", (_name, schema, value) => {
		expect(firstError(schema, value)).toBeNull();
	});

	it("strips the plus sign from a mobile number", () => {
		expect(mobile.parse("+35612345678")).toBe("35612345678");
	});
});

describe("birthDate", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2026, 9, 2));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("accepts a player who turns 18 today", () => {
		expect(firstError(birthDate, new Date(2008, 9, 2))).toBeNull();
	});

	it("rejects a player who turns 18 tomorrow", () => {
		expect(firstError(birthDate, new Date(2008, 9, 3))).toBe(
			"You must be at least 18 years old",
		);
	});
});
