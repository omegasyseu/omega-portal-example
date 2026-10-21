import { describe, expect, it } from "vitest";
import { rateLabel } from "./rate-label";

const conversion = (currentRate: number) => ({
	playerCurrency: "EUR",
	gameCurrency: "ARS",
	currentRate,
});

describe("rateLabel", () => {
	it("reads as one unit of the player's currency in the game's", () => {
		expect(rateLabel(conversion(1716.55))).toBe("1 EUR = 1,716.55 ARS");
	});

	it("keeps a small rate's decimals", () => {
		expect(rateLabel(conversion(0.00123))).toBe("1 EUR = 0.00123 ARS");
	});

	it("never rounds a tiny rate down to zero", () => {
		expect(rateLabel(conversion(4e-10))).toBe("1 EUR = 0.0000000004 ARS");
		expect(rateLabel(conversion(0.0000096))).toBe("1 EUR = 0.0000096 ARS");
	});

	it("has no label without a rate", () => {
		expect(rateLabel(conversion(0))).toBeUndefined();
	});
});
