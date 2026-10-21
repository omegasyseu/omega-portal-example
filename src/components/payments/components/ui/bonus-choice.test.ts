import { describe, expect, it } from "vitest";
import { amountToCheck, pickedPlanId } from "./bonus-choice.ts";

describe("amountToCheck", () => {
	it("checks an amount the player can deposit", () => {
		expect(amountToCheck("50", 5000)).toBe("50");
	});

	it("checks nothing until there's an amount", () => {
		expect(amountToCheck("", 5000)).toBeUndefined();
	});

	it("checks nothing for an amount that can't be deposited", () => {
		expect(amountToCheck("0", 5000)).toBeUndefined();
		expect(amountToCheck("-5", 5000)).toBeUndefined();
	});

	it("checks nothing over the daily limit, which the deposit would refuse", () => {
		expect(amountToCheck("6000", 5000)).toBeUndefined();
	});

	it("checks any positive amount while the limit is unknown", () => {
		expect(amountToCheck("6000", undefined)).toBe("6000");
	});
});

describe("pickedPlanId", () => {
	const plans = [{ bonusPlanId: "7" }, { bonusPlanId: "9" }];

	it("keeps a picked plan the amount is still eligible for", () => {
		expect(pickedPlanId("9", plans)).toBe("9");
	});

	it("drops a picked plan the amount isn't eligible for", () => {
		expect(pickedPlanId("5", plans)).toBe("");
	});

	it("claims nothing while the plans aren't known", () => {
		expect(pickedPlanId("9", undefined)).toBe("");
	});
});
