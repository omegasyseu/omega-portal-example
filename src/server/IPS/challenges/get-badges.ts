import { queryOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import type { GetBadgesResponse } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type ResponseType = z.infer<typeof GetBadgesResponse>;

const getBadges = async (session: Session) => {
	const API = "/challenge/badges";
	try {
		const res = await IPS_AXIOS_CLIENT.get<ResponseType>(API, {
			params: {
				sessionKey: session?.user?.sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching challenge badge:", e);
		throw e;
	}
};
const getBadgesOptions = (session: Session) => {
	return queryOptions({
		queryKey: ["Get-badges", { sessionKey: session?.user?.sessionKey }],
		queryFn: async () => await getBadges(session),
		enabled: !!session?.user?.sessionKey && !!session?.user,
	});
};

export const useGetBadges = () => {
	const { session } = useSession();
	return useQuery({
		...getBadgesOptions(session),
	});
};
