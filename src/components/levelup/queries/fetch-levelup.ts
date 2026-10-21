import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { useSession } from "@/providers/authentication/authentication.tsx";
import type { LevelUpResponse } from "@/schemas-types/levelup";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

const AFTER_ERROR_REFETCH_MS = 5 * 60 * 1000;

type LevelupParams = {
	sessionKey?: string;
	includeRedeemedAwards?: boolean;
};

type Response = z.infer<typeof LevelUpResponse>;

export const GetLevelUpInfo = async ({
	sessionKey,
	includeRedeemedAwards,
}: LevelupParams) => {
	const API = "/levelup";

	try {
		const res = await IPS_AXIOS_CLIENT.get<Response>(API, {
			params: {
				sessionKey,
				...(includeRedeemedAwards && { includeRedeemedAwards }),
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching level up information:", e);
		throw e;
	}
};

export const useFetchLevelupInfo = ({
	includeRedeemedAwards,
	refetchInterval = 3 * 1000, //3 seconds
	isEnabled = true,
}: Pick<LevelupParams, "includeRedeemedAwards"> & {
	refetchInterval?: number;
	// Off for a Brand that hides the feature.
	isEnabled?: boolean;
}) => {
	const { session } = useSession();
	const sessionKey = session?.user?.sessionKey;
	return useQuery({
		// Keyed by session, so a new login never shows the previous player's progress.
		queryKey: ["fetch-levelup-info", includeRedeemedAwards, { sessionKey }],
		queryFn: () =>
			GetLevelUpInfo({
				sessionKey,
				includeRedeemedAwards,
			}),
		enabled: isEnabled && !!sessionKey,
		// A brand without the feature answers with an error: ask rarely rather than
		// polling a failing request, and pick up again if it starts answering.
		refetchInterval: (query) =>
			query.state.status === "error" ? AFTER_ERROR_REFETCH_MS : refetchInterval,
	});
};
