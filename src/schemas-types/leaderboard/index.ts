import { z } from "zod";

export const LeaderBoardForm = z.object({
	brandId: z.string().optional(),
	status: z.array(z.string()),
	period: z.array(z.string()).optional(),
	startDate: z.union([z.string(), z.date()]).optional(),
	endDate: z.union([z.string(), z.date()]).optional(),
});

export type LeaderBoardFormType = z.infer<typeof LeaderBoardForm>;
const Rankings = z
	.object({
		leaderboardId: z.number(),
		leaderboardName: z.string(),
		brandId: z.number(),
		startDateTime: z.string(),
		endDateTime: z.string(),
		currency: z.object({
			isoCode: z.string(),
			name: z.string(),
			decimal: z.number(),
			symbol: z.string(),
		}),
		status: z.string(),
		period: z.string(),
	})
	.optional();

export type RankingsType = z.infer<typeof Rankings>;

export const leaderBoardsData = z.array(Rankings);

export const allLeaderboardsSchema = z.object({
	timestamp: z.string(),
	code: z.string(),
	message: z.string(),
	data: leaderBoardsData.optional(),
});

export type AllLeaderboardsType = z.infer<typeof allLeaderboardsSchema>;

export const LEADERBOARD_PERIODS = ["DAILY", "WEEKLY", "MONTHLY"] as const;
export type LeaderboardPeriod = (typeof LEADERBOARD_PERIODS)[number];

// The leaderboard page's search params. A missing or unknown period falls back to DAILY, the period the
// selector shows by default.
export const leaderboardSearchSchema = z.object({
	period: z.enum(LEADERBOARD_PERIODS).catch("DAILY"),
});
