import { useEffect, useRef, useState } from "react";
import type { JackpotDataFeedType } from "@/schemas-types";
import { API_CFG } from "@/server/config.ts";
import { ReadyState, useWebSocket } from "@/server/use-websocket";
import { extractBaseUrl } from "@/utils/parse-url.ts";

const { AMS_API } = API_CFG;

export const useAmsJackpotEvent = (brandId?: string) => {
	const [socketUrl, setSocketUrl] = useState<string | null>(null);
	const [messageHistory, _] = useState<JackpotDataFeedType[]>([]);
	const maxQueueSize = 5;
	const messagesQueue = useRef<JackpotDataFeedType[]>([]);
	useEffect(() => {
		if (brandId) {
			setSocketUrl(
				`wss://${extractBaseUrl(AMS_API)}/websocket/jackpot?brandId=${brandId}`,
			);
		}
	}, [brandId]);

	const { lastMessage, readyState, lastJsonMessage } = useWebSocket(socketUrl, {
		shouldReconnect: () => true,
		reconnectInterval: 5000,

		heartbeat: {
			message: "ping",
			interval: 30000,
			timeout: 600000,
		},
		// share: true,
	});
	useEffect(() => {
		if (lastMessage) {
			// console.log('Received new WebSocket message:', lastJsonMessage);
			const updatedQueue = [
				...messagesQueue.current,
				lastJsonMessage,
			] as JackpotDataFeedType[];
			if (updatedQueue.length > maxQueueSize) {
				// console.log('Queue exceeded max size. Removing oldest message.');
				updatedQueue.shift(); // Removes the oldest message if exceeding max size
			}
			messagesQueue.current = updatedQueue;
			// console.log('Updated message queue:', messagesQueue.current);
		}
	}, [lastMessage, lastJsonMessage]);

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
	};
};
