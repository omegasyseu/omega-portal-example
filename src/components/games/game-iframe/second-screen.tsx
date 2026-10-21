import { ActionIcon, Select, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useState } from "react";
import type { Game } from "@/components/games/game-card";
import {
	filterUndefined,
	GAME_IFRAME_SANDBOX,
} from "@/components/games/game-iframe/index.tsx";
import classes from "@/components/games/game-view/game-view.module.css";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import { API_CFG } from "@/server/config.ts";

const { GAME_LAUNCH_BASE_URL } = API_CFG;
type Props = {
	onClose: () => void;
};

const getGamesValueLabel = (games: Game[]) => {
	return games.map((game) => {
		return {
			value: `${game.gameProvider}-${game.gameId}`,
			label: game.title,
			...game,
		};
	});
};

// A second game beside the first: a picker, then the picked game under a title bar.
const SecondGameScreenLaunch = ({ onClose }: Props) => {
	const { session } = useSession();
	const { selectedAccount } = useGeneralInfo();
	const [secondGame, setSecondGame] = useState<string | null>(null);
	const { lobby } = useBrandContent();
	const url = new URL(GAME_LAUNCH_BASE_URL as string);
	const games = getGamesValueLabel(lobby);

	const currentGame = games?.find((game) => {
		return game.gameId === secondGame?.split("-")[1];
	});

	const params = new URLSearchParams(
		filterUndefined({
			product: currentGame?.gameProvider,
			gameId: currentGame?.gameId,
			playForReal: "true",
			sessionKey: selectedAccount?.sessionKey,
			brandId: session?.user?.loggedInBrand?.id,
		}),
	);
	url.search = params.toString();

	return (
		<div className={classes.secondScreen}>
			<div className={classes.secondScreenBar}>
				<Text component="span" fw={700} truncate>
					{currentGame?.title ?? "Second game"}
				</Text>
				<ActionIcon
					variant="subtle"
					size="sm"
					aria-label="Close second screen"
					onClick={onClose}
				>
					<IconX aria-hidden />
				</ActionIcon>
			</div>
			{secondGame ? (
				<iframe
					title={`Second game: ${currentGame?.title ?? ""}`}
					className={classes.iframe}
					sandbox={GAME_IFRAME_SANDBOX}
					src={url.toString()}
				/>
			) : (
				<div className={classes.secondScreenPicker}>
					<Select
						value={secondGame}
						onChange={setSecondGame}
						searchable
						allowDeselect={false}
						withCheckIcon={false}
						label="Second game"
						placeholder="Pick a game to play beside this one"
						data={games}
					/>
				</div>
			)}
		</div>
	);
};

export default SecondGameScreenLaunch;
