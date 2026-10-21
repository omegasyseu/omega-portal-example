import { Button, Center, Loader, Stack, Text } from "@mantine/core";
import {
	CatchBoundary,
	useLocation,
	useNavigate,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";
import { withoutAuthSearch } from "@/components/auth/hooks/use-auth-dialog.ts";
import { PortalModal } from "@/components/route-modal";
import { useSession } from "@/providers/authentication/authentication.tsx";
import {
	type EngageDialog,
	hrefWithDialog,
	withoutDialogSearch,
} from "./engage-dialog.ts";
import {
	useCloseEngageDialog,
	useOpenEngageDialog,
} from "./use-engage-dialog.ts";

// Loaded on first open, not with every page.
const JackpotModalContent = lazy(() =>
	import("@/components/jackpot/jackpot-modal-content.tsx").then((module) => ({
		default: module.JackpotModalContent,
	})),
);
const ChallengesModalContent = lazy(() =>
	import("@/components/challenges/challenges-modal-content.tsx").then(
		(module) => ({ default: module.ChallengesModalContent }),
	),
);

const DIALOG_LOADING_HEIGHT = 240;

const JACKPOT_DIALOG_WIDTH = 880;
const CHALLENGES_DIALOG_WIDTH = 520;

const DIALOGS: Record<
	EngageDialog,
	{ title: string; size: number; content: () => React.ReactNode }
> = {
	jackpot: {
		title: "Jackpot",
		size: JACKPOT_DIALOG_WIDTH,
		content: () => <JackpotModalContent />,
	},
	challenges: {
		title: "Daily Challenge",
		size: CHALLENGES_DIALOG_WIDTH,
		content: () => <ChallengesModalContent />,
	},
};

// Jackpot and Challenges, open over whatever page the player is on (?dialog=jackpot).
// They need a player: a visitor's links sign in first, and come back with the dialog.
export function EngageDialogs() {
	const openDialog = useOpenEngageDialog();
	const close = useCloseEngageDialog();
	const { session } = useSession();
	const isSignedIn = Boolean(session?.user);
	const navigate = useNavigate();
	const href = useLocation({ select: (location) => location.href });

	// A visitor with a dialog in the address (a shared link, a reload after signing out)
	// signs in first and comes back to the page with it open.
	useEffect(() => {
		if (openDialog && !isSignedIn) {
			void navigate({
				to: ".",
				search: (prev: Record<string, unknown>) => ({
					...withoutDialogSearch(withoutAuthSearch(prev)),
					auth: "login" as const,
					redirect: hrefWithDialog(href, openDialog),
				}),
				replace: true,
				resetScroll: false,
			});
		}
	}, [openDialog, isSignedIn, href, navigate]);

	if (!openDialog || !isSignedIn) {
		return null;
	}
	const { title, size, content } = DIALOGS[openDialog];
	return (
		<PortalModal opened onClose={close} size={size} title={title}>
			{/* A dialog that fails stays inside its dialog, not across the page under it. */}
			<CatchBoundary
				getResetKey={() => openDialog}
				onCatch={(error) => console.error("Dialog failed", openDialog, error)}
				// A dialog whose code failed to download stays failed until the page
				// reloads, so that is the way to try again.
				errorComponent={() => (
					<Stack align="center" gap="sm" py="xl" role="alert">
						<Text c="dark.1" ta="center">
							We couldn&#39;t open this. Reload the page to try again.
						</Text>
						<Button variant="default" onClick={() => window.location.reload()}>
							Reload
						</Button>
					</Stack>
				)}
			>
				<Suspense
					fallback={
						<Center mih={DIALOG_LOADING_HEIGHT}>
							<Loader aria-label="Loading" />
						</Center>
					}
				>
					{content()}
				</Suspense>
			</CatchBoundary>
		</PortalModal>
	);
}
