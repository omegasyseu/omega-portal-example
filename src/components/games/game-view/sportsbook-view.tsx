import {
	GAME_IFRAME_SANDBOX,
	useGameLaunchUrl,
} from "@/components/games/game-iframe/index.tsx";
import classes from "./game-view.module.css";
import { useRefreshBalanceWhileOpen } from "./use-refresh-balance-while-open.ts";

type Props = {
	product: string;
	gameId: string;
	gameCurrency?: string;
	title: string;
};

// A sportsbook as part of the page: it fills the page body below the header, edge to
// edge, with no game frame, toolbar or game widgets around it, and the shell's footer
// below it. Its bets don't reach the header's balance on their own, so the balance is
// refreshed while it is open.
export const SportsbookView = ({
	product,
	gameId,
	gameCurrency,
	title,
}: Props) => {
	const url = useGameLaunchUrl({ product, gameId, gameCurrency });
	useRefreshBalanceWhileOpen();

	return (
		<div className={classes.sportsbook}>
			<iframe
				className={classes.sportsbookFrame}
				title={title}
				sandbox={GAME_IFRAME_SANDBOX}
				src={url}
			/>
		</div>
	);
};
