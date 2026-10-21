import { describe, expect, it } from "vitest";
import {
	type CashbackPlan,
	canClaimPlan,
	hasCashbackToClaim,
	runningInstantPlans,
} from "./cashback-plans";

const plan = (overrides: Partial<CashbackPlan> = {}): CashbackPlan => ({
	partyId: 1,
	currency: "EUR",
	cashbackPlanId: 1,
	cashbackAvailable: 5,
	cashbackAwarded: 0,
	cashbackClaimed: 0,
	cashbackAccumulated: 5,
	cashbackExpired: 0,
	cashbackPlanType: "INSTANT",
	planStatus: "RUNNING",
	cashbackPlayerAvailable: 5,
	minimumClaimAmount: 1,
	...overrides,
});

describe("runningInstantPlans", () => {
	it("keeps only running instant-cashback plans", () => {
		const plans = runningInstantPlans({
			planBalances: [
				plan({ cashbackPlanId: 1 }),
				plan({ cashbackPlanId: 2, planStatus: "EXPIRED" }),
				plan({ cashbackPlanId: 3, cashbackPlanType: "PERIODIC" }),
				undefined,
			],
		});
		expect(plans.map((p) => p.cashbackPlanId)).toEqual([1]);
	});
});

describe("canClaimPlan", () => {
	it("lets the player claim from the plan's minimum", () => {
		expect(canClaimPlan(plan())).toBe(true);
		expect(canClaimPlan(plan({ cashbackPlayerAvailable: 0.5 }))).toBe(false);
	});

	it("refuses a plan the player can't redeem or whose limit is used up", () => {
		expect(canClaimPlan(plan({ isPlayerRedeemable: false }))).toBe(false);
		expect(canClaimPlan(plan({ limitPerPlayer: 10, limitUsed: 10 }))).toBe(
			false,
		);
	});
});

describe("hasCashbackToClaim", () => {
	it("is true when any running plan can be claimed", () => {
		expect(
			hasCashbackToClaim({
				planBalances: [plan({ cashbackPlayerAvailable: 0 }), plan()],
			}),
		).toBe(true);
		expect(hasCashbackToClaim(undefined)).toBe(false);
	});
});
