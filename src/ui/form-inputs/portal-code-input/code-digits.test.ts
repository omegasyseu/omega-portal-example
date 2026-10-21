import { describe, expect, it } from "vitest";
import { CODE_MAX_LENGTH, codeDigits } from "./code-digits";

describe("codeDigits", () => {
	it("keeps a code of any length the brand sends", () => {
		expect(codeDigits("4821")).toBe("4821");
		expect(codeDigits("482916")).toBe("482916");
	});

	it("drops anything that isn't a digit, as when a code is pasted from an email", () => {
		expect(codeDigits(" 482 916 ")).toBe("482916");
		expect(codeDigits("48-29-16")).toBe("482916");
		expect(codeDigits("abc")).toBe("");
		expect(codeDigits("Your verification code is 482916.")).toBe("482916");
	});

	it("stops at the longest code a brand can send", () => {
		expect(codeDigits("1".repeat(CODE_MAX_LENGTH + 3))).toHaveLength(
			CODE_MAX_LENGTH,
		);
	});
});
