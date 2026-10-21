import { queryOptions, useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import {
	type Session,
	useSession,
} from "@/providers/authentication/authentication.tsx";
import type { challengerResponse } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

type ChallengeParams = {
	session: Session | null;
	includeCompleted?: boolean;
};

type ChallengeResType = z.infer<typeof challengerResponse>;

export const GetChallenges = async ({
	session,
	includeCompleted,
}: ChallengeParams) => {
	const API = "/challenge";
	try {
		const res = await IPS_AXIOS_CLIENT.get<ChallengeResType>(API, {
			params: {
				sessionKey: session?.user?.sessionKey,
				...(includeCompleted && { includeCompleted }),
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching challenges:", e);
		throw e;
	}
};

export const fetchChallengeOptions = ({ session }: ChallengeParams) => {
	return queryOptions({
		queryKey: ["fetch-challenges"],
		queryFn: () =>
			GetChallenges({
				session,
			}),
		enabled: !!session?.user && !!session?.user?.sessionKey,
		refetchInterval: 2 * 60 * 1000,
	});
};

export const useFetchChallenges = () => {
	const { session } = useSession();

	return useQuery({
		...fetchChallengeOptions({
			session,
		}),
	});
};
