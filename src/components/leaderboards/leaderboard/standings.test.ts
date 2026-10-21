import { describe, expect, it } from "vitest";
import { splitStandings } from "@/components/leaderboards/leaderboard/standings.ts";

const player = (rank: number) => ({
	rank,
	username: `player${rank}`,
	wageringInPeriod: 100 - rank,
	prize: 10,
});

describe("splitStandings", () => {
	it("puts the top three on the podium and the rest in the list, by rank", () => {
		const { podium, rest } = splitStandings([
			player(4),
			player(2),
			player(1),
			player(5),
			player(3),
		]);

		expect(podium.map((entry) => entry.rank)).toEqual([1, 2, 3]);
		expect(rest.map((entry) => entry.rank)).toEqual([4, 5]);
	});

	it("leaves the list empty when three or fewer players ranked", () => {
		const { podium, rest } = splitStandings([player(2), player(1)]);

		expect(podium.map((entry) => entry.rank)).toEqual([1, 2]);
		expect(rest).toEqual([]);
	});

	it("has no standings before anyone has ranked", () => {
		expect(splitStandings([])).toEqual({ podium: [], rest: [] });
	});
});
