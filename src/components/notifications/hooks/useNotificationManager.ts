import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
	getWidgetSettings,
	shownWidgets,
} from "@/components/games/widget-settings.ts";
import { questLevelUpStore } from "@/components/quest/quest-level-up-store";
import { useSession } from "@/providers/authentication/authentication";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";
import { useChronosWebSocket } from "@/server/chronos/chronos-websocket";
import {
	type NotificationType,
	useNotificationsWebSocket,
} from "@/server/notifications/notifications-websocket";
import { NOTIFICATION_TYPES } from "../constants/notificationTypes";
import { showChronosToast } from "../utils/chronosToasts";

interface EnhancedNotification extends NotificationType {
	data: {
		read?: boolean;
		[key: string]: unknown;
	};
}

export interface NotificationManager {
	notifications: EnhancedNotification[];
	unreadCount: number;
	markAsRead: (id: string) => void;
	markAllAsRead: () => void;
	clearAll: () => void;
	connectionStatus: string;
}

const MAX_NOTIFICATIONS = 50;

export const useNotificationManager = (): NotificationManager => {
	const { session } = useSession();
	const sessionKey = session?.user?.sessionKey;
	const queryClient = useQueryClient();
	const { engageFeatures } = useBrandContent();

	const [notifications, setNotifications] = useState<EnhancedNotification[]>(
		[],
	);

	// Handle special notifications
	const handleNotification = useCallback(
		(notification: NotificationType) => {
			// Notify quest level-up store for QuestPurchaseModalManager
			if (
				notification.data?.notificationType ===
				NOTIFICATION_TYPES.QUEST_LEVEL_UP
			) {
				const questId = notification.data.questId as string | undefined;
				const newLevel = notification.data.newLevel as number | undefined;

				// The game page's Quest switch turns these pop-ups off, and so does Quest
				// being hidden on the Brand.
				if (
					questId &&
					newLevel !== undefined &&
					shownWidgets(getWidgetSettings(), engageFeatures).showQuest
				) {
					questLevelUpStore.open({ questId, level: newLevel });
				}
			}

			// Invalidate cashback query on accumulation updates for real-time balance refresh
			if (
				notification.data?.notificationType ===
				NOTIFICATION_TYPES.CASHBACK_ACCUMULATION_UPDATE
			) {
				queryClient.invalidateQueries({ queryKey: ["IPS_CASHBACK"] });
			}
		},
		[queryClient, engageFeatures],
	);

	const { messageHistory, connectionStatus } = useNotificationsWebSocket({
		onNotification: handleNotification,
	});

	// Get storage key for current user
	const getStorageKey = useCallback(() => {
		if (!sessionKey) return null;
		return `omega_notifications_${sessionKey}`;
	}, [sessionKey]);

	// Load notifications from localStorage
	const loadFromStorage = useCallback(() => {
		const storageKey = getStorageKey();
		if (!storageKey) return [];

		try {
			const stored = localStorage.getItem(storageKey);
			if (stored) {
				const parsed = JSON.parse(stored);
				// Ensure all notifications have the correct structure
				return parsed.map((notification: NotificationType) => ({
					...notification,
					data: {
						read: false,
						...notification.data,
					},
				})) as EnhancedNotification[];
			}
		} catch (error) {
			console.error("Failed to load notifications from storage:", error);
		}
		return [];
	}, [getStorageKey]);

	// Save notifications to localStorage
	const saveToStorage = useCallback(
		(notificationsToSave: EnhancedNotification[]) => {
			const storageKey = getStorageKey();
			if (!storageKey) return;

			try {
				// Keep only the most recent MAX_NOTIFICATIONS
				const limited = notificationsToSave.slice(0, MAX_NOTIFICATIONS);
				localStorage.setItem(storageKey, JSON.stringify(limited));
			} catch (error) {
				console.error("Failed to save notifications to storage:", error);
			}
		},
		[getStorageKey],
	);

	// Initialize notifications from storage when session changes
	useEffect(() => {
		if (sessionKey) {
			const stored = loadFromStorage();
			setNotifications(stored);
		} else {
			setNotifications([]);
		}

		// Cleanup on unmount to prevent memory leaks
		return () => {
			setNotifications([]);
		};
	}, [sessionKey, loadFromStorage]);

	// Merge incoming notifications into the list and persist it
	const addNotifications = useCallback(
		(incoming: NotificationType[]) => {
			if (incoming.length === 0) return;

			setNotifications((prev) => {
				// Convert to enhanced notifications, avoiding duplicates
				const existingIds = new Set(prev.map((n) => n.id));
				const uniqueNew: EnhancedNotification[] = [];
				for (const msg of incoming) {
					if (existingIds.has(msg.id)) continue;
					existingIds.add(msg.id);
					uniqueNew.push({
						...msg,
						data: {
							read: false,
							...msg.data,
						},
					});
				}
				if (uniqueNew.length === 0) return prev;

				// Combine and sort by timestamp (newest first)
				const combined = [...uniqueNew, ...prev].sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				);

				// Limit to MAX_NOTIFICATIONS
				const limited = combined.slice(0, MAX_NOTIFICATIONS);

				// Save to storage
				saveToStorage(limited);

				return limited;
			});
		},
		[saveToStorage],
	);

	// Process new messages from WebSocket
	useEffect(() => {
		addNotifications(messageHistory);
	}, [messageHistory, addNotifications]);

	// Chronos in-app messages usually follow a bet settlement, cancellation or refund:
	// add them to the list, show a toast and refresh the balance
	const handleChronosNotification = useCallback(
		(notification: NotificationType) => {
			addNotifications([notification]);
			showChronosToast(notification);
			queryClient.invalidateQueries(
				{ queryKey: ["IPS_USER_BALANCES"] },
				{ cancelRefetch: false },
			);
		},
		[addNotifications, queryClient],
	);

	useChronosWebSocket({ onNotification: handleChronosNotification });

	// Mark notification as read
	const markAsRead = useCallback(
		(id: string) => {
			setNotifications((prev) => {
				const updated = prev.map((notification) =>
					notification.id === id
						? { ...notification, data: { ...notification.data, read: true } }
						: notification,
				);
				saveToStorage(updated);
				return updated;
			});
		},
		[saveToStorage],
	);

	// Mark all notifications as read
	const markAllAsRead = useCallback(() => {
		setNotifications((prev) => {
			const updated = prev.map((notification) => ({
				...notification,
				data: { ...notification.data, read: true },
			}));
			saveToStorage(updated);
			return updated;
		});
	}, [saveToStorage]);

	// Clear all notifications
	const clearAll = useCallback(() => {
		setNotifications([]);
		const storageKey = getStorageKey();
		if (storageKey) {
			localStorage.removeItem(storageKey);
		}
	}, [getStorageKey]);

	// Calculate unread count
	const unreadCount = notifications.filter((n) => !n.data?.read).length;

	return {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		clearAll,
		connectionStatus,
	};
};
