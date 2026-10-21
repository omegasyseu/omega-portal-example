import { notifications } from "@mantine/notifications";
import type { NotificationType } from "@/server/notifications/notifications-websocket";
import { NOTIFICATION_SOURCES } from "../constants/notificationTypes";
import {
	createNotificationIconElement,
	getNotificationColor,
} from "./notificationHelpers";

// Messages arriving within this window are shown together (e.g. the backlog pushed on login)
const BURST_WINDOW_MS = 300;
const MAX_INDIVIDUAL_TOASTS = 3;
const AUTO_CLOSE_MS = 6000;

// Public messages are not stored anywhere, so extras are dropped instead of summarised:
// at most MAX_PUBLIC_TOASTS per PUBLIC_TOAST_WINDOW_MS, newest first
const MAX_PUBLIC_TOASTS = 3;
const PUBLIC_TOAST_WINDOW_MS = 10000;

let pending: NotificationType[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let publicToastTimes: number[] = [];

const showToast = (notification: NotificationType) => {
	notifications.show({
		id: notification.id,
		title: notification.title,
		message: notification.message,
		icon: createNotificationIconElement(notification.type),
		color: getNotificationColor(notification.type),
		autoClose: AUTO_CLOSE_MS,
	});
};

// Private messages are also in the bell, so a large burst becomes one summary toast
const showPrivateToasts = (burst: NotificationType[]) => {
	if (burst.length > MAX_INDIVIDUAL_TOASTS) {
		notifications.show({
			id: `chronos-summary-${burst[0].id}`,
			title: "New notifications",
			message: `You have ${burst.length} new notifications`,
			icon: createNotificationIconElement(NOTIFICATION_SOURCES.CHRONOS),
			color: getNotificationColor(NOTIFICATION_SOURCES.CHRONOS),
			autoClose: AUTO_CLOSE_MS,
		});
		return;
	}

	for (const notification of burst) {
		showToast(notification);
	}
};

const chronosId = (notification: NotificationType) =>
	Number(notification.data?.chronosId) || 0;

const showPublicToasts = (burst: NotificationType[]) => {
	const now = Date.now();
	publicToastTimes = publicToastTimes.filter(
		(time) => now - time < PUBLIC_TOAST_WINDOW_MS,
	);
	const budget = Math.max(0, MAX_PUBLIC_TOASTS - publicToastTimes.length);

	const newestFirst = [...burst].sort((a, b) => chronosId(b) - chronosId(a));
	for (const notification of newestFirst.slice(0, budget)) {
		showToast(notification);
		publicToastTimes.push(now);
	}
};

const flush = () => {
	const burst = pending;
	pending = [];
	flushTimer = undefined;
	if (burst.length === 0) return;

	const isPublic = (notification: NotificationType) =>
		notification.type === NOTIFICATION_SOURCES.CHRONOS_PUBLIC;
	showPrivateToasts(burst.filter((notification) => !isPublic(notification)));
	showPublicToasts(burst.filter(isPublic));
};

/**
 * Show a toast for a Chronos message (private or public channel).
 * Private bursts of more than MAX_INDIVIDUAL_TOASTS become one summary toast;
 * public toasts are limited to MAX_PUBLIC_TOASTS per PUBLIC_TOAST_WINDOW_MS.
 */
export const showChronosToast = (notification: NotificationType) => {
	pending.push(notification);
	if (flushTimer === undefined) {
		flushTimer = setTimeout(flush, BURST_WINDOW_MS);
	}
};
