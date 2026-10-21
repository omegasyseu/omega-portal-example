import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { EligibleJackpotsResponse } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type EligibleJackpotsParams = {
	sessionKey?: string;
};

type Response = z.infer<typeof EligibleJackpotsResponse>;

export const GetEligibleJackpots = async ({
	sessionKey,
}: EligibleJackpotsParams) => {
	const API = "/getEligibleJackpots";

	try {
		const res = await IPS_AXIOS_CLIENT.get<Response>(API, {
			params: {
				sessionKey,
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching eligible jackpots:", e);
		throw e;
	}
};

export const useFetchEligibleJackpots = () => {
	const { session } = useSession();
	return useQuery({
		queryKey: ["fetch-eligible-jackpots"],
		queryFn: () =>
			GetEligibleJackpots({
				sessionKey: session?.user?.sessionKey,
			}),
		enabled: !!session?.user?.sessionKey,
		// refetch should happen after every 2 mins
		refetchInterval: 2 * 60 * 1000,
	});
};
