import type { LinkProps } from "@tanstack/react-router";
import { openAuthLink } from "@/components/auth/hooks/use-auth-dialog.ts";
import {
	dialogForPath,
	hrefWithDialog,
	openDialogLink,
} from "@/components/engage-dialog/engage-dialog.ts";
import type { NavLink } from "@/layout/shell/navigation-model.ts";

// Where a shell link goes. Register opens sign-up over the current page; a page that
// needs a logged-in player opens sign-in there instead, going on to the page afterwards.
// Jackpot and Challenges open their dialog over the current page (`currentHref`), after
// sign-in if need be.
export const navLinkProps = (
	link: Pick<NavLink, "key" | "gated" | "to">,
	currentHref = "/",
): LinkProps => {
	if (link.key === "register") {
		return openAuthLink("signup");
	}
	const dialog = dialogForPath(link.to);
	if (dialog) {
		return link.gated
			? openAuthLink("login", hrefWithDialog(currentHref, dialog))
			: openDialogLink(dialog);
	}
	if (link.gated) {
		return openAuthLink("login", link.to);
	}
	return { to: link.to };
};
