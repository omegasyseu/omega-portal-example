import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { NOTIFICATION_TYPES } from "@/components/notifications/constants/notificationTypes";
import { useSession } from "@/providers/authentication/authentication";
import { API_CFG } from "@/server/config";
import { ReadyState, useWebSocket } from "@/server/use-websocket";
import { extractBaseUrl } from "@/utils/parse-url";

const { IPS_API } = API_CFG;

const notificationSchema = z.object({
	id: z.string(),
	type: z.string(),
	title: z.string(),
	message: z.string(),
	timestamp: z.string(),
	data: z.record(z.string(), z.unknown()).optional(),
});

export type NotificationType = z.infer<typeof notificationSchema>;

// Inner notification data schema
const notificationDataSchema = z.object({
	messageId: z.string(),
	type: z.string(),
	recipient: z.string(),
	payload: z.object({
		title: z.string(),
		body: z.string(),
		metadata: z.record(z.string(), z.unknown()).optional(),
	}),
	timestamp: z.string(),
	priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
	source: z.string().optional(),
	ttl: z.number().optional(),
});

// WebSocket message wrapper schema (actual format from server)
const wsMessageSchema = z.object({
	type: z.literal("notification"),
	timestamp: z.number(),
	data: notificationDataSchema,
});

// Format cashback accumulation message from metadata
const formatCashbackMessage = (
	metadata: Record<string, unknown>,
): string | null => {
	const contribution = metadata.contribution;
	const planName = metadata.planName;
	if (contribution == null || planName == null) return null;
	const amount = Number.parseFloat(String(contribution)).toFixed(2);
	return `+${amount} from ${planName}`;
};

// Transform a validated WS message into the app notification shape
const transformWsNotification = (
	wsMessage: z.infer<typeof wsMessageSchema>,
): NotificationType => {
	const { data: notificationData } = wsMessage;
	const metadata = notificationData.payload.metadata;

	let message = notificationData.payload.body;
	if (
		metadata?.notificationType ===
		NOTIFICATION_TYPES.CASHBACK_ACCUMULATION_UPDATE
	) {
		message = formatCashbackMessage(metadata) ?? message;
	}

	return {
		id: notificationData.messageId,
		type: notificationData.source || notificationData.type,
		title: notificationData.payload.title,
		message,
		timestamp: notificationData.timestamp,
		data: {
			...metadata,
			source: notificationData.source,
			read: false,
		},
	};
};

// Helper to check if message is a valid notification
const isValidNotification = (message: unknown): boolean => {
	if (typeof message !== "object" || message === null) {
		return false;
	}

	const msg = message as Record<string, unknown>;

	// Filter out welcome messages
	if (msg.type === "welcome") {
		return false;
	}

	// Must be a notification type message with data
	if (msg.type !== "notification" || !msg.data) {
		return false;
	}

	const data = msg.data as Record<string, unknown>;

	// Filter out QUEST_PROGRESS notifications
	const payload = data.payload as Record<string, unknown> | undefined;
	const metadata = payload?.metadata as Record<string, unknown> | undefined;
	if (metadata?.notificationType === NOTIFICATION_TYPES.QUEST_PROGRESS) {
		console.log("Filtering out QUEST_PROGRESS notification");
		return false;
	}

	// Must have messageId
	return !!data.messageId;
};

interface UseNotificationsWebSocketOptions {
	onNotification?: (notification: NotificationType) => void;
}

export const useNotificationsWebSocket = (
	options?: UseNotificationsWebSocketOptions,
) => {
	const { session } = useSession();
	const sessionKey = session?.user?.sessionKey;
	const [socketUrl, setSocketUrl] = useState<string | null>(null);
	const [messageHistory, setMessageHistory] = useState<NotificationType[]>([]);
	const maxQueueSize = 10;
	const messagesQueue = useRef<NotificationType[]>([]);

	useEffect(() => {
		if (sessionKey) {
			setSocketUrl(
				`wss://${extractBaseUrl(IPS_API)}/websocket/notifications?sessionKey=${sessionKey}`,
			);
		}
	}, [sessionKey]);

	// Cleanup on unmount to prevent memory leaks
	useEffect(() => {
		return () => {
			// Clear message queue and history on unmount
			messagesQueue.current = [];
			setMessageHistory([]);
			// Clear socket URL to close connection
			setSocketUrl(null);
		};
	}, []);

	const { lastMessage, readyState, lastJsonMessage } = useWebSocket(socketUrl, {
		shouldReconnect: () => true,
		reconnectInterval: 5000,
		heartbeat: {
			message: "ping",
			interval: 30000,
			timeout: 60000,
		},
	});

	useEffect(() => {
		if (lastMessage && lastJsonMessage) {
			console.log("Received new WebSocket message:", lastJsonMessage);

			// Check if this is a valid notification message
			if (!isValidNotification(lastJsonMessage)) {
				const messageType =
					typeof lastJsonMessage === "object" && lastJsonMessage !== null
						? (lastJsonMessage as Record<string, unknown>).type
						: typeof lastJsonMessage;
				console.log("Skipping non-notification message:", messageType);
				return;
			}

			// Transform WebSocket message to notification format
			try {
				const wsMessage = wsMessageSchema.parse(lastJsonMessage);
				const notification = transformWsNotification(wsMessage);

				// Check if this notification already exists in the queue
				const existingNotification = messagesQueue.current.find(
					(msg) => msg.id === notification.id,
				);

				if (existingNotification) {
					console.log("Duplicate notification ignored:", notification.id);
					return;
				}

				// Call the notification callback if provided
				if (options?.onNotification) {
					options.onNotification(notification);
				}

				const updatedQueue = [...messagesQueue.current, notification];
				if (updatedQueue.length > maxQueueSize) {
					updatedQueue.shift();
				}
				messagesQueue.current = updatedQueue;
				setMessageHistory(updatedQueue);
				console.log("Notification added to queue:", notification.title);
			} catch (error) {
				console.error(
					"Failed to parse WebSocket notification:",
					error,
					lastJsonMessage,
				);
			}
		}
	}, [lastMessage, lastJsonMessage, options?.onNotification]);

	const dequeueMessage = useCallback(() => {
		const updatedQueue = messagesQueue.current.slice(1);
		messagesQueue.current = updatedQueue;
		setMessageHistory(updatedQueue);
	}, []);

	const connectionStatus = {
		[ReadyState.CONNECTING]: "Connecting",
		[ReadyState.OPEN]: "Open",
		[ReadyState.CLOSING]: "Closing",
		[ReadyState.CLOSED]: "Closed",
		[ReadyState.UNINSTANTIATED]: "Uninstantiated",
	}[readyState];

	return {
		connectionStatus,
		messageHistory,
		lastJsonMessage,
		messagesQueue,
		dequeueMessage,
	};
};
