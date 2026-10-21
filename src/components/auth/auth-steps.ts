import { z } from "zod";
import { searchValue } from "@/schemas-types/search-value";

// The sign-in and sign-up flow opens as a dialog over whatever page the player is on, as
// on Omega Wins, which has no sign-in pages. The step is a search param on that page
// (?auth=login), so the dialog survives a reload and Back closes it.
export const AUTH_STEPS = [
	"login",
	"signup",
	"signup-code",
	"quick-signup",
	"quick-signup-code",
	"forgot-password",
	"reset-password",
] as const;

export type AuthStep = (typeof AUTH_STEPS)[number];

// Every step carries the page to go to once signed in; it is checked with
// safeRedirectPath before use. The code steps also carry the username the code went to,
// and quick sign-up the referral code from a friend's link.
export const authSearchSchema = z.object({
	auth: z.enum(AUTH_STEPS).optional().catch(undefined),
	redirect: z.string().optional().catch(undefined),
	username: searchValue,
	referralCode: searchValue,
});

export type AuthSearch = z.infer<typeof authSearchSchema>;

// The flow's own params, dropped when the dialog closes.
export const AUTH_SEARCH_KEYS = [
	"auth",
	"redirect",
	"username",
	"referralCode",
] as const satisfies readonly (keyof AuthSearch)[];

// The flow's old pages, which now open the dialog. Most specific first: each path also
// matches the steps below it.
const LEGACY_PATHS: { path: string; step: AuthStep }[] = [
	{ path: "/signup/code", step: "signup-code" },
	{ path: "/signup", step: "signup" },
	{ path: "/quick-signup/code", step: "quick-signup-code" },
	{ path: "/quick-signup", step: "quick-signup" },
	{ path: "/forgot-password/reset", step: "reset-password" },
	{ path: "/forgot-password", step: "forgot-password" },
	{ path: "/login", step: "login" },
];

// Whether a pathname is one of the flow's old pages or below one. Redirects after
// sign-in never go there.
export const isAuthPath = (pathname: string) =>
	LEGACY_PATHS.some(
		({ path }) => pathname === path || pathname.startsWith(`${path}/`),
	);

export const authStepForPath = (pathname: string): AuthStep => {
	const path = pathname.toLowerCase().replace(/\/$/, "");
	return LEGACY_PATHS.find((entry) => entry.path === path)?.step ?? "login";
};
