import { useLocation, useNavigate, useRouter } from "@tanstack/react-router";

type Search = Record<string, unknown>;

// Closes a dialog that is a search param on the current page (sign-in, Jackpot,
// Challenges) and stays on the page under it. When this history entry opened the
// dialog (marked by `openedFlag`) it steps back, so Back doesn't reopen it; opened by a
// link, a redirect or a reload, it drops the dialog's params instead.
export const useCloseSearchDialog = (
	openedFlag: "isAuthOpen" | "isDialogOpen",
	withoutDialog: (search: Search) => Search,
) => {
	const router = useRouter();
	const navigate = useNavigate();
	const isOpenedHere = useLocation({
		select: ({ state }) => state[openedFlag] === true,
	});

	return () => {
		if (isOpenedHere) {
			router.history.back();
			return;
		}
		void navigate({
			to: ".",
			search: withoutDialog,
			replace: true,
			// The page under the dialog stays scrolled where it was.
			resetScroll: false,
		});
	};
};
