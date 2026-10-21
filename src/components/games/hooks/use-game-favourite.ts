import { useSendToSignIn } from "@/components/auth/hooks/use-send-to-sign-in.ts";
import { useToggleFavorite } from "@/components/games/hooks/use-toggle-game-status.ts";
import {
	gameKey,
	type LobbyGame,
	playerGameKey,
} from "@/components/games/lobby-model.ts";
import { useGetFavoriteGames } from "@/components/games/queries/fetch-game-status.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";

// Whether a game is one of the player's favourites, and a toggle for it. Favouriting is
// personal, so a logged-out visitor is sent to sign in instead.
export const useGameFavourite = (
	game: Pick<LobbyGame, "gameId" | "gameProvider">,
) => {
	const { session } = useSession();
	const sendToSignIn = useSendToSignIn();
	const { data: favouriteGames } = useGetFavoriteGames();
	const toggleFavourite = useToggleFavorite();

	// IDs repeat across providers, so match on provider and ID together.
	const key = gameKey(game);
	const isFavourite = Boolean(
		favouriteGames?.games?.some(
			(favourite) => playerGameKey(favourite) === key,
		),
	);

	const toggle = () => {
		if (!session?.user) {
			void sendToSignIn();
			return;
		}
		toggleFavourite.mutate({
			gameId: game.gameId,
			productCode: game.gameProvider,
		});
	};

	return { isFavourite, toggle, isPending: toggleFavourite.isPending };
};
