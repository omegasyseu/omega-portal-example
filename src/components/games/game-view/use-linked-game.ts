import { isSportsbook } from "@/components/games/game-view/sportsbook.ts";
import { gameKey } from "@/components/games/lobby-model.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useStrapiGameQuery } from "@/server/STRAPI/get-strapi-game.ts";

// The game a /games/$game link opens. The Selected Brand's lobby usually lists it; a
// Disabled Game opened by direct link is looked up in Strapi on its own. A game neither
// knows still launches, under the name in the link and in the game frame.
export const useLinkedGame = (
	gameProvider: string | undefined,
	gameId: string | undefined,
) => {
	const { lobby } = useBrandContent();
	const key =
		gameProvider && gameId ? gameKey({ gameProvider, gameId }) : undefined;
	const listed = key ? lobby.find((game) => gameKey(game) === key) : undefined;
	const lookup = useStrapiGameQuery(listed ? undefined : key);

	const game = listed ?? lookup.data ?? undefined;
	return {
		game,
		isSportsbook: isSportsbook(gameProvider, game ? [...lobby, game] : lobby),
		// Only while an unlisted game is being looked up.
		isLoading: lookup.isLoading,
		lookupError: lookup.error,
	};
};
