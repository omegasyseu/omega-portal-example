import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
	Bonus,
	noBonusesWhenNotFound,
} from "@/components/bonuses/queries/get-active-bonuses.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";

export const getBonusesHistorySchema = z
	.object({
		status: z.string(),
		bonuses: z.array(Bonus.optional()).optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

type ResponseType = z.infer<typeof getBonusesHistorySchema>;

export const BONUS_HISTORY_KEY = "bonus-history";

type BonusesHistory = {
	startDate: string;
	endDate: string;
	sessionKey?: string;
};

const getBonusesHistory = async ({
	startDate,
	endDate,
	sessionKey,
}: BonusesHistory) => {
	const API = "/getBonuses";
	try {
		const res = await IPS_AXIOS_CLIENT.get<ResponseType>(API, {
			params: {
				sessionKey,
				endDate,
				startDate,
			},
		});
		return res.data;
	} catch (e) {
		return noBonusesWhenNotFound(e);
	}
};
const getBonusesHistoryOptions = ({
	sessionKey,
	endDate,
	startDate,
}: BonusesHistory) => {
	return queryOptions({
		queryKey: [BONUS_HISTORY_KEY, { sessionKey, endDate, startDate }],
		queryFn: async () =>
			await getBonusesHistory({
				startDate,
				endDate,
				sessionKey,
			}),
		enabled: !!sessionKey,
	});
};

export const useGetBonusesHistory = ({
	startDate,
	endDate,
}: Omit<BonusesHistory, "sessionKey">) => {
	const { session } = useSession();
	return useQuery({
		...getBonusesHistoryOptions({
			sessionKey: session?.user?.sessionKey,
			startDate,
			endDate,
		}),
	});
};
