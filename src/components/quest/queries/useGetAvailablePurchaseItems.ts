import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
	type AvailablePurchaseItemsData,
	getAvailablePurchaseItems,
} from "@/server/IPS/quest/get-available-purchase-items";

interface UseGetAvailablePurchaseItemsParams {
	sessionKey?: string | null;
	configurationId?: string;
	level?: number;
	enabled?: boolean;
}

export function useGetAvailablePurchaseItems({
	sessionKey,
	configurationId,
	level,
	enabled = false,
}: UseGetAvailablePurchaseItemsParams) {
	return useQuery<AvailablePurchaseItemsData, AxiosError>({
		queryKey: ["quest-available-items", configurationId, level],
		queryFn: async () => {
			if (!sessionKey || !configurationId || level === undefined) {
				throw new Error("Missing required parameters for fetching items");
			}

			return await getAvailablePurchaseItems({
				sessionKey,
				configurationId,
				level,
			});
		},
		enabled:
			enabled && !!sessionKey && !!configurationId && level !== undefined,
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 10, // 10 minutes
		retry: (failureCount, error) => {
			// Don't retry for client errors
			const status = error?.response?.status;
			if (status && status >= 400 && status < 500) {
				return false;
			}
			// Retry up to 2 times for server errors
			return failureCount < 2;
		},
		retryDelay: (attemptIndex) => {
			// Exponential backoff: 1s, 2s
			return Math.min(1000 * 2 ** attemptIndex, 2000);
		},
	});
}
