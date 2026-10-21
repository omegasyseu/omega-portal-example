import { describe, expect, it } from "vitest";
import { openAuthLink, withoutAuthSearch } from "./use-auth-dialog";

describe("withoutAuthSearch", () => {
	it("drops the sign-in flow's params and keeps the page's own", () => {
		expect(
			withoutAuthSearch({
				category: "slots",
				auth: "signup-code",
				redirect: "/deposit",
				username: "player1",
				referralCode: "ABC",
			}),
		).toEqual({ category: "slots" });
	});
});

describe("openAuthLink", () => {
	it("opens a step over the current page, replacing any flow already open", () => {
		const link = openAuthLink("login", "/quest");
		expect(link.to).toBe(".");
		expect(link.state).toEqual({ isAuthOpen: true });
		expect(
			link.search({ category: "slots", auth: "signup", username: "old" }),
		).toEqual({ category: "slots", auth: "login", redirect: "/quest" });
	});

	it("leaves the page scrolled where it was under the dialog", () => {
		expect(openAuthLink("login").resetScroll).toBe(false);
	});
});
