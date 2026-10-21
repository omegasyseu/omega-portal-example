import { describe, expect, it } from "vitest";
import { navLinkProps } from "./nav-link-props";

const searchOf = (props: ReturnType<typeof navLinkProps>) =>
	typeof props.search === "function"
		? (props.search as (prev: Record<string, unknown>) => unknown)({})
		: props.search;

describe("navLinkProps", () => {
	it("links straight to a page anyone can open", () => {
		expect(
			navLinkProps({ key: "leaderboard", to: "/leaderboard", gated: false }),
		).toEqual({ to: "/leaderboard" });
	});

	it("opens sign-in over the current page for a page that needs a session", () => {
		const props = navLinkProps({ key: "quest", to: "/quest", gated: true });
		expect(props.to).toBe(".");
		expect(searchOf(props)).toEqual({ auth: "login", redirect: "/quest" });
	});

	it("opens sign-up for Register", () => {
		const props = navLinkProps({
			key: "register",
			to: "/signup",
			gated: false,
		});
		expect(searchOf(props)).toEqual({ auth: "signup", redirect: undefined });
	});

	it("opens Jackpot over the current page for a signed-in player", () => {
		const props = navLinkProps(
			{ key: "jackpot", to: "/jackpot", gated: false },
			"/games",
		);
		expect(props.to).toBe(".");
		expect(searchOf(props)).toEqual({ dialog: "jackpot" });
	});

	it("signs a visitor in first, then opens Challenges on the same page", () => {
		const props = navLinkProps(
			{ key: "challenge", to: "/challenges", gated: true },
			"/games?collection=slots",
		);
		expect(props.to).toBe(".");
		expect(searchOf(props)).toEqual({
			auth: "login",
			redirect: "/games?collection=slots&dialog=challenges",
		});
	});
});
