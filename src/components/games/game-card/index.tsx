import {
	ActionIcon,
	Box,
	type BoxProps,
	Button,
	Image,
	Text,
	UnstyledButton,
} from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";
import { useGameFavourite } from "@/components/games/hooks/use-game-favourite.ts";
import { useGameLauncher } from "@/components/games/hooks/use-game-launcher.ts";
import { LauncherCurrencyModal } from "@/components/games/launcher-currency-modal.tsx";
import type { LobbyGame } from "@/components/games/lobby-model.ts";
import { MENU_ICON_SIZE } from "@/constants/ui-sizes.ts";
import classes from "./card.module.css";

export type Game = LobbyGame;

type Props = {
	game: Game;
	// A fixed size for small spots such as quick deposit; otherwise the tile fills its cell
	// at a 3:4 ratio.
	boxProps?: BoxProps;
};

// A portrait game tile. Clicking anywhere on its art plays the game. On hover or focus it
// shows the name at the top and Play across the bottom; the heart, as on Omega Wins,
// toggles the game as a favourite.
const GameCard = ({ boxProps, game }: Props) => {
	const { launch, isLaunching, picker, closePicker } = useGameLauncher();
	const favourite = useGameFavourite(game);

	return (
		<>
			<Box
				className={classes.tile}
				w={boxProps?.w}
				h={boxProps?.h}
				data-fixed-size={boxProps?.h !== undefined || undefined}
			>
				<Image
					src={game.image}
					alt=""
					loading="lazy"
					className={classes.image}
				/>
				{/* The whole art plays the game: a pointer shortcut, left out of the tab order
				    and screen readers since Play does the same. A click doesn't focus it, so
				    focus never rests on a hidden control (the currency picker returns focus). */}
				<UnstyledButton
					className={classes.art}
					onClick={() => launch(game)}
					onMouseDown={(event) => event.preventDefault()}
					tabIndex={-1}
					aria-hidden
				/>
				<div className={classes.overlay}>
					<Text className={classes.title} lineClamp={2}>
						{game.title}
					</Text>
					<Button
						fullWidth
						className={classes.play}
						loading={isLaunching}
						onClick={() => launch(game)}
						aria-label={`Play ${game.title}`}
					>
						Play
					</Button>
				</div>
				<div className={classes.actions}>
					<ActionIcon
						variant="subtle"
						aria-label={`Favourite ${game.title}`}
						aria-pressed={favourite.isFavourite}
						disabled={favourite.isPending}
						onClick={favourite.toggle}
						className={classes.action}
					>
						<IconHeart
							size={MENU_ICON_SIZE}
							className={favourite.isFavourite ? classes.favourite : undefined}
							aria-hidden
						/>
					</ActionIcon>
				</div>
			</Box>
			<LauncherCurrencyModal picker={picker} onClose={closePicker} />
		</>
	);
};

export default GameCard;
