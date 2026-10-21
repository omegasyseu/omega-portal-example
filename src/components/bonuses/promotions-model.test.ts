import { describe, expect, it } from "vitest";
import {
	buildPromotions,
	defaultHistoryWindow,
} from "@/components/bonuses/promotions-model.ts";
import type { BonusType } from "@/components/bonuses/queries/get-active-bonuses.ts";

const bonus = (id: number, overrides: Partial<BonusType> = {}): BonusType => ({
	id,
	bonusPlanName: `Plan ${id}`,
	bonusPlanId: id * 10,
	status: "ACTIVE",
	expiryDate: "2026-11-01T00:00:00",
	expiryDateFormatted: "01-11-2026 00:00:00",
	triggerDate: "2026-10-01T00:00:00",
	triggerDateFormatted: "01-10-2026 00:00:00",
	releaseDate: null,
	releaseDateFormatted: null,
	amount: "50.00",
	amountNumber: 50,
	wagerRequirement: "200.00",
	wagerRequirementNumber: 200,
	amountWagered: "50.00",
	amountWageredNumber: 50,
	currency: "EUR",
	triggerType: "DEPOSIT",
	description: null,
	restrictedGames: [],
	gameRestrictionType: null,
	excludedGames: [],
	externalBonusPlanId: null,
	recurringApplicable: false,
	...overrides,
});

describe("buildPromotions", () => {
	it("turns each active Bonus into a My Rewards card with its wagering progress", () => {
		const { rewards } = buildPromotions({
			active: [bonus(1)],
			history: [],
		});

		expect(rewards).toEqual([
			{
				id: 1,
				planName: "Plan 1",
				amount: 50,
				currency: "EUR",
				wagered: 50,
				wagerRequirement: 200,
				progress: 25,
				triggered: "01-10-2026 00:00:00",
				expires: "01-11-2026 00:00:00",
				restrictedGames: [],
				excludedGames: [],
				status: "Active",
				canCancel: true,
			},
		]);
	});

	it.each([
		["ACTIVE", "Active", true],
		["PENDING", "Pending", false],
		["RELEASED", "Released", false],
		["CANCELLED", "Cancelled", false],
	])(
		"shows a %s Bonus as %s, cancellable only while active",
		(status, label, canCancel) => {
			const { rewards } = buildPromotions({
				active: [bonus(1, { status })],
				history: [],
			});

			expect([rewards[0]?.status, rewards[0]?.canCancel]).toEqual([
				label,
				canCancel,
			]);
		},
	);

	it("names the restricted and excluded games, whatever shape the API sends them in", () => {
		const { rewards } = buildPromotions({
			active: [
				bonus(1, {
					restrictedGames: ["aztec_fire", { gameName: "Big Bass Splash" }],
					excludedGames: [{ gameId: "delasport" }, 42, { unknown: true }],
				}),
			],
			history: [],
		});

		expect([rewards[0]?.restrictedGames, rewards[0]?.excludedGames]).toEqual([
			["aztec_fire", "Big Bass Splash"],
			["delasport", "42", '{"unknown":true}'],
		]);
	});

	it.each([
		["a zero requirement", 0, 0, 100],
		["a fully wagered Bonus", 200, 200, 100],
		["more than the requirement wagered", 250, 200, 100],
		["nothing wagered yet", 0, 200, 0],
	])("shows wagering progress for %s", (_, wagered, requirement, progress) => {
		const { rewards } = buildPromotions({
			active: [
				bonus(1, {
					amountWageredNumber: wagered,
					wagerRequirementNumber: requirement,
				}),
			],
			history: [],
		});

		expect(rewards[0]?.progress).toBe(progress);
	});

	it("has no game rules when the API sends the game lists as null", () => {
		const { expired } = buildPromotions({
			active: [],
			history: [
				bonus(2, {
					status: "EXPIRED",
					restrictedGames: null,
					excludedGames: null,
				}),
			],
		});

		expect([expired[0]?.restrictedGames, expired[0]?.excludedGames]).toEqual([
			[],
			[],
		]);
	});

	it("lists past Bonuses as Expired, leaving out the ones still active", () => {
		const { expired } = buildPromotions({
			active: [bonus(1)],
			history: [
				bonus(1),
				bonus(2, { status: "RELEASED" }),
				bonus(3, { status: "CANCELLED" }),
			],
		});

		expect(expired.map(({ id, status }) => [id, status])).toEqual([
			[2, "Released"],
			[3, "Cancelled"],
		]);
	});

	it("has no rewards and nothing expired before the player has any Bonus", () => {
		expect(buildPromotions({ active: undefined, history: undefined })).toEqual({
			rewards: [],
			expired: [],
		});
	});

	it("skips the empty entries the API can return", () => {
		const { rewards, expired } = buildPromotions({
			active: [undefined, bonus(1)],
			history: [undefined, bonus(2, { status: "EXPIRED" })],
		});

		expect([rewards.map(({ id }) => id), expired.map(({ id }) => id)]).toEqual([
			[1],
			[2],
		]);
	});
});

describe("defaultHistoryWindow", () => {
	it("covers the 90 days up to the given date, as API dates", () => {
		expect(defaultHistoryWindow(new Date(2026, 9, 3))).toEqual({
			from: "2026-07-05",
			to: "2026-10-03",
		});
	});

	it("counts back across a year boundary", () => {
		expect(defaultHistoryWindow(new Date(2026, 0, 15))).toEqual({
			from: "2025-10-17",
			to: "2026-01-15",
		});
	});
});
