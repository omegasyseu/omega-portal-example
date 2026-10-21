import { describe, expect, it } from "vitest";
import { playerName } from "@/components/profile/player-name.ts";

describe("playerName", () => {
	it("uses the player's first and last name", () => {
		expect(
			playerName({ firstName: "Alex", lastName: "Morgan", nickname: "alexm" }),
		).toBe("Alex Morgan");
	});

	it("falls back to the nickname when no name is set", () => {
		expect(playerName({ firstName: "", nickname: "alexm" })).toBe("alexm");
	});

	it("is empty before the profile loads", () => {
		expect(playerName(undefined)).toBe("");
	});
});
