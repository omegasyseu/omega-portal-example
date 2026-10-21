import { Anchor, Group, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import GameCard from "@/components/games/game-card";
import {
	collectionSearch,
	DEFAULT_LOBBY_FILTERS,
	gameKey,
	type LobbyFilters,
	type LobbyGame,
} from "@/components/games/lobby-model.ts";
import classes from "./games-lobby.module.css";

// How many tiles a rail shows before "View All".
const RAIL_SIZE = 12;

type Props = {
	title: string;
	games: readonly LobbyGame[];
	// The Collection behind "View All (n)"; rails without one (Favourites, More games)
	// show every game.
	collection?: string;
	count?: number;
	// The filters in force, kept by "View All".
	filters?: LobbyFilters;
};

export function GameRail({
	title,
	games,
	collection,
	count,
	filters = DEFAULT_LOBBY_FILTERS,
}: Props) {
	const shown = collection ? games.slice(0, RAIL_SIZE) : games;

	return (
		<section className={classes.rail} aria-label={title}>
			<Group justify="space-between" wrap="nowrap">
				<Title order={2} className={classes.railTitle}>
					{title}
				</Title>
				{collection ? (
					<Anchor
						renderRoot={(props) => (
							<Link
								{...props}
								to="/games"
								search={collectionSearch(filters, collection)}
							/>
						)}
						className={classes.viewAll}
					>
						View All ({count ?? games.length})
					</Anchor>
				) : null}
			</Group>
			<ul className={classes.railTrack}>
				{shown.map((game) => (
					<li key={gameKey(game)} className={classes.railItem}>
						<GameCard game={game} />
					</li>
				))}
			</ul>
		</section>
	);
}

export function GameGrid({ games }: { games: readonly LobbyGame[] }) {
	return (
		<ul className={classes.grid}>
			{games.map((game) => (
				<li key={gameKey(game)}>
					<GameCard game={game} />
				</li>
			))}
		</ul>
	);
}
