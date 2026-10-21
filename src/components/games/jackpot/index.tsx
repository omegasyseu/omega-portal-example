import { CatchBoundary } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import {
	shownWidgets,
	useWidgetSettings,
} from "@/components/games/widget-settings.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { usePsJackpotEvent } from "@/server/IPS/ps-jackpot-event";
import type { JackpotWin } from "./jackpot-win-dialog.tsx";

// The win dialog brings the wheel's animation libraries, so it loads only when a win
// arrives.
const JackpotWinDialog = lazy(() => import("./jackpot-win-dialog.tsx"));

type Props = {
	sessionKey?: string;
};

// Jackpot wins arrive over the jackpot socket while a game is open; each one opens the
// win dialog in turn. With the Jackpot widget switched off, or Jackpot hidden on the
// Brand, they're passed over: the prize is paid either way.
const Jackpot = ({ sessionKey }: Props) => {
	const { messagesQueue, dequeueMessage } = usePsJackpotEvent(sessionKey);
	const [win, setWin] = useState<JackpotWin>();
	const { showJackpot } = shownWidgets(
		useWidgetSettings(),
		useBrandContent().engageFeatures,
	);

	// Switching the widget off closes a win that's showing, rather than holding it back.
	if (!showJackpot && win !== undefined) {
		setWin(undefined);
	}

	useEffect(() => {
		const next = messagesQueue[0];
		if (win === undefined && next !== undefined) {
			dequeueMessage();
			// Only a win names its tier; other messages are passed over.
			if (next.tier && showJackpot) {
				setWin(next);
			}
		}
	}, [messagesQueue, win, dequeueMessage, showJackpot]);

	return win ? (
		// If the dialog's code fails to download, the win is skipped rather than taking
		// the game down with it: the prize is paid either way.
		<CatchBoundary
			getResetKey={() => "jackpot-win"}
			onCatch={(error) => {
				console.error("Jackpot win dialog failed", error);
				setWin(undefined);
			}}
			errorComponent={() => null}
		>
			<Suspense fallback={null}>
				<JackpotWinDialog win={win} onClose={() => setWin(undefined)} />
			</Suspense>
		</CatchBoundary>
	) : null;
};

export default Jackpot;
