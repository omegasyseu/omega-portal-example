import { describe, expect, it } from "vitest";
import {
	isSamePage,
	pageToReturnTo,
	safeRedirectPath,
} from "@/utils/safe-redirect.ts";

describe("safeRedirectPath", () => {
	it("keeps a path inside the portal, with its search and hash", () => {
		expect(safeRedirectPath("/leaderboard?period=WEEKLY#top")).toBe(
			"/leaderboard?period=WEEKLY#top",
		);
	});

	it.each([
		["another site", "https://evil.example/steal"],
		["a protocol-relative URL", "//evil.example"],
		["a backslash trick", "/\\evil.example"],
		["a dot segment that collapses to another host", "/.//evil.example"],
		["an encoded dot segment", "/%2e//evil.example"],
		["a parent segment that collapses to another host", "/a/..//evil.example"],
		["a script URL", "javascript:alert(1)"],
		["a relative path", "bonus"],
		["an empty value", ""],
		["a non-string value", 42],
	])("rejects %s", (_kind, value) => {
		expect(safeRedirectPath(value)).toBeUndefined();
	});

	it.each([
		"/login",
		"/signup/code?username=a",
		"/quick-signup",
		"/forgot-password/reset",
		// Routes match regardless of case, so the check must too.
		"/LOGIN",
		"/SignUp/code",
	])("rejects the sign-in page %s so sign-in can't loop", (value) => {
		expect(safeRedirectPath(value)).toBeUndefined();
	});

	it("keeps a page whose name only starts like a sign-in page", () => {
		expect(safeRedirectPath("/login-help")).toBe("/login-help");
	});
});

describe("pageToReturnTo", () => {
	it("returns the page the player is on", () => {
		expect(
			pageToReturnTo({
				pathname: "/profile",
				href: "/profile?tab=kyc",
				search: {},
			}),
		).toBe("/profile?tab=kyc");
	});

	it("keeps the pending return-to page when already in the sign-in flow", () => {
		expect(
			pageToReturnTo({
				pathname: "/login",
				href: "/login?redirect=%2Fprofile",
				search: { redirect: "/profile" },
			}),
		).toBe("/profile");
	});

	it("returns nothing when in the sign-in flow with no return-to page", () => {
		expect(
			pageToReturnTo({ pathname: "/signup", href: "/signup", search: {} }),
		).toBeUndefined();
	});

	it("keeps the pending return-to page while the sign-in modal is open", () => {
		expect(
			pageToReturnTo({
				pathname: "/games",
				href: "/games?auth=login&redirect=%2Fdeposit",
				search: { auth: "login", redirect: "/deposit" },
			}),
		).toBe("/deposit");
	});

	it("returns nothing while the sign-in modal is open with no return-to page", () => {
		expect(
			pageToReturnTo({
				pathname: "/games",
				href: "/games?auth=signup",
				search: { auth: "signup" },
			}),
		).toBeUndefined();
	});
});

describe("isSamePage", () => {
	it("knows a return-to address on the page the player is on, whatever its params", () => {
		expect(isSamePage("/games?dialog=jackpot", "/games")).toBe(true);
	});

	it("knows one that leads to another page", () => {
		expect(isSamePage("/quest", "/games")).toBe(false);
	});
});
