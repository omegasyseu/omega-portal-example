import { describe, expect, it } from "vitest";
import { dialogForPath, hrefWithDialog, openDialogLink } from "./engage-dialog";

const searchOf = (props: ReturnType<typeof openDialogLink>, prev = {}) =>
	(props.search as (prev: Record<string, unknown>) => unknown)(prev);

describe("openDialogLink", () => {
	it("opens the dialog over the current page, keeping its own params", () => {
		const props = openDialogLink("jackpot");
		expect(props.to).toBe(".");
		expect(searchOf(props, { category: "slots" })).toEqual({
			category: "slots",
			dialog: "jackpot",
		});
	});

	it("leaves the sign-in flow behind", () => {
		expect(
			searchOf(openDialogLink("challenges"), { auth: "login", redirect: "/x" }),
		).toEqual({ dialog: "challenges" });
	});

	it("leaves the page scrolled where it was under the dialog", () => {
		expect(openDialogLink("jackpot").resetScroll).toBe(false);
	});
});

describe("hrefWithDialog", () => {
	it("adds the dialog to the page's address", () => {
		expect(hrefWithDialog("/games?collection=slots", "jackpot")).toBe(
			"/games?collection=slots&dialog=jackpot",
		);
		expect(hrefWithDialog("/", "challenges")).toBe("/?dialog=challenges");
	});

	it("keeps the page's #fragment after the query", () => {
		expect(hrefWithDialog("/bonus?tab=active#top", "jackpot")).toBe(
			"/bonus?tab=active&dialog=jackpot#top",
		);
	});

	it("drops the sign-in flow's params and any other dialog", () => {
		expect(
			hrefWithDialog(
				"/profile?auth=login&redirect=%2Fx&dialog=jackpot",
				"challenges",
			),
		).toBe("/profile?dialog=challenges");
	});
});

describe("dialogForPath", () => {
	it("knows the pages that are now dialogs", () => {
		expect(dialogForPath("/jackpot")).toBe("jackpot");
		expect(dialogForPath("/challenges")).toBe("challenges");
		expect(dialogForPath("/levelup")).toBeUndefined();
	});
});
