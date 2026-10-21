import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { AllLeaderboardsType } from "@/schemas-types";
import { AMS_AXIOS_CLIENT } from "@/server/AMS/AMS_CONFIG.ts";

type Params = {
	brandId?: string | number;
	status?: string;
	period?: string;
	startDate?: string;
	endDate?: string;
};

export const getAllLeaderboards = async ({
	brandId,
	endDate,
	startDate,
	period,
	status,
}: Params) => {
	const API = "/leaderboards";
	try {
		const res = await AMS_AXIOS_CLIENT.get<AllLeaderboardsType>(API, {
			params: {
				brandId,
				...(status && { status }),
				...(period && { period }),
				...(startDate && { startDate }),
				...(endDate && { endDate }),
			},
		});
		return res.data;
	} catch (e) {
		console.error("Error fetching getting all leaderboards:", e);
		throw e;
	}
};

export const getAllLeaderboardsOptions = ({
	brandId,
	endDate,
	startDate,
	period,
	status,
}: Params) => {
	return queryOptions({
		queryKey: [
			"getAllLeaderboards",
			{
				// brandId,
				// endDate,
				// startDate,
				// period,
				// status,
			},
		],
		queryFn: () =>
			getAllLeaderboards({
				brandId,
				endDate,
				startDate,
				period,
				status,
			}),
		enabled: false,
		gcTime: 1000 * 60 * 60 * 24,
		refetchOnWindowFocus: false,
		placeholderData: keepPreviousData,
	});
};
