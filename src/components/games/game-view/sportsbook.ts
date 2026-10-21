type ListedGame = { gameProvider: string; category?: string };

const SPORTSBOOK_CATEGORY = "sportsbook";

// A sportsbook is a provider whose listed games are in the sportsbook Game Category. It
// brings its own sports and market navigation, so the game page gives it the whole page
// body instead of the game frame.
export const isSportsbook = (
	productCode: string | undefined,
	games: readonly ListedGame[],
) =>
	productCode !== undefined &&
	games.some(
		(game) =>
			game.gameProvider === productCode &&
			game.category === SPORTSBOOK_CATEGORY,
	);

// A search value as text; the router reads numeric values as numbers.
export const searchText = (value: string | number | undefined) =>
	value === undefined ? undefined : `${value}`;

// The name the game was opened with, or its ID when the link has none.
export const gameTitle = (
	gameName: string | number | undefined,
	gameId: string,
) => searchText(gameName) ?? gameId;
