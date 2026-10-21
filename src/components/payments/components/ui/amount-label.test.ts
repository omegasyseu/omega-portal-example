import { describe, expect, it } from "vitest";
import { amountLabel } from "./amount-label";

describe("amountLabel", () => {
	it("puts a sign symbol straight before the amount", () => {
		expect(amountLabel("€", "25")).toBe("€25");
		expect(amountLabel("CA$", "1,000")).toBe("CA$1,000");
	});

	it("spaces a symbol that ends in a letter, as Intl does", () => {
		expect(amountLabel("ORD", "25")).toBe("ORD 25");
		expect(amountLabel("PHP", "25")).toBe("PHP 25");
	});

	it("shows the amount alone when there is no symbol", () => {
		expect(amountLabel("", "25")).toBe("25");
	});
});
