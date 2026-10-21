// biome-ignore-all lint/suspicious/noTemplateCurlyInString: the messages are templates whose ${...} placeholders getPlaceholderMessage fills in
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import { API_CFG } from "@/server/config.ts";
import { ReadyState, useWebSocket } from "@/server/use-websocket";
import { extractBaseUrl } from "@/utils/parse-url.ts";

const { AMS_API } = API_CFG;

const messagesSchema = z
	.array(
		z
			.object({
				gameID: z.string(),
				date: z.string(),
				gameInfoId: z.number(),
				amountReal: z.number(),
				gameCategory: z.string(),
				gameName: z.string(),
				provider: z.string(),
				accountBalanceReal: z.number(),
				eventName: z.string(),
				currency: z.string(),
				partyId: z.number(),
				accountBalanceReleasedBonus: z.number(),
				brand: z.number(),
				eventId: z.number(),
				amount: z.number(),
				lossInARowAmountRR: z.number(),
				gameTranID: z.string(),
				userId: z.string(),
				transactionId: z.string(),
				balanceBonus: z.number(),
				primaryPartyId: z.number(),
				accountTranId: z.number(),
				balanceRR: z.number(),
				gameClassification: z.string(),
				accountBalancePlayableBonus: z.number(),
				lossInARow: z.number(),
				// Optional
				betAmountReal: z.number(),
				winsInARow: z.number(),
				winsInARowAmountRR: z.number(),
				betAmount: z.number(),
				winMultiplier: z.number(),

				balance: z.number(),

				// placeholder added in the frontend to see which one to display,
				placeholder: z.string().optional(),
			})
			.optional(),
	)
	.optional();

type Messages = z.infer<typeof messagesSchema>;

// we might have an array of predefined messages, but we change the values of the messages
// PLACEHOLDERS will have different types like gamewin. gameBet, or more
// we could show different message according the amount
// and bets
type Placeholder = {
	eventName: string;
	messages: { message: string }[];
};

const PLACEHOLDERMESSAGES: Placeholder[] = [
	{
		eventName: "GameBet",
		messages: [
			{ message: "${userId} placed a bet of ${amountWithCurrency}." },
			// {
			// 	message:
			// 		"${userId} bet ${amountWithCurrency}, balance now ${balance}${currency}.",
			// },
			{
				message: "${userId} bet ${amountWithCurrency}.",
			},
			// {
			// 	message:
			// 		"New bet by ${userId}: ${amountWithCurrency}. Current balance: ${balance}${currency}.",
			// },
			{
				message: "New bet by ${userId}: ${amountWithCurrency}.",
			},
			// {
			// 	message:
			// 		"${userId}'s bet of ${amountWithCurrency} registered. Balance: ${balance}${currency}.",
			// },
			{
				message: "${userId}'s bet of ${amountWithCurrency} registered.",
			},
			{
				message: "Bet alert! ${userId} just wagered ${amountWithCurrency}.",
			},
		],
	},
	{
		eventName: "GameWin",
		messages: [
			{
				message: "Congratulations ${userId}, you won ${amountWithCurrency}!",
			},
			// {
			// 	message:
			// 		"${userId} won ${amountWithCurrency}, boosting balance to ${balance}${currency}.",
			// },
			// {
			// 	message:
			// 		"Victory for ${userId}! A win of ${amountWithCurrency} added to the balance.",
			// },
			// {
			// 	message:
			// 		"Big win! ${userId} just earned ${amountWithCurrency}, new balance: ${balance}${currency}.",
			// },
			// {
			// 	message:
			// 		"${userId}'s winning streak! A gain of ${amountWithCurrency}, total balance: ${balance}${currency}.",
			// },
			{
				message: "${userId} won ${amountWithCurrency}.",
			},
			{
				message:
					"Victory for ${userId}! A win of ${amountWithCurrency} added to the balance.",
			},
			{
				message: "Big win! ${userId} just earned ${amountWithCurrency}.",
			},
			{
				message:
					"${userId}'s winning streak! A gain of ${amountWithCurrency} added to the balance.",
			},
		],
	},
];

// biome-ignore lint/suspicious/noExplicitAny: untyped AMS event payload
export const getPlaceholderMessage = (messageObject: any): string | null => {
	const eventPlaceholders = PLACEHOLDERMESSAGES.find(
		(event) => event.eventName === messageObject.eventName,
	);

	transformMessage(messageObject);
	// console.log(messageObject);

	const messagesLength = eventPlaceholders?.messages?.length ?? 0;
	if (messagesLength > 0) {
		const randomIndex = Math.floor(Math.random() * messagesLength);
		const messageTemplateEntry = eventPlaceholders?.messages[randomIndex];

		if (messageTemplateEntry) {
			let messageTemplate = messageTemplateEntry.message;

			// Replace placeholders with actual data
			messageTemplate = messageTemplate.replace(/\${(.*?)}/g, (_, key) => {
				return messageObject[key] ?? `[${key} not found]`;
			});

			return messageTemplate;
		}
	}
	return null;
};

// biome-ignore lint/suspicious/noExplicitAny: untyped AMS event payload
export const transformMessage = (msgObj: any) => {
	msgObj.amountWithCurrency = `${formatNumByCurrency(Math.abs(msgObj?.amount), msgObj?.currency)}`;
};

export const useAmsWebSocketEvents = () => {
	const [socketUrl] = useState(
		`wss://${extractBaseUrl(AMS_API)}/websocket/event?eventTypes=GameWin,GameBet`,
	);
	// 5 message
	// first in first out
	const [messageHistory] = useState<Messages>([]);
	// const [messageQueue, setMessageQueue] = useState<string[]>([]);
	const maxQueueSize = 5;
	const messagesQueue = useRef<string[]>([]);

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
			const placeholder = getPlaceholderMessage(lastJsonMessage);
			if (placeholder) {
				const updatedQueue = [...messagesQueue.current, placeholder];
				if (updatedQueue.length > maxQueueSize) {
					updatedQueue.shift(); // Removes the oldest message if exceeding max size
				}
				messagesQueue.current = updatedQueue;
			}
		}
	}, [lastMessage, lastJsonMessage]);

	// console.log({
	//   lastJsonMessage,
	// });
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
