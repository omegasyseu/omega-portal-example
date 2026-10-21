import { AMS_AXIOS_CLIENT } from "@/server/AMS/AMS_CONFIG";

export interface QuestLeaderboardEntryResponse {
	partyId: number;
	level?: number; // populated by the level leaderboard
	progress?: number; // accumulated amount within the requested level, same scale as the level target (populated by the progress leaderboard)
	userId: string;
}

export const getQuestLeaderboard = async (
	configurationId: string,
	limit = 10,
) => {
	const res = await AMS_AXIOS_CLIENT.get("/quest-leaderboard/level", {
		params: { configurationId, limit },
	});
	return res.data;
};

export const getQuestProgressLeaderboard = async (
	configurationId: string,
	level: number,
	limit = 10,
) => {
	const res = await AMS_AXIOS_CLIENT.get("/quest-leaderboard/progress", {
		params: { configurationId, level, limit },
	});
	return res.data;
};
