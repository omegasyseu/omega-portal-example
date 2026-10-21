import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { gameKey, playerGameKey } from "@/components/games/lobby-model.ts";
import { useGetFavoriteGames } from "@/components/games/queries/fetch-game-status.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { BaseResponse } from "@/schemas-types";
import { IPS_AXIOS_CLIENT, IPSErrors } from "@/server/IPS/IPS_CONFIG.ts";

type ToggleGamesParams = {
	gameId: string;
	productCode: string;
};

// Adds a game to the player's favourites, or removes it if it's already one.
export const useToggleFavorite = () => {
	const { session } = useSession();
	const { data: games, refetch } = useGetFavoriteGames();
	// IDs repeat across providers, so a favourite is matched by provider and ID.
	const isFavourite = ({ gameId, productCode }: ToggleGamesParams) => {
		const key = gameKey({ gameId, gameProvider: productCode });
		return Boolean(games?.games?.some((game) => playerGameKey(game) === key));
	};

	return useMutation({
		mutationKey: ["toggle-favorite-games"],
		mutationFn: async ({ gameId, productCode }: ToggleGamesParams) => {
			const gameIsAlreadyToggled = isFavourite({ gameId, productCode });

			const path = `/${
				gameIsAlreadyToggled ? "removeFavoriteGame" : "addFavoriteGame"
			}`;

			try {
				const res = await IPS_AXIOS_CLIENT.post<BaseResponse>(path, {
					sessionKey: session?.user?.sessionKey,
					gameId,
					platformCode: productCode,
				});
				return res.data;
			} catch (e) {
				console.error("Error toggling favorite game:", e);
				throw e;
			}
		},
		onSuccess: async (_, params) => {
			const gameIsAlreadyToggled = isFavourite(params);

			await refetch();
			notifications.show({
				title: "Success",
				message: `Game ${gameIsAlreadyToggled ? "removed" : "added"} successfully`,
				color: "neon",
				withCloseButton: true,
			});
		},

		onError: (error) => {
			if (error instanceof IPSErrors) {
				notifications.show({
					title: "Error favoriting game",
					message: error.message,
					color: "danger",
					withCloseButton: true,
				});
			}
		},
	});
};
