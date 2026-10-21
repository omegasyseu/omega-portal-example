import { useQuery } from "@tanstack/react-query";
import { lobbyGameFor } from "@/providers/brand-content/brand-content.ts";
import { getStrapiUrl } from "@/server/config.ts";
import {
	fetchStrapiOne,
	strapiQueryOptions,
} from "@/server/STRAPI/strapi-client.ts";
import { gameSchema } from "@/server/STRAPI/strapi-schemas.ts";

// One published game by its key ("PROVIDER:gameId"), whichever Brands list it, or null
// when Strapi has none.
const fetchStrapiGame = async (key: string, signal: AbortSignal) => {
	const game = await fetchStrapiOne(
		`/api/games?filters[key][$eq]=${encodeURIComponent(key)}&populate[tile]=true`,
		gameSchema,
		signal,
	);
	return game ? lobbyGameFor(game, getStrapiUrl()) : null;
};

// For a game opened by direct link that the Selected Brand's lobby doesn't list. Skipped
// while the key is undefined.
export const useStrapiGameQuery = (key: string | undefined) =>
	useQuery(strapiQueryOptions("strapi-game", key, fetchStrapiGame));
