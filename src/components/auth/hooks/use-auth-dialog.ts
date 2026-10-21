import { useNavigate, useSearch } from "@tanstack/react-router";
import {
	AUTH_SEARCH_KEYS,
	type AuthSearch,
	type AuthStep,
} from "@/components/auth/auth-steps.ts";
import { useCloseSearchDialog } from "@/hooks/use-close-search-dialog.ts";

type Search = Record<string, unknown>;

// The page's own search params, without the sign-in flow's.
export const withoutAuthSearch = (search: Search): Search =>
	Object.fromEntries(
		Object.entries(search).filter(
			([key]) => !(AUTH_SEARCH_KEYS as readonly string[]).includes(key),
		),
	);

export const useAuthSearch = (): AuthSearch =>
	useSearch({
		strict: false,
		select: ({ auth, redirect, username, referralCode }) => ({
			auth,
			redirect,
			username,
			referralCode,
		}),
	});

// The link props that open the sign-in dialog over the current page. The new history
// entry is marked, so closing the dialog can step back to the page as it was, and the
// page stays scrolled where it was under the dialog (the router would otherwise jump to
// the top).
export const openAuthLink = (step: AuthStep, redirect?: string) => ({
	to: "." as const,
	search: (prev: Search) => ({
		...withoutAuthSearch(prev),
		auth: step,
		redirect,
	}),
	state: { isAuthOpen: true },
	resetScroll: false,
});

// Opens the dialog at a step over the current page, returning afterwards to `redirect`
// or, without one, to the page itself.
export const useOpenAuth = () => {
	const navigate = useNavigate();
	return (step: AuthStep, redirect?: string) =>
		navigate(openAuthLink(step, redirect));
};

// Moves to another step of an open dialog. It replaces the history entry and keeps the
// values the flow carries, so Back and closing still leave the flow in one go.
export const useGoToAuthStep = () => {
	const navigate = useNavigate();
	return (step: AuthStep, values: Omit<AuthSearch, "auth"> = {}) =>
		navigate({
			to: ".",
			search: (prev: Search) => ({ ...prev, ...values, auth: step }),
			replace: true,
			state: true,
			resetScroll: false,
		});
};

// Closes the dialog and stays on the page under it.
export const useCloseAuth = () =>
	useCloseSearchDialog("isAuthOpen", withoutAuthSearch);
