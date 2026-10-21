import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import type { GeneralRequestType } from "@/server/IPS/user/get-player-info.ts";
import { Five_MINUTES } from "@/utils/minutes.ts";

export const fetchGameStatusSchema = z
	.object({
		games: z
			.array(z.object({ gameId: z.string(), platformCode: z.string() }))
			.optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

type PlayerGames = z.infer<typeof fetchGameStatusSchema>;

const fetchGameStatus = async (
	apiEndpoint: string,
	{ session }: GeneralRequestType,
) => {
	try {
		const res = await IPS_AXIOS_CLIENT.get<PlayerGames>(apiEndpoint, {
			params: {
				sessionKey: session?.user?.sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching game status:", e);
		throw e;
	}
};

const createQueryOptions = (
	apiEndpoint: string,
	queryKey: string,
	{ session }: GeneralRequestType,
) =>
	queryOptions({
		queryKey: [queryKey, { user: session?.user?.sessionKey }],
		queryFn: () => fetchGameStatus(apiEndpoint, { session }),
		enabled: !!session?.user?.sessionKey && !!session?.user,
		gcTime: Five_MINUTES,
		staleTime: Five_MINUTES,
	});
export const getFavGamesQueryOptions = (generalRequest: GeneralRequestType) =>
	createQueryOptions("/getFavoriteGames", "Get-Favorite-games", generalRequest);

export const useGetFavoriteGames = () => {
	const { session } = useSession();
	return useQuery({
		...getFavGamesQueryOptions({ session }),
	});
};
