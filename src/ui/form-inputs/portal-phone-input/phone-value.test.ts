import { describe, expect, it } from "vitest";
import { phoneForForm, phoneForInput } from "./phone-value";

describe("phoneForInput", () => {
	it("adds the + that IPS leaves off a stored number", () => {
		expect(phoneForInput("14165550193")).toBe("+14165550193");
	});

	it("keeps a number that already has its +", () => {
		expect(phoneForInput("+14165550193")).toBe("+14165550193");
	});

	it("leaves an empty number empty", () => {
		expect(phoneForInput(undefined)).toBe("");
		expect(phoneForInput(null)).toBe("");
	});
});

describe("phoneForForm", () => {
	it("passes on a typed number", () => {
		expect(phoneForForm("+14165550193", "1")).toBe("+14165550193");
	});

	it("treats the country's dial code alone as no number", () => {
		expect(phoneForForm("+1", "1")).toBe("");
		expect(phoneForForm("+44", "44")).toBe("");
	});

	it("keeps a field cleared down to its + as typed", () => {
		// Turning it into "" would make the input re-insert the old country's dial code
		// while the player is typing a new one. Validation refuses a bare "+".
		expect(phoneForForm("+", "1")).toBe("+");
		expect(phoneForForm("", "1")).toBe("");
	});
});
