import { z } from "zod";
import { AUTH_SEARCH_KEYS } from "@/components/auth/auth-steps.ts";
import { withoutAuthSearch } from "@/components/auth/hooks/use-auth-dialog.ts";

// Jackpot and Challenges open as dialogs over whatever page the player is on, as on
// Omega Wins, like the sign-in dialog. The dialog is a search param on that page
// (?dialog=jackpot), so it survives a reload and Back closes it.
export const ENGAGE_DIALOGS = ["jackpot", "challenges"] as const;

export type EngageDialog = (typeof ENGAGE_DIALOGS)[number];

export const dialogSearchSchema = z.object({
	dialog: z.enum(ENGAGE_DIALOGS).optional().catch(undefined),
});

type Search = Record<string, unknown>;

// The page's own search params, without the dialog.
export const withoutDialogSearch = ({
	dialog: _dialog,
	...rest
}: Search): Search => rest;

// A placeholder origin, only for reading a relative address.
export const PAGE_ORIGIN = "https://portal.invalid";

// The dialogs' old pages, which now open the dialog.
const DIALOG_FOR_PATH: Record<string, EngageDialog> = {
	"/jackpot": "jackpot",
	"/challenges": "challenges",
};

export const dialogForPath = (pathname: string): EngageDialog | undefined =>
	DIALOG_FOR_PATH[pathname];

// The link props that open a dialog over the current page. The new history entry is
// marked, so closing the dialog can step back to the page as it was.
export const openDialogLink = (dialog: EngageDialog) => ({
	to: "." as const,
	search: (prev: Search) => ({ ...withoutAuthSearch(prev), dialog }),
	state: { isDialogOpen: true },
	// The page under the dialog stays scrolled where it was.
	resetScroll: false,
});

// The page's address with the dialog open on it: where a visitor comes back to once
// signed in.
export const hrefWithDialog = (href: string, dialog: EngageDialog) => {
	const url = new URL(href, PAGE_ORIGIN);
	for (const key of AUTH_SEARCH_KEYS) {
		url.searchParams.delete(key);
	}
	url.searchParams.set("dialog", dialog);
	return `${url.pathname}${url.search}${url.hash}`;
};
