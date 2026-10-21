import { Anchor, Box, Group, Select, Text } from "@mantine/core";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { GameGrid, GameRail } from "@/components/games/game-rail.tsx";
import { LobbyBanners } from "@/components/games/lobby-banners.tsx";
import {
	buildLobby,
	collectionSearch,
	DEFAULT_LOBBY_FILTERS,
	LOBBY_SORTS,
	type LobbyFilters,
	type LobbyProvider,
	type LobbySort,
	type LobbyTab,
	lobbySearch,
} from "@/components/games/lobby-model.ts";
import { NoGames } from "@/components/games/no-games.tsx";
import { useGetFavoriteGames } from "@/components/games/queries/fetch-game-status.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import classes from "./games-lobby.module.css";

const SORT_LABELS: Record<LobbySort, string> = {
	default: "Default order",
	"a-z": "A–Z",
};

const SORT_OPTIONS = LOBBY_SORTS.map((value) => ({
	value,
	label: SORT_LABELS[value],
}));

const isLobbySort = (value: string | null): value is LobbySort =>
	LOBBY_SORTS.some((sort) => sort === value);

// All, then one tab per Collection the Brand shows. `active` is the shown Collection's
// slug, or undefined on All.
const CollectionTabs = ({
	tabs,
	active,
	filters,
}: {
	tabs: LobbyTab[];
	active: string | undefined;
	filters: LobbyFilters;
}) => (
	<nav aria-label="Game collections" className={classes.tabs}>
		<Anchor
			renderRoot={(props) => (
				<Link {...props} to="/games" search={collectionSearch(filters)} />
			)}
			className={classes.tab}
			data-active={active === undefined || undefined}
			aria-current={active === undefined ? "page" : undefined}
		>
			All
		</Anchor>
		{tabs.map((tab) => (
			<Anchor
				key={tab.key}
				renderRoot={(props) => (
					<Link
						{...props}
						to="/games"
						search={collectionSearch(filters, tab.key)}
					/>
				)}
				className={classes.tab}
				data-active={active === tab.key || undefined}
				aria-current={active === tab.key ? "page" : undefined}
			>
				{tab.label}
			</Anchor>
		))}
	</nav>
);

const LobbyControls = ({
	providers,
	filters,
}: {
	providers: LobbyProvider[];
	filters: LobbyFilters;
}) => {
	const navigate = useNavigate();
	const show = (next: Partial<LobbyFilters>) =>
		navigate({ to: "/games", search: lobbySearch({ ...filters, ...next }) });

	return (
		<Group gap="sm" className={classes.controls}>
			<Select
				aria-label="Provider"
				placeholder="All providers"
				data={providers}
				value={filters.provider ?? null}
				onChange={(provider) => show({ provider: provider ?? undefined })}
				clearable
				searchable
			/>
			<Select
				aria-label="Sort"
				data={SORT_OPTIONS}
				value={filters.sort}
				onChange={(sort) =>
					show({ sort: isLobbySort(sort) ? sort : "default" })
				}
				allowDeselect={false}
			/>
		</Group>
	);
};

type Props = {
	// The lobby's filters from the URL; the lobby behind the sign-in dialog has none.
	filters?: LobbyFilters;
};

// The games lobby, as on the Omega Wins casino page: banners, an All tab and one per
// Collection, filters, then one rail per Collection, or the picked Collection's full
// grid. A Brand whose lobby lists no games gets its banners and a message instead.
export const GamesLobby = ({ filters = DEFAULT_LOBBY_FILTERS }: Props) => {
	const { lobby: games, collections } = useBrandContent();
	const { data: favouriteGames } = useGetFavoriteGames();
	// Depend on the filter values, not the object, which is rebuilt on every render.
	const { collection, provider, sort } = filters;
	const lobby = useMemo(
		() =>
			buildLobby({
				games,
				collections,
				favourites: favouriteGames?.games ?? [],
				filters: { collection, provider, sort },
			}),
		[games, collections, favouriteGames, collection, provider, sort],
	);

	if (games.length === 0) {
		return (
			<Box className={classes.lobby}>
				<LobbyBanners />
				<NoGames />
			</Box>
		);
	}

	return (
		<Box className={classes.lobby}>
			<LobbyBanners />
			<CollectionTabs
				tabs={lobby.tabs}
				active={lobby.collection}
				filters={filters}
			/>
			<LobbyControls providers={lobby.providers} filters={filters} />
			{!lobby.collection && lobby.favourites.length > 0 ? (
				<GameRail title="Favourites" games={lobby.favourites} />
			) : null}
			{lobby.grid ? (
				lobby.grid.length > 0 ? (
					<GameGrid games={lobby.grid} />
				) : (
					<Text className={classes.empty}>
						No games here yet. Try another tab or provider.
					</Text>
				)
			) : (
				lobby.rails.map((rail) => (
					<GameRail
						key={rail.key}
						title={rail.label}
						games={rail.games}
						collection={rail.collection}
						count={rail.count}
						filters={filters}
					/>
				))
			)}
		</Box>
	);
};
