import { describe, expect, it } from "vitest";
import {
	levelUpProgress,
	questProgress,
} from "@/components/engage/engage-progress.ts";

// The fields of a /levelup or /quest entry the sidebar widgets read; the real responses
// carry many more.
const entry = (fields: {
	title?: string;
	currentLevel?: number;
	progress?: number;
	target?: string;
	questPointBalance?: number;
	claimableAwards?: ({ level: number } | undefined)[];
}) => ({
	title: "OMEGA Level Up",
	currentLevel: 62,
	progress: 0,
	target: "10",
	questPointBalance: 0,
	...fields,
});

describe("levelUpProgress", () => {
	it("reads the player's level and progress from the first Level Up", () => {
		expect(
			levelUpProgress([entry({ progress: 4 }), entry({ title: "Other" })]),
		).toEqual({
			title: "OMEGA Level Up",
			level: 62,
			percent: 40,
			progressLabel: "4 / 10",
			targetLabel: "10",
			hasAwardToClaim: false,
		});
	});

	it("offers Claim when an award is waiting", () => {
		expect(
			levelUpProgress([entry({ claimableAwards: [{ level: 61 }] })])
				?.hasAwardToClaim,
		).toBe(true);
	});

	it("doesn't offer Claim when nothing is waiting", () => {
		expect(
			levelUpProgress([entry({ claimableAwards: [] })])?.hasAwardToClaim,
		).toBe(false);
		expect(
			levelUpProgress([entry({ claimableAwards: [undefined] })])
				?.hasAwardToClaim,
		).toBe(false);
	});

	it("stops the bar at full when progress passes the target", () => {
		expect(levelUpProgress([entry({ progress: 12 })])?.percent).toBe(100);
	});

	it("shows an empty bar when the target isn't a positive number", () => {
		expect(
			levelUpProgress([entry({ progress: 3, target: "0" })])?.percent,
		).toBe(0);
		expect(levelUpProgress([entry({ progress: 3, target: "" })])?.percent).toBe(
			0,
		);
	});

	it("rounds the bar to a whole percent", () => {
		expect(
			levelUpProgress([entry({ progress: 1, target: "3" })])?.percent,
		).toBe(33);
	});

	it("has nothing to show when the player has no Level Up", () => {
		expect(levelUpProgress(undefined)).toBeNull();
		expect(levelUpProgress([])).toBeNull();
	});
});

describe("questProgress", () => {
	it("adds the player's quest points to the level and progress", () => {
		expect(
			questProgress([
				entry({
					title: "Quest Prize Hunt",
					currentLevel: 20,
					progress: 100,
					target: "100",
					questPointBalance: 1500,
				}),
			]),
		).toEqual({
			title: "Quest Prize Hunt",
			level: 20,
			percent: 100,
			progressLabel: "100 / 100",
			targetLabel: "100",
			points: 1500,
		});
	});

	it("has nothing to show when the player has no quest", () => {
		expect(questProgress([])).toBeNull();
	});
});
