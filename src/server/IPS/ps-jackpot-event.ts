import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { ReadyState, useWebSocket } from "@/server/use-websocket";
import { extractBaseUrl } from "@/utils/parse-url";
import { API_CFG } from "../config";

const { IPS_API } = API_CFG;

const jackpotEventSchema = z
	.object({
		jackpotId: z.string(),
		tier: z.string(),
		winValue: z.string(),
		currency: z.string(),
		availableTiers: z.string(),
	})
	.optional();

export type JackpotEventType = z.infer<typeof jackpotEventSchema>;

export const usePsJackpotEvent = (sessionKey?: string) => {
	const [socketUrl, _] = useState(
		`wss://${extractBaseUrl(IPS_API)}/websocket/jpa?sessionKey=${sessionKey}`,
	);
	const [messagesQueue, setMessagesQueue] = useState<JackpotEventType[]>([]);

	const { lastMessage, readyState, lastJsonMessage } = useWebSocket(socketUrl, {
		shouldReconnect: () => true,
		reconnectInterval: 5000,
		heartbeat: {
			message: "ping",
			interval: 30000,
			timeout: 600000,
		},
	});

	useEffect(() => {
		if (lastMessage) {
			const newMessage = JSON.parse(lastMessage.data);
			setMessagesQueue((prevMessages) => {
				const updatedQueue = [...prevMessages, newMessage];
				return updatedQueue.length > 5 ? updatedQueue.slice(1) : updatedQueue;
			});
		}
	}, [lastMessage]);

	const dequeueMessage = useCallback(() => {
		setMessagesQueue((prevMessages) => prevMessages.slice(1));
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
		lastJsonMessage,
		messagesQueue,
		dequeueMessage,
	};
};
