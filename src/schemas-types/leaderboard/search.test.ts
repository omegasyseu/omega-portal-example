import { describe, expect, it } from "vitest";
import { leaderboardSearchSchema } from "@/schemas-types/leaderboard";

describe("leaderboardSearchSchema", () => {
	it.each(["DAILY", "WEEKLY", "MONTHLY"])("keeps the %s period", (period) => {
		expect(leaderboardSearchSchema.parse({ period })).toEqual({ period });
	});

	it("defaults to DAILY when the URL has no period", () => {
		expect(leaderboardSearchSchema.parse({})).toEqual({ period: "DAILY" });
	});

	it.each(["daily", "FOO", 3])("falls back to DAILY for %j", (period) => {
		expect(leaderboardSearchSchema.parse({ period })).toEqual({
			period: "DAILY",
		});
	});
});
