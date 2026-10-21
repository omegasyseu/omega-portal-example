import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { AMS_AXIOS_CLIENT } from "@/server/AMS/AMS_CONFIG.ts";
import { getAllLeaderboards } from "@/server/IPS/leadeboards/index.ts";

type Params = {
	date?: string;
	size?: string;
	id?: string;
	period: string;
	brandId?: string;
};
const rankingsSchema = z.array(
	z.object({
		username: z.string(),
		wageringInPeriod: z.number(),
		rank: z.number(),
		prize: z.number(),
	}),
);

export const schema = z.object({
	timestamp: z.string(),
	code: z.string(),
	message: z.string(),
	data: z
		.object({
			leaderboardId: z.number(),
			leaderboardName: z.string(),
			startDateTime: z.string(),
			endDateTime: z.string(),
			rankings: rankingsSchema.optional(),
		})
		.optional(),
});

export type LeaderboardType = z.infer<typeof schema>;
export type Rankings = z.infer<typeof rankingsSchema>;

export const GetRankingsByLeaderBoards = async ({
	date,
	size = "10",
	period,
	brandId,
}: Params) => {
	const fetchLeaderBoardByPeriod = await getAllLeaderboards({
		brandId: brandId,
		status: "RUNNING",
		period,
	});
	const specificLeaderboard = fetchLeaderBoardByPeriod?.data?.[0];
	console.log({
		specificLeaderboard,
	});

	if (!fetchLeaderBoardByPeriod?.data?.length) {
		throw new Error("No leaderboards found");
	}

	const API = `/leaderboards/${specificLeaderboard?.leaderboardId}/ranking`;
	try {
		const res = await AMS_AXIOS_CLIENT.get<LeaderboardType>(API, {
			params: {
				date,
				size,
			},
		});
		const rankings = res.data;
		return {
			rankings,
			currentLeaderboard: specificLeaderboard,
		};
	} catch (e) {
		console.error("Error fetching leaderboards:", e);
		throw e;
	}
};

export const getRankingByLeaderBoardsOptions = ({
	date,
	size,
	period,
	brandId,
}: Params) => {
	return queryOptions({
		queryKey: [
			"getRankingByLeaderBoards",
			{
				date,
				size,
				period,
				brandId,
			},
		],
		queryFn: () =>
			GetRankingsByLeaderBoards({
				date,
				size,
				period,
				brandId,
			}),
		gcTime: 1000 * 60 * 60 * 24,
		refetchOnWindowFocus: false,

		// placeholderData: keepPreviousData,
	});
};
