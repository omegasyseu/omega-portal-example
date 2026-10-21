import { z } from "zod";
import { NOTIFICATION_SOURCES } from "@/components/notifications/constants/notificationTypes";
import type { NotificationType } from "@/server/notifications/notifications-websocket";

// One frame pushed by chronos-engine on /websocket/private (PrivateMessageDto).
// Fields not listed here (extraInfo with the player's email and phone, eventData, partyId...)
// are stripped on parse and never stored.
const chronosPrivateMessageSchema = z.object({
	id: z.union([z.number(), z.string().min(1)]),
	// Zone-less server time, same convention as the other notification timestamps
	date: z.string().min(1),
	subject: z.string().nullish(),
	content: z.string().nullish(),
	contentType: z.string().nullish(),
	// Chronos event type, e.g. GAME_WIN or GAME_BET
	type: z.string().nullish(),
	category: z.string().nullish(),
	packetId: z.number().nullish(),
	channelStoreId: z.number().nullish(),
});

export type ChronosPrivateMessage = z.infer<typeof chronosPrivateMessageSchema>;

// One frame pushed by chronos-engine on /websocket/channel/<id> (PublicMessageDto).
// Public messages have no subject. Other fields are stripped on parse.
const chronosPublicMessageSchema = z.object({
	id: z.number().int().positive(),
	date: z.string().nullish(),
	content: z.string().nullish(),
	contentType: z.string().nullish(),
});

const MAX_MESSAGE_LENGTH = 300;
const DEFAULT_TITLE = "Notification";
const PUBLIC_TITLE = "Announcement";
const DEFAULT_MESSAGE = "You have a new notification.";

// Elements whose end should read as a word break once tags are removed
const BLOCK_ELEMENTS = "br,p,div,li,tr,td,th,h1,h2,h3,h4,h5,h6";

const collapseWhitespace = (text: string) => text.replace(/\s+/g, " ").trim();

// Documents created by DOMParser are inert: no scripts run and no resources load
const parseInertHtml = (html: string) =>
	new DOMParser().parseFromString(html, "text/html");

/**
 * Decode HTML entities without interpreting tags.
 * Chronos renders templates with Handlebars, which escapes every {{value}},
 * so plain text content can contain entities such as O&#x27;Neill.
 */
export const decodeEntities = (input?: string | null): string => {
	if (!input) return "";
	if (!input.includes("&")) return collapseWhitespace(input);

	// Textarea content is parsed as text: entities are decoded, tags are not
	const textarea = parseInertHtml("").createElement("textarea");
	textarea.innerHTML = input;
	return collapseWhitespace(textarea.value);
};

/**
 * Extract readable text from HTML content. The result is only ever rendered as text.
 */
export const htmlToText = (input?: string | null): string => {
	if (!input) return "";

	const doc = parseInertHtml(input);
	for (const element of doc.querySelectorAll(
		"script,style,noscript,template",
	)) {
		element.remove();
	}
	for (const element of doc.querySelectorAll(BLOCK_ELEMENTS)) {
		element.after(" ");
	}
	return collapseWhitespace(doc.body?.textContent ?? "");
};

const toText = (content?: string | null, contentType?: string | null) =>
	contentType?.toUpperCase() === "HTML"
		? htmlToText(content)
		: decodeEntities(content);

const clip = (text: string) =>
	text.length > MAX_MESSAGE_LENGTH
		? `${text.slice(0, MAX_MESSAGE_LENGTH - 1)}…`
		: text;

export const mapChronosMessage = (
	message: ChronosPrivateMessage,
): NotificationType => {
	const body = toText(message.content, message.contentType);

	return {
		id: `chronos-${message.id}`,
		type: NOTIFICATION_SOURCES.CHRONOS,
		title: decodeEntities(message.subject) || DEFAULT_TITLE,
		message: clip(body || DEFAULT_MESSAGE),
		timestamp: message.date,
		data: {
			source: NOTIFICATION_SOURCES.CHRONOS,
			read: false,
			chronosId: message.id,
			eventType: message.type ?? undefined,
			category: message.category ?? undefined,
			packetId: message.packetId ?? undefined,
			channelStoreId: message.channelStoreId ?? undefined,
		},
	};
};

const parseJson = (raw: string): unknown => {
	try {
		return JSON.parse(raw);
	} catch {
		return undefined;
	}
};

/**
 * Parse one text frame from the Chronos private socket.
 * Returns null for anything that is not a valid message.
 */
export const parseChronosFrame = (raw: string): NotificationType | null => {
	const result = chronosPrivateMessageSchema.safeParse(parseJson(raw));
	return result.success ? mapChronosMessage(result.data) : null;
};

/**
 * Parse one text frame from a Chronos public channel socket.
 * Returns null for anything that is not a valid message.
 */
export const parseChronosPublicFrame = (
	raw: string,
): NotificationType | null => {
	const result = chronosPublicMessageSchema.safeParse(parseJson(raw));
	if (!result.success) return null;

	const message = result.data;
	return {
		id: `chronos-public-${message.id}`,
		type: NOTIFICATION_SOURCES.CHRONOS_PUBLIC,
		title: PUBLIC_TITLE,
		message: clip(
			toText(message.content, message.contentType) || DEFAULT_MESSAGE,
		),
		timestamp: message.date ?? "",
		data: {
			source: NOTIFICATION_SOURCES.CHRONOS_PUBLIC,
			chronosId: message.id,
		},
	};
};
