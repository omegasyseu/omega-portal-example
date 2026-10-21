import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import React from "react";
import { questPurchaseItem } from "@/server/IPS/quest-purchase-item";

interface PurchaseItemData {
	id: string;
	level: number;
}

export function usePurchaseQuestItem(sessionKey?: string | null) {
	const queryClient = useQueryClient();
	const [loadingItemId, setLoadingItemId] = React.useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: async (item: PurchaseItemData) => {
			if (!sessionKey) {
				throw new Error("Session not found. Please log in again.");
			}

			if (!item.id || item.level === undefined) {
				throw new Error("Invalid item data");
			}

			setLoadingItemId(item.id);

			return await questPurchaseItem({
				sessionKey,
				itemId: item.id,
				level: item.level,
			});
		},
		onSuccess: (_data, _item) => {
			// Show success notification
			notifications.show({
				title: "Purchase Successful!",
				message: "Your purchase has been completed successfully",
				color: "neon",
				icon: React.createElement(IconCheck, { size: 18 }),
				autoClose: 5000,
			});

			setLoadingItemId(null);

			// Invalidate and refetch quest info to update available items
			queryClient.invalidateQueries({
				queryKey: ["fetch-quest-info"],
			});

			// Also invalidate any quest-related queries
			queryClient.invalidateQueries({
				queryKey: ["quest"],
			});

			// Invalidate the available purchase items query to refresh the shop
			queryClient.invalidateQueries({
				queryKey: ["quest-available-items"],
			});
		},
		onError: (error: unknown) => {
			const errorMessage = getErrorMessage(error);

			// Show error notification
			notifications.show({
				title: "Purchase Failed",
				message: errorMessage,
				color: "danger",
				icon: React.createElement(IconX, { size: 18 }),
				autoClose: 7000,
			});

			setLoadingItemId(null);
		},
		retry: false, // Disable automatic retries completely
	});

	return {
		purchaseLoading: loadingItemId,
		purchaseError: mutation.error ? getErrorMessage(mutation.error) : null,
		purchaseSuccess: mutation.isSuccess ? loadingItemId : null,
		purchaseItem: mutation.mutate,
		reset: mutation.reset,
	};
}

function getErrorMessage(error: unknown): string {
	// Check for server-provided error message
	const err = error as AxiosError<{ message?: string }>;
	if (err?.message) {
		return err.message;
	}

	return "An unexpected error occurred. Please try again.";
}
