import { useDisclosure, useFullscreenElement } from "@mantine/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { RegistrationGate } from "@/components/auth/complete-registration/registration-gate.tsx";
import GameIframe from "@/components/games/game-iframe";
import { BelowGame } from "@/components/games/game-view/below-game.tsx";
import { hasCashbackToClaim } from "@/components/games/game-view/cashback-plans.ts";
import { GameToolbar } from "@/components/games/game-view/game-toolbar.tsx";
import classes from "@/components/games/game-view/game-view.module.css";
import { RailCashbackCard } from "@/components/games/game-view/rail-cashback-card.tsx";
import { RailJackpotCard } from "@/components/games/game-view/rail-jackpot-card.tsx";
import {
	gameTitle,
	searchText,
} from "@/components/games/game-view/sportsbook.ts";
import { SportsbookView } from "@/components/games/game-view/sportsbook-view.tsx";
import { useLinkedGame } from "@/components/games/game-view/use-linked-game.ts";
import Jackpot from "@/components/games/jackpot";
import QuickDepositAndFavourites from "@/components/games/quick-deposit";
import {
	hasRailWidget,
	shownWidgets,
	useWidgetSettings,
} from "@/components/games/widget-settings.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { requireSignIn } from "@/providers/authentication/require-sign-in.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { searchValue } from "@/schemas-types/search-value";
import { useGetCashback } from "@/server/IPS/user/get-user-cashback-balance.ts";

const GameSearchSchema = z.object({
	productCode: searchValue,
	gameCurrency: searchValue,
	gameName: searchValue,
});

// The game view, as on Omega Wins: the framed game with a toolbar below it, a rail of
// Jackpot and Cashback cards beside it (below it on phones), the Daily Challenges and
// Daily Race tabs below, then quick deposit. The toolbar's Game widgets switches hide these; with no
// rail card left the game takes the full width; a Hidden Engage Feature's widgets never show. Theatre mode gives the game the page's
// full width on wide screens, with the rail's cards in a row below. Jackpot wins still
// pop up the prize wheel.
const GamePage = ({ title }: { title: string }) => {
	const { game: gameId } = Route.useParams();
	const { gameCurrency, productCode } = Route.useSearch();
	const { selectedAccount } = useGeneralInfo();
	const { ref, toggle, fullscreen } = useFullscreenElement();
	const [isSecondScreenOpen, secondScreen] = useDisclosure(false);
	// Off each time a game opens.
	const [isTheatreMode, theatreMode] = useDisclosure(false);
	const gameProvider = `${productCode}`;
	const { engageFeatures } = useBrandContent();
	const widgets = shownWidgets(useWidgetSettings(), engageFeatures);
	// Cashback ready to claim shows even with its card switched off: the header balance,
	// the other place to claim it, is hidden during a game.
	const { data: cashback } = useGetCashback();
	const { session } = useSession();
	// The query keeps its last data after logout, so the session decides.
	const showCashback =
		widgets.showCashback ||
		(Boolean(session?.user?.sessionKey) && hasCashbackToClaim(cashback));
	const hasRail = hasRailWidget(widgets) || showCashback;
	const railLabel = [
		widgets.showJackpot && "jackpot",
		showCashback && "cashback",
	]
		.filter(Boolean)
		.join(", ");

	return (
		<div className={classes.page} data-theatre={isTheatreMode || undefined}>
			<div
				className={classes.stage}
				data-without-rail={hasRail ? undefined : true}
			>
				<GameIframe
					ref={ref}
					product={gameProvider}
					gameCurrency={`${gameCurrency}`}
					gameId={gameId}
					isSecondScreenOpen={isSecondScreenOpen}
					onCloseSecondScreen={secondScreen.close}
					isFullscreen={fullscreen}
					onExitFullscreen={toggle}
				/>
				<GameToolbar
					game={{ gameId, gameProvider, title }}
					isFullscreen={fullscreen}
					onToggleFullscreen={toggle}
					isSecondScreenOpen={isSecondScreenOpen}
					onToggleSecondScreen={secondScreen.toggle}
					isTheatreMode={isTheatreMode}
					onToggleTheatreMode={theatreMode.toggle}
				/>
				{hasRail ? (
					<aside
						className={classes.rail}
						aria-label={`Game widgets: ${railLabel}`}
					>
						{widgets.showJackpot ? <RailJackpotCard /> : null}
						{showCashback ? <RailCashbackCard /> : null}
					</aside>
				) : null}
			</div>
			<BelowGame
				showChallenges={widgets.showChallenge}
				showRace={widgets.showLeaderboard}
			/>
			<QuickDepositAndFavourites />
			<Jackpot sessionKey={selectedAccount?.sessionKey} />
		</div>
	);
};

// A sportsbook takes the whole page body instead of the game frame. Jackpot wins still
// pop up the prize wheel.
const SportsbookPage = ({
	product,
	gameId,
	gameCurrency,
	title,
}: {
	product: string;
	gameId: string;
	gameCurrency?: string;
	title: string;
}) => {
	const { selectedAccount } = useGeneralInfo();

	return (
		<>
			<SportsbookView
				product={product}
				gameId={gameId}
				gameCurrency={gameCurrency}
				title={title}
			/>
			<Jackpot sessionKey={selectedAccount?.sessionKey} />
		</>
	);
};

// A QUICK_REG player opening a game by link finishes registering first, as Play asks.
// A game the Selected Brand doesn't list waits for its lookup, so a sportsbook isn't
// first loaded in the game frame.
const GatedGamePage = () => {
	const { game: gameId } = Route.useParams();
	const { gameCurrency, gameName, productCode } = Route.useSearch();
	const product = searchText(productCode);
	const linked = useLinkedGame(product, gameId);
	const title = linked.game?.title ?? gameTitle(gameName, gameId);

	useEffect(() => {
		if (linked.lookupError) {
			console.error("Couldn't look up game", gameId, linked.lookupError);
		}
	}, [linked.lookupError, gameId]);

	if (linked.isLoading) return null;

	return (
		<RegistrationGate action="play">
			{product !== undefined && linked.isSportsbook ? (
				<SportsbookPage
					product={product}
					gameId={gameId}
					gameCurrency={searchText(gameCurrency)}
					title={title}
				/>
			) : (
				<GamePage title={title} />
			)}
		</RegistrationGate>
	);
};

export const Route = createFileRoute("/games/$game/")({
	// Games are played for real money or coins, so only a logged-in player opens one.
	beforeLoad: requireSignIn,
	component: GatedGamePage,
	validateSearch: GameSearchSchema,
});
