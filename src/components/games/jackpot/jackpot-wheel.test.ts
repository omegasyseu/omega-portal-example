import { describe, expect, it } from "vitest";
import {
	isLabelFlipped,
	jackpotWheel,
	landingRotation,
	MAX_LANDING_OFFSET,
	segmentPath,
	tierTone,
} from "./jackpot-wheel.ts";

describe("jackpotWheel", () => {
	it("puts each tier on the wheel and lands on the one won", () => {
		expect(jackpotWheel("Bronze, Silver ,Gold,Platinum", "Gold")).toEqual({
			tiers: ["Bronze", "Silver", "Gold", "Platinum"],
			prizeIndex: 2,
		});
	});

	it("adds the won tier when the list leaves it out, so the spin can land on it", () => {
		expect(jackpotWheel("Bronze,Silver", "Gold")).toEqual({
			tiers: ["Bronze", "Silver", "Gold"],
			prizeIndex: 2,
		});
	});

	it("lists each tier once, even when the event repeats one", () => {
		expect(jackpotWheel("Bronze,Gold,Bronze", "Gold")).toEqual({
			tiers: ["Bronze", "Gold"],
			prizeIndex: 1,
		});
	});

	it("drops empty entries from the list", () => {
		expect(jackpotWheel("Bronze,,Silver,", "Silver").tiers).toEqual([
			"Bronze",
			"Silver",
		]);
	});
});

describe("landingRotation", () => {
	it("turns the wheel so the won segment's middle stops under the pointer", () => {
		// Four segments of 90°: the third's middle starts at 225° clockwise from the top.
		expect(landingRotation(2, 4, { turns: 5 })).toBe(5 * 360 - 225);
	});

	it("can stop off-centre, still inside the won segment", () => {
		// A quarter of a segment past the middle: 225° + 22.5°.
		expect(landingRotation(2, 4, { turns: 5, offset: 0.25 })).toBe(
			5 * 360 - 247.5,
		);
	});

	it("never drifts far enough to stop on the line into the next segment", () => {
		expect(landingRotation(2, 4, { turns: 5, offset: 0.9 })).toBe(
			landingRotation(2, 4, { turns: 5, offset: MAX_LANDING_OFFSET }),
		);
	});
});

describe("segmentPath", () => {
	it("draws a segment as a slice from the centre, the first starting at the top", () => {
		// A quarter of a circle of radius 100 centred at (100, 100): top to right.
		expect(segmentPath(0, 4, 100)).toBe(
			"M100 100 L100 0 A100 100 0 0 1 200 100 Z",
		);
	});

	it("draws a smaller segment round the same centre, for the inside of the band", () => {
		// Radius 90 about (100, 100): top to right.
		expect(segmentPath(0, 4, 90, 100)).toBe(
			"M100 100 L100 10 A90 90 0 0 1 190 100 Z",
		);
	});

	it("draws a lone segment as the whole circle", () => {
		expect(segmentPath(0, 1, 100)).toBe(
			"M100 0 A100 100 0 1 1 100 200 A100 100 0 1 1 100 0 Z",
		);
	});
});

describe("tierTone", () => {
	it("gives each named tier its own colour, wherever it sits", () => {
		expect(
			["Bronze", "silver", " GOLD", "Platinum"].map((t, i) => tierTone(t, i)),
		).toEqual(["bronze", "silver", "gold", "platinum"]);
	});

	it("colours other tiers by position, lowest first, as the jackpot card does", () => {
		expect([tierTone("Mini", 0), tierTone("Grand", 3)]).toEqual([
			"bronze",
			"platinum",
		]);
	});
});

describe("isLabelFlipped", () => {
	it("keeps a label on the right half reading out from the hub", () => {
		expect(isLabelFlipped(45, 0)).toBe(false);
	});

	it("turns a label on the left half so it doesn't read upside down", () => {
		expect(isLabelFlipped(225, 0)).toBe(true);
	});

	it("judges by where the wheel came to rest", () => {
		expect(isLabelFlipped(45, 180)).toBe(true);
		expect(isLabelFlipped(225, 5 * 360 - 90)).toBe(false);
	});
});
