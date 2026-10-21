import { describe, expect, it } from "vitest";
import {
	selectedBrand,
	selectedBrandState,
} from "@/components/brand/selected-brand.ts";

const SOCIAL_CASINO = { id: 2, name: "Social Casino" };
const FIAT_CASINO = { id: 5, name: "Fiat Casino" };

describe("selectedBrand", () => {
	it("opens a first visit on the first Brand IPS lists", () => {
		expect(
			selectedBrand({
				brands: [SOCIAL_CASINO, FIAT_CASINO],
				savedBrandId: undefined,
				player: undefined,
			}).brandId,
		).toBe("2");
	});

	it("keeps the Brand the visitor saved while IPS still lists it", () => {
		expect(
			selectedBrand({
				brands: [SOCIAL_CASINO, FIAT_CASINO],
				savedBrandId: "5",
				player: undefined,
			}).brandId,
		).toBe("5");
	});

	it("falls back to the first Brand IPS lists when the saved one is gone", () => {
		expect(
			selectedBrand({
				brands: [SOCIAL_CASINO, FIAT_CASINO],
				savedBrandId: "9",
				player: undefined,
			}).brandId,
		).toBe("2");
	});

	it("shows a signed-in player's own Brand and locks the switcher", () => {
		expect(
			selectedBrand({
				brands: [SOCIAL_CASINO, FIAT_CASINO],
				savedBrandId: "2",
				player: { brandId: "5" },
			}),
		).toEqual({ brandId: "5", isSwitcherShown: true, isSwitcherLocked: true });
	});

	it("locks the switcher for a signed-in player whose Brand isn't known", () => {
		expect(
			selectedBrand({
				brands: [SOCIAL_CASINO, FIAT_CASINO],
				savedBrandId: "5",
				player: { brandId: undefined },
			}),
		).toEqual({ brandId: "5", isSwitcherShown: true, isSwitcherLocked: true });
	});

	it("hides the switcher when IPS lists a single Brand", () => {
		expect(
			selectedBrand({
				brands: [FIAT_CASINO],
				savedBrandId: undefined,
				player: undefined,
			}),
		).toEqual({
			brandId: "5",
			isSwitcherShown: false,
			isSwitcherLocked: false,
		});
	});
});

describe("selectedBrandState", () => {
	it("is the Selected Brand once there is one, even while IPS's brands load", () => {
		expect(selectedBrandState("5", false)).toEqual({
			status: "selected",
			brandId: "5",
		});
		expect(selectedBrandState("5", true)).toEqual({
			status: "selected",
			brandId: "5",
		});
	});

	it("waits while IPS's brands load, and has none once they have loaded empty or failed", () => {
		expect(selectedBrandState(undefined, true)).toEqual({ status: "loading" });
		expect(selectedBrandState(undefined, false)).toEqual({ status: "none" });
	});
});
