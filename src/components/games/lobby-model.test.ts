import { describe, expect, it } from "vitest";
import {
	buildLobby,
	collectionSearch,
	exploreGames,
	type GameCollection,
	gameKey,
	type LobbyGame,
	launchPlan,
	lobbySearch,
	pickCollection,
	pickFavourites,
	searchGames,
} from "@/components/games/lobby-model.ts";

const game = (
	gameId: string,
	title: string,
	gameProvider: string,
	category?: string,
) => ({ gameId, title, gameProvider, category, image: `/games/${gameId}.jpg` });

const GAMES = [
	game("aztec_fire", "Aztec Fire", "THREEOAKS", "slots"),
	game("big_bass", "Big Bass Splash", "PRAGMATIC_CASINO_V2", "slots"),
	game("delasport", "Delasport", "DELASPORT", "sportsbook"),
	game("coin_volcano", "Coin Volcano", "THREEOAKS", "slots"),
];
const [AZTEC_FIRE, BIG_BASS, DELASPORT, COIN_VOLCANO] = GAMES;

const collection = (
	slug: string,
	name: string,
	games: LobbyGame[],
): GameCollection => ({ slug, name, icon: "dice", games });

// The seeded Collections, and a Featured one holding a game that's also in Slots.
const SLOTS = collection("slots", "Slots", [
	AZTEC_FIRE,
	BIG_BASS,
	COIN_VOLCANO,
]);
const SPORTS = collection("sports", "Sports", [DELASPORT]);
const FEATURED = collection("featured", "Featured", [COIN_VOLCANO]);
const COLLECTIONS = [SLOTS, SPORTS];

const NO_FILTERS = { sort: "default" } as const;

const lobbyWith = (
	filters: Parameters<typeof buildLobby>[0]["filters"],
	collections: GameCollection[] = COLLECTIONS,
	games: LobbyGame[] = GAMES,
) => buildLobby({ games, collections, favourites: [], filters });

const railGames = (rails: ReturnType<typeof buildLobby>["rails"]) =>
	rails.map((rail) => [rail.key, rail.games.map((g) => g.gameId)]);

describe("buildLobby", () => {
	it("makes one tab per Collection, in the Brand's order, with how many games it holds", () => {
		expect(lobbyWith(NO_FILTERS, [FEATURED, ...COLLECTIONS]).tabs).toEqual([
			{ key: "featured", label: "Featured", icon: "dice", count: 1 },
			{ key: "slots", label: "Slots", icon: "dice", count: 3 },
			{ key: "sports", label: "Sports", icon: "dice", count: 1 },
		]);
	});

	it("shows one rail per Collection on the All tab, in each Collection's own order", () => {
		const {
			rails,
			grid,
			collection: picked,
		} = lobbyWith(NO_FILTERS, [
			collection("slots", "Slots", [COIN_VOLCANO, AZTEC_FIRE, BIG_BASS]),
			SPORTS,
		]);

		expect([railGames(rails), grid, picked]).toEqual([
			[
				["slots", ["coin_volcano", "aztec_fire", "big_bass"]],
				["sports", ["delasport"]],
			],
			undefined,
			undefined,
		]);
	});

	it("shows a game that's in two Collections in both", () => {
		const { rails } = lobbyWith(NO_FILTERS, [FEATURED, ...COLLECTIONS]);

		expect(railGames(rails)).toEqual([
			["featured", ["coin_volcano"]],
			["slots", ["aztec_fire", "big_bass", "coin_volcano"]],
			["sports", ["delasport"]],
		]);
	});

	it("puts the lobby games no Collection holds in a last rail, so All shows every game", () => {
		const { rails } = lobbyWith(NO_FILTERS, [FEATURED]);

		expect(
			rails.map((rail) => [
				rail.label,
				rail.collection,
				rail.games.map((g) => g.gameId),
			]),
		).toEqual([
			["Featured", "featured", ["coin_volcano"]],
			["More games", undefined, ["aztec_fire", "big_bass", "delasport"]],
		]);
	});

	it("shows the picked Collection's full grid instead of rails", () => {
		const {
			rails,
			grid,
			collection: picked,
		} = lobbyWith({
			...NO_FILTERS,
			collection: "slots",
		});

		expect([rails, grid?.map((g) => g.gameId), picked]).toEqual([
			[],
			["aztec_fire", "big_bass", "coin_volcano"],
			"slots",
		]);
	});

	it("shows an empty grid for a Collection with no games", () => {
		const { tabs, grid } = lobbyWith({ ...NO_FILTERS, collection: "new" }, [
			...COLLECTIONS,
			collection("new", "New Releases", []),
		]);

		expect([tabs.at(-1)?.count, grid]).toEqual([0, []]);
	});

	it("falls back to All for a Collection the Brand doesn't show", () => {
		const {
			rails,
			grid,
			collection: picked,
		} = lobbyWith({
			...NO_FILTERS,
			collection: "bingo",
		});

		expect([rails.length, grid, picked]).toEqual([2, undefined, undefined]);
	});

	it("shows every lobby game in one grid, with no tabs, for a Brand with no Collections", () => {
		const { tabs, rails, grid } = lobbyWith(NO_FILTERS, []);

		expect([tabs, rails, grid?.map((g) => g.gameId)]).toEqual([
			[],
			[],
			["aztec_fire", "big_bass", "delasport", "coin_volcano"],
		]);
	});

	it("has no tabs, rails, providers or favourites for an empty game list", () => {
		const { tabs, rails, providers, favourites } = buildLobby({
			games: [],
			collections: [],
			favourites: [{ gameId: "aztec_fire", platformCode: "THREEOAKS" }],
			filters: NO_FILTERS,
		});

		expect([tabs, rails, providers, favourites]).toEqual([[], [], [], []]);
	});

	it("keeps only the picked provider's games, in rails and grid alike", () => {
		const threeOaks = { ...NO_FILTERS, provider: "THREEOAKS" };
		const { rails } = lobbyWith(threeOaks);
		const { grid } = lobbyWith({ ...threeOaks, collection: "slots" });

		expect([
			rails.map((rail) => [rail.key, rail.count]),
			grid?.map((g) => g.gameId),
		]).toEqual([[["slots", 2]], ["aztec_fire", "coin_volcano"]]);
	});

	it("lists every provider once, with a readable name, for the filter", () => {
		expect(lobbyWith(NO_FILTERS).providers).toEqual([
			{ value: "DELASPORT", label: "Delasport" },
			{ value: "PRAGMATIC_CASINO_V2", label: "Pragmatic Casino V2" },
			{ value: "THREEOAKS", label: "Threeoaks" },
		]);
	});

	it("sorts games A to Z by title when asked, and keeps the Collection's order otherwise", () => {
		const unsorted = [
			game("zeus", "Zeus Rising", "THREEOAKS", "slots"),
			game("apollo", "apollo's Gold", "THREEOAKS", "slots"),
			game("medusa", "Medusa", "THREEOAKS", "slots"),
		];
		const titlesWith = (sort: "default" | "a-z") =>
			lobbyWith(
				{ sort },
				[collection("slots", "Slots", unsorted)],
				unsorted,
			).rails[0]?.games.map((g) => g.title);

		expect([titlesWith("default"), titlesWith("a-z")]).toEqual([
			["Zeus Rising", "apollo's Gold", "Medusa"],
			["apollo's Gold", "Medusa", "Zeus Rising"],
		]);
	});

	it("builds the Favourites rail in lobby order, ignoring games not in the lobby", () => {
		const { favourites } = buildLobby({
			games: GAMES,
			collections: COLLECTIONS,
			favourites: [
				{ gameId: "coin_volcano", platformCode: "THREEOAKS" },
				{ gameId: "retired_game", platformCode: "THREEOAKS" },
				{ gameId: "aztec_fire", platformCode: "THREEOAKS" },
			],
			filters: NO_FILTERS,
		});

		expect(favourites.map((g) => g.gameId)).toEqual([
			"aztec_fire",
			"coin_volcano",
		]);
	});

	it("only favourites the provider's game when an ID repeats across providers", () => {
		const sportsbooks = [
			game("SPORTSBOOK", "SportRadar", "SPORT_RADAR", "sportsbook"),
			game("SPORTSBOOK", "DELASPORT", "DELASPORT", "sportsbook"),
		];
		const { favourites } = buildLobby({
			games: sportsbooks,
			collections: [],
			favourites: [{ gameId: "SPORTSBOOK", platformCode: "DELASPORT" }],
			filters: NO_FILTERS,
		});

		expect(favourites.map((g) => g.title)).toEqual(["DELASPORT"]);
	});

	it("has an empty Favourites rail when the player has none", () => {
		expect(lobbyWith(NO_FILTERS).favourites).toEqual([]);
	});
});

describe("searchGames", () => {
	it.each([
		["a title, ignoring case", "VOLCANO", ["coin_volcano"]],
		["a provider", "pragmatic", ["big_bass"]],
		["a provider by its readable name", "Pragmatic Casino", ["big_bass"]],
		["part of a word", "aztec", ["aztec_fire"]],
	])("finds games by %s", (_kind, query, ids) => {
		expect(searchGames(GAMES, query).map((g) => g.gameId)).toEqual(ids);
	});

	it.each(["", "   "])("finds nothing for an empty query %j", (query) => {
		expect(searchGames(GAMES, query)).toEqual([]);
	});

	it("finds nothing when no game matches", () => {
		expect(searchGames(GAMES, "roulette")).toEqual([]);
	});
});

describe("gameKey", () => {
	it("tells apart games that share an ID across providers", () => {
		const sportRadar = game(
			"SPORTSBOOK",
			"SportRadar",
			"SPORT_RADAR",
			"sportsbook",
		);
		const delasport = game(
			"SPORTSBOOK",
			"DELASPORT",
			"DELASPORT",
			"sportsbook",
		);

		expect(gameKey(sportRadar)).not.toBe(gameKey(delasport));
	});
});

describe("collectionSearch", () => {
	it("keeps the provider and sort in force when switching Collection", () => {
		expect(
			collectionSearch({ sort: "a-z", provider: "THREEOAKS" }, "slots"),
		).toEqual({ collection: "slots", provider: "THREEOAKS", sort: "a-z" });
	});

	it("leaves the default sort and missing filters out of the URL", () => {
		expect(collectionSearch({ sort: "default" })).toEqual({
			collection: undefined,
			provider: undefined,
			sort: undefined,
		});
	});
});

describe("launchPlan", () => {
	const conversion = (gameCurrency: string) => ({
		playerCurrency: "EUR",
		gameCurrency,
		currentRate: 1,
		playerCurrencyType: "REAL",
		gameCurrencyType: "REAL",
	});

	it("opens the game in the player's currency when it is the first offered", () => {
		expect(launchPlan([conversion("EUR"), conversion("USD")], "EUR")).toEqual({
			kind: "open",
			currency: "EUR",
		});
	});

	it("opens the game in the only currency offered", () => {
		expect(launchPlan([conversion("USD")], "EUR")).toEqual({
			kind: "open",
			currency: "USD",
		});
	});

	it("lets the player pick when several other currencies are offered", () => {
		const offered = [conversion("USD"), conversion("GBP")];

		expect(launchPlan(offered, "EUR")).toEqual({
			kind: "pick",
			conversions: offered,
		});
	});

	it("reports the game unavailable when no currency is offered", () => {
		expect(launchPlan([], "EUR")).toEqual({ kind: "unavailable" });
	});
});

describe("lobbySearch", () => {
	it("writes the filters to the URL, leaving out the default sort", () => {
		expect(
			lobbySearch({
				sort: "default",
				provider: "THREEOAKS",
				collection: "slots",
			}),
		).toEqual({ collection: "slots", provider: "THREEOAKS", sort: undefined });
	});
});

describe("exploreGames", () => {
	it("opens on the Brand's first Collection and shows its first games, counting the ones left", () => {
		const explore = exploreGames({
			games: GAMES,
			collections: COLLECTIONS,
			limit: 2,
		});

		expect({
			pills: explore.tabs.map((tab) => tab.key),
			collection: explore.collection,
			games: explore.games.map((g) => g.gameId),
			count: explore.count,
			moreCount: explore.moreCount,
		}).toEqual({
			pills: ["slots", "sports"],
			collection: "slots",
			games: ["aztec_fire", "big_bass"],
			count: 3,
			moreCount: 1,
		});
	});

	it("shows the picked Collection, with nothing more once every game is shown", () => {
		const explore = exploreGames({
			games: GAMES,
			collections: COLLECTIONS,
			collection: "sports",
			limit: 12,
		});

		expect({
			collection: explore.collection,
			games: explore.games.map((g) => g.gameId),
			moreCount: explore.moreCount,
		}).toEqual({ collection: "sports", games: ["delasport"], moreCount: 0 });
	});

	it("shows every lobby game, with no pills, for a Brand with no Collections", () => {
		const explore = exploreGames({ games: GAMES, collections: [], limit: 3 });

		expect({
			pills: explore.tabs,
			collection: explore.collection,
			games: explore.games.map((g) => g.gameId),
			moreCount: explore.moreCount,
		}).toEqual({
			pills: [],
			collection: undefined,
			games: ["aztec_fire", "big_bass", "delasport"],
			moreCount: 1,
		});
	});
});

describe("pickFavourites", () => {
	it("keeps the favourite games in list order, matched by provider and ID", () => {
		expect(
			pickFavourites(GAMES, [
				{ gameId: "coin_volcano", platformCode: "THREEOAKS" },
				{ gameId: "aztec_fire", platformCode: "THREEOAKS" },
				{ gameId: "big_bass", platformCode: "ANOTHER_PROVIDER" },
			]).map((g) => g.gameId),
		).toEqual(["aztec_fire", "coin_volcano"]);
	});

	it("is empty when nothing is starred", () => {
		expect(pickFavourites(GAMES, [])).toEqual([]);
	});
});

describe("pickCollection", () => {
	it("picks the Collection the Brand shows under that slug", () => {
		expect(pickCollection(COLLECTIONS, "sports")).toBe(SPORTS);
	});

	it("picks none, so the Games page shows All, for a slug the Brand doesn't show or no slug", () => {
		expect(pickCollection(COLLECTIONS, "featured")).toBeUndefined();
		expect(pickCollection(COLLECTIONS, undefined)).toBeUndefined();
	});
});
