/**
 * Notification type constants used throughout the application
 * These values should match the notificationType field in notification metadata
 */

export const NOTIFICATION_TYPES = {
	// Quest-related notifications
	QUEST_LEVEL_UP: "QUEST_LEVEL_UP",
	QUEST_POINT_BALANCE_CHANGED: "QUEST_POINT_BALANCE_CHANGED",
	QUEST_PROGRESS: "QUEST_PROGRESS",

	// Cashback notifications
	CASHBACK_ACCUMULATION_UPDATE: "CASHBACK_ACCUMULATION_UPDATE",
} as const;

export type NotificationType =
	(typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/**
 * Notification source constants
 * These values should match the source field in notification data
 */
export const NOTIFICATION_SOURCES = {
	QUEST: "QUEST",
	// In-app messages pushed by the Chronos engine (e.g. bet settled / refunded)
	CHRONOS: "CHRONOS",
	// Chronos public channel broadcasts (e.g. announcements), shown as toasts only
	CHRONOS_PUBLIC: "CHRONOS_PUBLIC",
} as const;

export type NotificationSource =
	(typeof NOTIFICATION_SOURCES)[keyof typeof NOTIFICATION_SOURCES];

/**
 * Check if a notification type is quest-related
 */
export const isQuestNotification = (type: string): boolean => {
	return (
		type === NOTIFICATION_TYPES.QUEST_LEVEL_UP ||
		type === NOTIFICATION_TYPES.QUEST_POINT_BALANCE_CHANGED ||
		type === NOTIFICATION_TYPES.QUEST_PROGRESS
	);
};
