import {
	type IconAlertCircle,
	IconBell,
	type IconCoin,
	type IconGift,
	IconSpeakerphone,
	IconTicket,
	IconTrophy,
} from "@tabler/icons-react";
import { createElement } from "react";
import { NOTIFICATION_SOURCES } from "../constants/notificationTypes";

export type NotificationIconType =
	| typeof IconTrophy
	| typeof IconGift
	| typeof IconCoin
	| typeof IconAlertCircle
	| typeof IconTicket
	| typeof IconSpeakerphone
	| typeof IconBell;

/**
 * Get the appropriate icon component for a notification source
 * @param source - The notification source (e.g., QUEST)
 */
export const getNotificationIcon = (source: string): NotificationIconType => {
	const sourceUpper = source?.toUpperCase();
	switch (sourceUpper) {
		case NOTIFICATION_SOURCES.QUEST:
			return IconTrophy;
		case NOTIFICATION_SOURCES.CHRONOS:
			return IconTicket;
		case NOTIFICATION_SOURCES.CHRONOS_PUBLIC:
			return IconSpeakerphone;
		default:
			return IconBell;
	}
};

/**
 * Get the appropriate color for a notification source
 * @param source - The notification source (e.g., QUEST)
 */
export const getNotificationColor = (source: string): string => {
	const sourceUpper = source?.toUpperCase();
	switch (sourceUpper) {
		case NOTIFICATION_SOURCES.QUEST:
			return "gold";
		case NOTIFICATION_SOURCES.CHRONOS:
			return "neon";
		case NOTIFICATION_SOURCES.CHRONOS_PUBLIC:
			return "bronze";
		default:
			return "brand";
	}
};

/**
 * Get the CSS variable color for a notification source
 * @param source - The notification source (e.g., QUEST)
 */
export const getNotificationCSSColor = (source: string): string => {
	const color = getNotificationColor(source);
	return `var(--mantine-color-${color}-6)`;
};

/**
 * Create a notification icon element with color
 * @param source - The notification source (e.g., QUEST)
 */
export const createNotificationIcon = (source: string, size = 20) => {
	const IconComponent = getNotificationIcon(source);
	const color = getNotificationCSSColor(source);
	return createElement(IconComponent, { size, color });
};

/**
 * Create a notification icon for use in non-JSX contexts (like notifications.show)
 * @param source - The notification source (e.g., QUEST)
 */
export const createNotificationIconElement = (source: string, size = 20) => {
	const IconComponent = getNotificationIcon(source);
	return createElement(IconComponent, { size });
};
