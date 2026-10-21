import { ActionIcon } from "@mantine/core";
import { IconMinimize } from "@tabler/icons-react";
import type { Ref } from "react";
import SecondGameScreenLaunch from "@/components/games/game-iframe/second-screen.tsx";
import classes from "@/components/games/game-view/game-view.module.css";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { API_CFG } from "@/server/config.ts";

const { GAME_LAUNCH_BASE_URL } = API_CFG;
type Props = {
	product: string;
	gameId: string;
	gameCurrency: string;
	// The frame element, which the toolbar puts into fullscreen.
	ref?: Ref<HTMLDivElement>;
	isSecondScreenOpen: boolean;
	onCloseSecondScreen: () => void;
	// In fullscreen the toolbar is off screen, so the frame shows its own exit button.
	isFullscreen: boolean;
	onExitFullscreen: () => void;
};

// What a game's iframe may do: run its scripts and keep its own origin, nothing more.
export const GAME_IFRAME_SANDBOX = "allow-same-origin allow-scripts";

type GameLaunch = { product: string; gameId: string; gameCurrency?: string };

// biome-ignore lint/suspicious/noExplicitAny: accepts any object shape
export function filterUndefined(obj: Record<string, any>) {
	return Object.fromEntries(
		Object.entries(obj).filter(([, value]) => value !== undefined),
	);
}

// The game container URL that launches a game for real money in the player's session.
export const useGameLaunchUrl = ({
	product,
	gameId,
	gameCurrency,
}: GameLaunch) => {
	const { session } = useSession();
	const { selectedAccount } = useGeneralInfo();

	const url = new URL(GAME_LAUNCH_BASE_URL as string);
	const params = new URLSearchParams(
		filterUndefined({
			product,
			gameId,
			playForReal: "true",
			sessionKey: selectedAccount?.sessionKey,
			gameCurrency,
			brandId: session?.user?.loggedInBrand?.id,
		}),
	);

	url.search = params.toString();
	return url.toString();
};

// The game in its rounded frame, with an optional second game beside it.
const GameIframe = ({
	gameCurrency,
	gameId,
	product,
	ref,
	isSecondScreenOpen,
	onCloseSecondScreen,
	isFullscreen,
	onExitFullscreen,
}: Props) => {
	const url = useGameLaunchUrl({ product, gameId, gameCurrency });

	return (
		<div ref={ref} className={classes.frame}>
			<iframe
				className={classes.iframe}
				title={gameId}
				sandbox={GAME_IFRAME_SANDBOX}
				src={url}
			/>
			{isSecondScreenOpen ? (
				<SecondGameScreenLaunch onClose={onCloseSecondScreen} />
			) : null}
			{isFullscreen ? (
				<ActionIcon
					variant="default"
					size="input-sm"
					aria-label="Exit fullscreen"
					onClick={onExitFullscreen}
					className={classes.exitFullscreen}
				>
					<IconMinimize aria-hidden />
				</ActionIcon>
			) : null}
		</div>
	);
};

export default GameIframe;
