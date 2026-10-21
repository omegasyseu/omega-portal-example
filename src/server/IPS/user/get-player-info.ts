import { queryOptions, useQuery } from "@tanstack/react-query";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import type { PlayerInformation } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

export type GeneralRequestType = {
	session: Session;
};

const getPlayerInfo = async ({ session }: GeneralRequestType) => {
	const API = "/getPlayerInfo";
	try {
		const res = await IPS_AXIOS_CLIENT.get<PlayerInformation>(API, {
			params: {
				sessionKey: session?.user?.sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching player info:", e);
		throw e;
	}
};

export const getPlayerInfoOptions = ({ session }: GeneralRequestType) => {
	return queryOptions({
		queryKey: ["player-info", { user: session?.user?.sessionKey }],
		queryFn: async () =>
			getPlayerInfo({
				session,
			}),
		enabled: !!session?.user && !!session?.user?.sessionKey,
		meta: {
			persist: true,
		},
	});
};

export const useGetPlayerInfo = () => {
	const { session } = useSession();
	return useQuery({
		...getPlayerInfoOptions({
			session,
		}),
	});
};
