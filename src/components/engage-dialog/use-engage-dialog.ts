import { type LinkProps, useLocation, useSearch } from "@tanstack/react-router";
import { openAuthLink } from "@/components/auth/hooks/use-auth-dialog.ts";
import { useCloseSearchDialog } from "@/hooks/use-close-search-dialog.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import {
	type EngageDialog,
	hrefWithDialog,
	openDialogLink,
	withoutDialogSearch,
} from "./engage-dialog.ts";

// The dialog open over the current page, if any.
export const useOpenEngageDialog = (): EngageDialog | undefined =>
	useSearch({ strict: false, select: ({ dialog }) => dialog });

// Closes the dialog and stays on the page under it.
export const useCloseEngageDialog = () =>
	useCloseSearchDialog("isDialogOpen", withoutDialogSearch);

// The link props that open a dialog over the current page: straight away for a player,
// after sign-in for a visitor, who then comes back to this page with it open.
export const useEngageDialogLink = (dialog: EngageDialog): LinkProps => {
	const { session } = useSession();
	const href = useLocation({ select: (location) => location.href });
	return session?.user
		? openDialogLink(dialog)
		: openAuthLink("login", hrefWithDialog(href, dialog));
};
