import { ActionIcon, Button, Group, Title } from "@mantine/core";
import {
	IconChevronLeft,
	IconHeart,
	IconLayoutColumns,
	IconMaximize,
	IconMinimize,
	IconViewportWide,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useGameFavourite } from "@/components/games/hooks/use-game-favourite.ts";
import type { LobbyGame } from "@/components/games/lobby-model.ts";
import { MENU_ICON_SIZE } from "@/constants/ui-sizes.ts";
import classes from "./game-view.module.css";
import { WidgetSettingsMenu } from "./widget-settings-menu.tsx";

type Props = {
	game: Pick<LobbyGame, "gameId" | "gameProvider" | "title">;
	isFullscreen: boolean;
	onToggleFullscreen: () => void;
	isSecondScreenOpen: boolean;
	onToggleSecondScreen: () => void;
	isTheatreMode: boolean;
	onToggleTheatreMode: () => void;
};

// Back to the page the game was opened from, or the lobby when it was opened directly.
// It navigates rather than stepping back in history: the game iframe's own navigation
// adds history entries the router doesn't know about.
const useGoBack = () => {
	const navigate = useNavigate();
	const gameFrom = useLocation({ select: ({ state }) => state.gameFrom });
	return () =>
		void (gameFrom ? navigate({ href: gameFrom }) : navigate({ to: "/games" }));
};

const FavouriteButton = ({ game }: Pick<Props, "game">) => {
	const favourite = useGameFavourite(game);
	return (
		<ActionIcon
			variant="default"
			size="input-sm"
			aria-label="Favourite"
			aria-pressed={favourite.isFavourite}
			disabled={favourite.isPending}
			onClick={favourite.toggle}
		>
			<IconHeart
				size={MENU_ICON_SIZE}
				className={favourite.isFavourite ? classes.favourite : undefined}
				aria-hidden
			/>
		</ActionIcon>
	);
};

// Below the game: Back, the title, then second screen, theatre mode, Fullscreen,
// ⚙ Game widgets and ♥ Favourite. Second screen and theatre mode are for wide screens:
// on narrower ones the game already takes the full width.
export function GameToolbar({
	game,
	isFullscreen,
	onToggleFullscreen,
	isSecondScreenOpen,
	onToggleSecondScreen,
	isTheatreMode,
	onToggleTheatreMode,
}: Props) {
	const goBack = useGoBack();

	return (
		<div className={classes.toolbar}>
			<Button
				variant="default"
				leftSection={<IconChevronLeft size={MENU_ICON_SIZE} aria-hidden />}
				onClick={goBack}
			>
				Back
			</Button>
			<Title order={1} className={classes.toolbarTitle}>
				{game.title}
			</Title>
			<Group gap="xs" wrap="nowrap">
				<ActionIcon
					variant="default"
					size="input-sm"
					aria-label="Second screen"
					aria-pressed={isSecondScreenOpen}
					onClick={onToggleSecondScreen}
					visibleFrom="md"
					className={classes.toolbarToggle}
				>
					<IconLayoutColumns size={MENU_ICON_SIZE} aria-hidden />
				</ActionIcon>
				<ActionIcon
					variant="default"
					size="input-sm"
					aria-label="Theatre mode"
					aria-pressed={isTheatreMode}
					onClick={onToggleTheatreMode}
					visibleFrom="md"
					className={classes.toolbarToggle}
				>
					<IconViewportWide size={MENU_ICON_SIZE} aria-hidden />
				</ActionIcon>
				<ActionIcon
					variant="default"
					size="input-sm"
					aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
					onClick={onToggleFullscreen}
				>
					{isFullscreen ? (
						<IconMinimize size={MENU_ICON_SIZE} aria-hidden />
					) : (
						<IconMaximize size={MENU_ICON_SIZE} aria-hidden />
					)}
				</ActionIcon>
				<WidgetSettingsMenu />
				<FavouriteButton game={game} />
			</Group>
		</div>
	);
}
