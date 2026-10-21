import { useQuery } from "@tanstack/react-query";
import type { z } from "zod";
import { useGeneralInfo } from "@/providers/selected-currency-provider";
import type { LevelUpResponse } from "@/schemas-types/levelup";
import {
	getQuestLeaderboard,
	getQuestProgressLeaderboard,
} from "@/server/AMS/quest-leaderboard";
import { IPS_AXIOS_CLIENT } from "@/server/IPS/IPS_CONFIG.ts";
import { questPurchaseItem } from "@/server/IPS/quest-purchase-item";
import { type ErrorWithStatus, getErrorStatus } from "../types/error.types";

const AFTER_ERROR_REFETCH_MS = 5 * 60 * 1000;

type QuestParams = {
	sessionKey?: string;
	includeRedeemedAwards?: boolean;
};

type Response = z.infer<typeof LevelUpResponse>;

export const GetQuestInfo = async ({
	sessionKey,
	includeRedeemedAwards,
}: QuestParams) => {
	const API = "/quest";

	try {
		const res = await IPS_AXIOS_CLIENT.get<Response>(API, {
			params: {
				sessionKey,
				...(includeRedeemedAwards && { includeRedeemedAwards }),
			},
		});
		return res.data;
	} catch (e: unknown) {
		console.error("Error fetching quest information:", e);

		// Type guard for axios errors
		if (e && typeof e === "object" && "response" in e) {
			const axiosError = e as {
				response: { status: number; data?: { message?: string } };
			};
			const error: ErrorWithStatus = new Error(
				axiosError.response.data?.message ||
					"Failed to fetch quest information",
			);
			error.status = axiosError.response.status;
			error.data = axiosError.response.data;
			throw error;
		}

		if (e && typeof e === "object" && "request" in e) {
			const error: ErrorWithStatus = new Error(
				"No response from server. Please check your connection.",
			);
			error.code = "ERR_NETWORK";
			throw error;
		}

		throw e;
	}
};

export const useFetchQuestInfo = ({
	includeRedeemedAwards,
	refetchInterval = 3 * 1000, //3 seconds
	isEnabled = true,
}: Pick<QuestParams, "includeRedeemedAwards"> & {
	refetchInterval?: number;
	// Off for a Brand that hides the feature.
	isEnabled?: boolean;
}) => {
	const { selectedAccount } = useGeneralInfo();
	const sessionKey = selectedAccount?.sessionKey;
	return useQuery({
		// Keyed by session, so a new login never shows the previous player's quest.
		queryKey: ["fetch-quest-info", includeRedeemedAwards, { sessionKey }],
		queryFn: () =>
			GetQuestInfo({
				sessionKey: sessionKey as string,
				includeRedeemedAwards,
			}),
		enabled: isEnabled && !!sessionKey,
		// A brand without the feature answers with an error: ask rarely rather than
		// polling a failing request, and pick up again if it starts answering.
		refetchInterval: (query) =>
			query.state.status === "error" ? AFTER_ERROR_REFETCH_MS : refetchInterval,
		retry: (failureCount, error) => {
			// Don't retry on 4xx errors (client errors)
			const status = getErrorStatus(error);
			if (status && status >= 400 && status < 500) {
				return false;
			}
			// Retry up to 3 times for other errors
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};

// NOTE: All AMS API environment variables must be set in .env with the VITE_ prefix, e.g. VITE_AMS_API
export const useQuestLeaderboard = (configurationId: string, limit = 5) => {
	return useQuery({
		queryKey: ["quest-leaderboard", configurationId, limit],
		queryFn: () => getQuestLeaderboard(configurationId, limit),
		enabled: !!configurationId,
		refetchInterval: 5000, // refetch every 5 seconds
		retry: (failureCount, error) => {
			// Don't retry on 4xx errors
			const status = getErrorStatus(error);
			if (status && status >= 400 && status < 500) {
				return false;
			}
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};

export const useQuestProgressLeaderboard = (
	configurationId: string,
	level: number,
	limit = 5,
) => {
	return useQuery({
		queryKey: ["quest-progress-leaderboard", configurationId, level, limit],
		queryFn: () => getQuestProgressLeaderboard(configurationId, level, limit),
		enabled: !!configurationId && typeof level === "number",
		refetchInterval: 5000, // refetch every 5 seconds
		retry: (failureCount, error) => {
			// Don't retry on 4xx errors
			const status = getErrorStatus(error);
			if (status && status >= 400 && status < 500) {
				return false;
			}
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
};

export const purchaseQuestItem = async ({
	sessionKey,
	itemId,
	level,
}: {
	sessionKey: string;
	itemId: string;
	level: number;
}) => {
	try {
		return await questPurchaseItem({ sessionKey, itemId, level });
	} catch (e: unknown) {
		console.error("Error purchasing quest item:", e);

		// Type guard for axios errors
		if (e && typeof e === "object" && "response" in e) {
			const axiosError = e as {
				response: { status: number; data?: { message?: string } };
			};
			const error: ErrorWithStatus = new Error(
				axiosError.response.data?.message || "Failed to purchase quest item",
			);
			error.status = axiosError.response.status;
			error.data = axiosError.response.data;
			throw error;
		}

		if (e && typeof e === "object" && "request" in e) {
			const error: ErrorWithStatus = new Error(
				"No response from server. Please check your connection.",
			);
			error.code = "ERR_NETWORK";
			throw error;
		}

		throw e;
	}
};
