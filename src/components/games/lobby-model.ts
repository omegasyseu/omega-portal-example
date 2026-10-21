import { capitalizeString } from "@/hooks/use-format/capitalizaString";

// What the games lobby shows, derived from the Brand's Lobby and Collections, the
// player's favourites and the filters in the URL. Kept free of React so the rules can
// be tested on their own.

export type LobbyGame = {
	gameId: string;
	title: string;
	gameProvider: string;
	image: string;
	// The Game Category ("slots" or "sportsbook"): what the game is, not where it's listed.
	category?: string;
};

// The icons a Collection can have, as Strapi's Collection type offers them
// (strapi/src/api/collection/content-types/collection/schema.json); change both together.
export const COLLECTION_ICONS = [
	"dice",
	"star",
	"sparkles",
	"flame",
	"crown",
	"cards",
	"live",
	"ball",
] as const;

export type CollectionIcon = (typeof COLLECTION_ICONS)[number];

// A Collection the Brand shows: a menu link and a tab, holding games from the Lobby in
// the Collection's own order.
export type GameCollection = {
	slug: string;
	name: string;
	icon: CollectionIcon;
	games: LobbyGame[];
};

// Game IDs repeat across providers (several sportsbooks are "SPORTSBOOK"), so a game
// is identified by its provider and ID together. Strapi fills each Game's key the same
// way (strapi/src/game-key.ts); change both together.
export const gameKey = ({
	gameProvider,
	gameId,
}: Pick<LobbyGame, "gameProvider" | "gameId">) => `${gameProvider}:${gameId}`;

// A game the player favourited, as the API returns it: platformCode is the
// game's provider.
export type PlayerGameRef = { gameId: string; platformCode: string };

export const playerGameKey = ({ gameId, platformCode }: PlayerGameRef) =>
	gameKey({ gameId, gameProvider: platformCode });

export const LOBBY_SORTS = ["default", "a-z"] as const;

export type LobbySort = (typeof LOBBY_SORTS)[number];

export type LobbyFilters = {
	// A Collection's slug.
	collection?: string;
	provider?: string;
	sort: LobbySort;
};

export const DEFAULT_LOBBY_FILTERS: LobbyFilters = { sort: "default" };

// A group of games the lobby lists: its key, its label and how many games it holds.
export type LobbySection = {
	key: string;
	label: string;
	count: number;
};

// A Collection's tab (or pill).
export type LobbyTab = LobbySection & { icon: CollectionIcon };

// The /games search for a set of filters. The default sort stays out of the URL.
export const lobbySearch = ({ collection, provider, sort }: LobbyFilters) => ({
	collection,
	provider,
	sort: sort === "default" ? undefined : sort,
});

// The /games search for a Collection's tab, keeping the provider and sort in force.
export const collectionSearch = (filters: LobbyFilters, collection?: string) =>
	lobbySearch({ ...filters, collection });

// A row of games with its full size for "View All (n)". A Collection's rail links to its
// tab; the rail of games no Collection holds has nowhere to link.
export type LobbyRail = LobbySection & {
	games: LobbyGame[];
	collection?: string;
};

export type LobbyInput = {
	games: readonly LobbyGame[];
	collections: readonly GameCollection[];
	favourites: readonly PlayerGameRef[];
	filters: LobbyFilters;
};

export type LobbyProvider = { value: string; label: string };

export type Lobby = {
	// One tab per Collection; they stay put while filters change.
	tabs: LobbyTab[];
	// The picked Collection's slug; undefined on All, which an unknown slug falls back to.
	collection?: string;
	providers: LobbyProvider[];
	// On All, one rail per Collection with games, then the games no Collection holds.
	rails: LobbyRail[];
	// Every game of the picked Collection, or of the Lobby for a Brand with no
	// Collections; undefined while the rails show.
	grid?: LobbyGame[];
	// The player's favourite games that are in the Lobby, filtered like the rails.
	favourites: LobbyGame[];
};

// The rail of Lobby games no Collection holds. Its key can't be a slug, which has no spaces.
const MORE_GAMES_KEY = "more games";
const MORE_GAMES_LABEL = "More games";

const toTab = ({ slug, name, icon, games }: GameCollection): LobbyTab => ({
	key: slug,
	label: name,
	icon,
	count: games.length,
});

// "PRAGMATIC_CASINO_V2" reads as "Pragmatic Casino V2".
export const providerLabel = (code: string) =>
	code
		.split("_")
		.map((word) => capitalizeString(word.toLowerCase()))
		.join(" ");

const toProviders = (games: readonly LobbyGame[]): LobbyProvider[] =>
	[...new Set(games.map(({ gameProvider }) => gameProvider))]
		.map((value) => ({ value, label: providerLabel(value) }))
		// Not toSorted: Vite's default browser targets include Firefox versions without it.
		.sort((a, b) => a.label.localeCompare(b.label));

const byTitle = (a: LobbyGame, b: LobbyGame) =>
	a.title.localeCompare(b.title, undefined, { sensitivity: "base" });

// The games the player starred, in list order. IDs repeat across providers, so a
// favourite is matched by provider and ID.
export const pickFavourites = (
	games: readonly LobbyGame[],
	favourites: readonly PlayerGameRef[],
): LobbyGame[] => {
	const favouriteKeys = new Set(favourites.map(playerGameKey));
	return games.filter((game) => favouriteKeys.has(gameKey(game)));
};

// The Collection a slug from the URL picks. A slug the Brand doesn't show, or none, picks
// no Collection, so the Games page and its menu link fall back to All.
export const pickCollection = <Collection extends Pick<GameCollection, "slug">>(
	collections: readonly Collection[],
	slug: string | undefined,
): Collection | undefined =>
	collections.find((collection) => collection.slug === slug);

const toRails = (
	games: readonly LobbyGame[],
	collections: readonly GameCollection[],
	show: (games: readonly LobbyGame[]) => LobbyGame[],
): LobbyRail[] => {
	const collected = new Set(
		collections.flatMap((collection) => collection.games.map(gameKey)),
	);
	const rails: LobbyRail[] = [
		...collections.map(({ slug, name, games: inCollection }) => ({
			key: slug,
			label: name,
			games: show(inCollection),
			collection: slug,
		})),
		{
			key: MORE_GAMES_KEY,
			label: MORE_GAMES_LABEL,
			games: show(games.filter((game) => !collected.has(gameKey(game)))),
		},
	].map((rail) => ({ ...rail, count: rail.games.length }));
	return rails.filter((rail) => rail.count > 0);
};

export const buildLobby = ({
	games,
	collections,
	favourites,
	filters,
}: LobbyInput): Lobby => {
	const show = (list: readonly LobbyGame[]) => {
		const fromProvider = filters.provider
			? list.filter(({ gameProvider }) => gameProvider === filters.provider)
			: [...list];
		return filters.sort === "a-z" ? fromProvider.sort(byTitle) : fromProvider;
	};
	const picked = pickCollection(collections, filters.collection);
	// A picked Collection, or a Brand with none, shows one grid instead of rails.
	const showsGrid = picked !== undefined || collections.length === 0;

	return {
		tabs: collections.map(toTab),
		collection: picked?.slug,
		providers: toProviders(games),
		rails: showsGrid ? [] : toRails(games, collections, show),
		grid: showsGrid ? show(picked?.games ?? games) : undefined,
		favourites: pickFavourites(show(games), favourites),
	};
};

// The home page's "Explore collections": one Collection's games in a grid that grows a page at
// a time, with a pill per Collection.
export const EXPLORE_PAGE_SIZE = 12;

export type ExploreGridInput = {
	games: readonly LobbyGame[];
	collections: readonly GameCollection[];
	// The picked pill's Collection slug.
	collection?: string;
	// How many games the grid shows; "Show more" raises it by a page.
	limit: number;
};

export type ExploreGrid = {
	tabs: LobbyTab[];
	collection?: string;
	games: LobbyGame[];
	// How many games the shown Collection holds.
	count: number;
	// The shown Collection's games not shown yet, for "Show more (n)".
	moreCount: number;
};

// Opens on the Brand's first Collection. A Brand with no Collections shows its whole Lobby.
export const exploreGames = ({
	games,
	collections,
	collection: picked,
	limit,
}: ExploreGridInput): ExploreGrid => {
	const shown = pickCollection(collections, picked) ?? collections[0];
	const inShown = shown?.games ?? games;
	return {
		tabs: collections.map(toTab),
		collection: shown?.slug,
		games: inShown.slice(0, limit),
		count: inShown.length,
		moreCount: Math.max(inShown.length - limit, 0),
	};
};
// Games whose title or provider (code or readable name) contains the query, ignoring
// case. An empty query finds nothing, so the search dropdown stays closed.
export const searchGames = (
	games: readonly LobbyGame[],
	query: string,
): LobbyGame[] => {
	const needle = query.trim().toLowerCase();
	if (!needle) {
		return [];
	}
	return games.filter(({ title, gameProvider }) =>
		[title, gameProvider, providerLabel(gameProvider)].some((text) =>
			text.toLowerCase().includes(needle),
		),
	);
};

// What to do when a player opens a game, given the currencies the game can run in.
export type LaunchPlan<Conversion> =
	| { kind: "open"; currency: string }
	| { kind: "pick"; conversions: Conversion[] }
	| { kind: "unavailable" };

export const launchPlan = <Conversion extends { gameCurrency: string }>(
	conversions: Conversion[],
	playerCurrency: string,
): LaunchPlan<Conversion> => {
	const [first] = conversions;
	if (!first) {
		return { kind: "unavailable" };
	}
	if (first.gameCurrency === playerCurrency) {
		return { kind: "open", currency: playerCurrency };
	}
	if (conversions.length === 1) {
		return { kind: "open", currency: first.gameCurrency };
	}
	return { kind: "pick", conversions };
};
