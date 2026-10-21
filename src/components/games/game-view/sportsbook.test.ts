import { describe, expect, it } from "vitest";
import { gameTitle, isSportsbook } from "./sportsbook.ts";

const games = [
	{ gameProvider: "THREEOAKS", category: "slots" },
	{ gameProvider: "KAMBI", category: "sportsbook" },
	{ gameProvider: "OMEGA_SB", category: "sportsbook" },
];

describe("isSportsbook", () => {
	it("knows a sportsbook provider by its games in the sportsbook Game Category", () => {
		expect(isSportsbook("KAMBI", games)).toBe(true);
		expect(isSportsbook("OMEGA_SB", games)).toBe(true);
	});

	it("leaves casino providers in the game frame", () => {
		expect(isSportsbook("THREEOAKS", games)).toBe(false);
	});

	it("leaves an unknown or missing provider in the game frame", () => {
		expect(isSportsbook("NOT_LISTED", games)).toBe(false);
		expect(isSportsbook(undefined, games)).toBe(false);
	});
});

describe("gameTitle", () => {
	it("names the game by the name it was opened with", () => {
		expect(gameTitle("KAMBI", "KAMBI_GAME_ID")).toBe("KAMBI");
	});

	it("falls back to the game ID when the link has no name", () => {
		expect(gameTitle(undefined, "OMEGA_SB_GAME_ID")).toBe("OMEGA_SB_GAME_ID");
	});

	it("reads a numeric name as text", () => {
		expect(gameTitle(10160, "10160")).toBe("10160");
	});
});
