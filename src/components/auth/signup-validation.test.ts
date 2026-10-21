import { describe, expect, it } from "vitest";
import { validateProfileName, validateTerms } from "./signup-validation";

describe("validateProfileName", () => {
	it("accepts a name of 2 to 20 characters", () => {
		expect(validateProfileName("Jo")).toBeNull();
		expect(validateProfileName("A".repeat(20))).toBeNull();
	});

	it("accepts an empty name, which isn't sent", () => {
		expect(validateProfileName("")).toBeNull();
		expect(validateProfileName("   ")).toBeNull();
		expect(validateProfileName(undefined)).toBeNull();
	});

	it("refuses a name IPS won't keep", () => {
		expect(validateProfileName("J")).toBe("Use 2–20 characters");
		expect(validateProfileName("A".repeat(21))).toBe("Use 2–20 characters");
	});
});

describe("validateTerms", () => {
	it("asks for the terms until they are ticked, whatever consents the brand has", () => {
		expect(validateTerms(false)).toBe("Accept the terms to continue");
		expect(validateTerms(true)).toBeNull();
	});
});
