import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { GamesLobby } from "@/components/games/games-lobby.tsx";
import { LOBBY_SORTS } from "@/components/games/lobby-model.ts";

// The lobby's filters live in the URL, so a Collection's tab, a provider or a sort can be
// shared. A Collection the Brand doesn't show falls back to All.
const LobbySearchSchema = z.object({
	collection: z.string().optional().catch(undefined),
	provider: z.string().optional().catch(undefined),
	sort: z.enum(LOBBY_SORTS).optional().catch(undefined),
});

const GamesPage = () => {
	const { collection, provider, sort } = Route.useSearch();
	return (
		<GamesLobby filters={{ collection, provider, sort: sort ?? "default" }} />
	);
};

export const Route = createFileRoute("/games/")({
	component: GamesPage,
	validateSearch: LobbySearchSchema,
});
