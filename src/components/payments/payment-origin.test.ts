import { describe, expect, it } from "vitest";
import { nextOrigin, returnLink } from "./payment-origin.ts";

describe("returnLink", () => {
	it("sends the player to the games when it's not known where they came from", () => {
		expect(returnLink(undefined)).toEqual({
			label: "Play games",
			href: "/games",
		});
	});

	it("takes the player back to the game they deposited from, by name", () => {
		const game =
			"/games/aztec_fire?productCode=THREEOAKS&gameCurrency=EUR&gameName=Aztec+Fire";
		expect(returnLink(game)).toEqual({
			label: "Back to Aztec Fire",
			href: game,
		});
	});

	it("sends the player to the games from any other page", () => {
		expect(returnLink("/promotions")).toEqual({
			label: "Play games",
			href: "/games",
		});
	});

	it("takes the player back to a game without a name in its address", () => {
		expect(returnLink("/games/aztec_fire?productCode=THREEOAKS")).toEqual({
			label: "Back to the game",
			href: "/games/aztec_fire?productCode=THREEOAKS",
		});
	});

	it("never leads off the portal, even for an address that looks like a game", () => {
		expect(returnLink("//evil.example/games/x?gameName=Foo")).toEqual({
			label: "Play games",
			href: "/games",
		});
	});

	it("names the game by a numeric name too, which the router quotes", () => {
		expect(returnLink("/games/x?gameName=%22777%22").label).toBe("Back to 777");
	});
});

describe("nextOrigin", () => {
	const game = { pathname: "/games/aztec_fire", href: "/games/aztec_fire?x=1" };

	it("remembers the page the player came to the payment pages from", () => {
		expect(nextOrigin(undefined, game, "/deposit")).toBe(
			"/games/aztec_fire?x=1",
		);
	});

	it("keeps it while the player moves between payment pages", () => {
		const deposit = { pathname: "/deposit", href: "/deposit" };
		expect(nextOrigin("/games/a", deposit, "/deposit/OMEGA_BANK")).toBe(
			"/games/a",
		);
	});

	it("keeps it when the player goes elsewhere, until they come back to pay", () => {
		expect(nextOrigin("/games/a", game, "/promotions")).toBe("/games/a");
	});
});
