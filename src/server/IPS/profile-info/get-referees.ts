import { queryOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { getRefereesSchema } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type Params = {
	sessionKey?: string;
};

type Response = z.infer<typeof getRefereesSchema>;

const getReferees = async ({ sessionKey }: Params) => {
	const API = "/getReferees";
	try {
		const res = await IPS_AXIOS_CLIENT.get<Response>(API, {
			params: {
				sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching referees:", e);
		throw e;
	}
};

export const getRefereeOptions = ({ sessionKey }: Params) => {
	return queryOptions({
		queryKey: ["getReferees"],
		queryFn: () => getReferees({ sessionKey }),
		enabled: !!sessionKey,
		// gcTime: 1000 * 60 * 60 * 24,
		// staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
	});
};

export const useGetReferee = () => {
	const { session } = useSession();
	return useQuery({
		...getRefereeOptions({
			sessionKey: session?.user?.sessionKey,
		}),
	});
};
