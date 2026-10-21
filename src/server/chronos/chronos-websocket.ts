import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useSession } from "@/providers/authentication/authentication";
import {
	getChronosChannelIds,
	getChronosPublicChannelIds,
	getChronosSocketUrl,
} from "@/server/config";
import { getPlayerInfoOptions } from "@/server/IPS/user/get-player-info";
import type { NotificationType } from "@/server/notifications/notifications-websocket";
import { ReadyState, useWebSocket } from "@/server/use-websocket";
import { parseChronosFrame, parseChronosPublicFrame } from "./chronos-message";

// Resolved once. Undefined disables Chronos notifications entirely.
const CHRONOS_ORIGIN = getChronosSocketUrl();
const CHRONOS_CHANNEL_IDS = getChronosChannelIds();

// Public channels to subscribe to (empty when Chronos is not configured)
export const CHRONOS_PUBLIC_CHANNEL_IDS = CHRONOS_ORIGIN
	? getChronosPublicChannelIds()
	: [];

// Chronos creates public messages only in its default language and sends
// each one to the sockets subscribed with that language
const PUBLIC_LANGUAGE = "en";

// Chronos parses every inbound frame as JSON and never replies, so the library
// heartbeat can't be used (it closes the socket when no reply arrives). A JSON
// no-op keeps idle proxies (nginx, Cloudflare) from dropping the connection.
const KEEPALIVE_FRAME = "{}";
const KEEPALIVE_INTERVAL_MS = 30000;

const MAX_RECONNECT_ATTEMPTS = 50;
const MAX_RECONNECT_DELAY_MS = 30000;

// Chronos delivers at least once. Remember recent ids across remounts, one set per
// source so a large public backlog can't push out the private ids.
const SEEN_IDS_LIMIT = 500;

type MarkSeen = (id: string) => boolean;

const createSeenIds = (limit: number): MarkSeen => {
	const seenIds = new Set<string>();
	return (id) => {
		if (seenIds.has(id)) return false;

		seenIds.add(id);
		if (seenIds.size > limit) {
			const oldest = seenIds.values().next().value;
			if (oldest !== undefined) seenIds.delete(oldest);
		}
		return true;
	};
};

const markPrivateSeen = createSeenIds(SEEN_IDS_LIMIT);
const markPublicSeen = createSeenIds(SEEN_IDS_LIMIT);

/**
 * Chronos reads the query string without percent-decoding it, so it is built by hand
 * (URLSearchParams would encode the commas of the channel list).
 */
export const buildChronosSocketUrl = (
	origin: string,
	partyId: string,
	sessionKey: string,
	channelIds?: string,
): string => {
	const query = [
		`id=${encodeURIComponent(partyId)}`,
		`sessionKey=${encodeURIComponent(sessionKey)}`,
	];
	if (channelIds) {
		query.push(`channel=${channelIds}`);
	}
	return `${origin}/websocket/private?${query.join("&")}`;
};

// Chronos reads the channel id from the exact path, so no trailing slash
export const buildChronosPublicSocketUrl = (
	origin: string,
	channelId: string,
): string =>
	`${origin}/websocket/channel/${channelId}?language=${PUBLIC_LANGUAGE}`;

/**
 * One Chronos socket: every frame is parsed and deduplicated before onNotification.
 * A null url closes the socket.
 */
const useChronosSocket = (
	url: string | null,
	parse: (raw: string) => NotificationType | null,
	markSeen: MarkSeen,
	onNotification: (notification: NotificationType) => void,
) => {
	const onNotificationRef = useRef(onNotification);
	useEffect(() => {
		onNotificationRef.current = onNotification;
	}, [onNotification]);

	const { sendMessage, readyState } = useWebSocket(url, {
		// Handle every frame here: Chronos can push several frames back to back
		onMessage: (event) => {
			if (typeof event.data !== "string") return;

			const notification = parse(event.data);
			if (notification && markSeen(notification.id)) {
				onNotificationRef.current(notification);
			}
		},
		// Frames are consumed in onMessage, skip the lastMessage state updates
		filter: () => false,
		shouldReconnect: () => url !== null,
		reconnectAttempts: MAX_RECONNECT_ATTEMPTS,
		reconnectInterval: (attempt) =>
			Math.min(MAX_RECONNECT_DELAY_MS, 1000 * 2 ** attempt) +
			Math.floor(Math.random() * 1000),
	});

	useEffect(() => {
		if (readyState !== ReadyState.OPEN) return;

		const timer = window.setInterval(
			() => sendMessage(KEEPALIVE_FRAME, false),
			KEEPALIVE_INTERVAL_MS,
		);
		return () => window.clearInterval(timer);
	}, [readyState, sendMessage]);

	return { readyState };
};

interface UseChronosWebSocketOptions {
	onNotification: (notification: NotificationType) => void;
}

/**
 * Receives the player's Chronos in-app messages (WEB_NOTIFICATION channels)
 * from chronos-engine's private socket. Disabled unless CHRONOS_SOCKET_URL is configured.
 */
export const useChronosWebSocket = ({
	onNotification,
}: UseChronosWebSocketOptions) => {
	const { session } = useSession();
	const sessionKey = session?.user?.sessionKey;

	// Player info is fetched with this sessionKey, so the partyId always belongs to it.
	// Chronos rejects the handshake when they don't match.
	const { data: partyId } = useQuery({
		...getPlayerInfoOptions({ session }),
		enabled: Boolean(CHRONOS_ORIGIN && sessionKey),
		select: (playerInfo) => playerInfo.partyId,
	});

	// A null URL closes the socket (e.g. on logout): Chronos never re-checks the session
	const socketUrl =
		CHRONOS_ORIGIN && sessionKey && partyId
			? buildChronosSocketUrl(
					CHRONOS_ORIGIN,
					String(partyId),
					sessionKey,
					CHRONOS_CHANNEL_IDS,
				)
			: null;

	return useChronosSocket(
		socketUrl,
		parseChronosFrame,
		markPrivateSeen,
		onNotification,
	);
};

/**
 * Receives the broadcasts of one public Chronos channel. The channel socket needs
 * no authentication, but it is only opened while the player is logged in.
 */
export const useChronosPublicChannel = (
	channelId: string,
	onNotification: (notification: NotificationType) => void,
) => {
	const { session } = useSession();
	const sessionKey = session?.user?.sessionKey;

	const socketUrl =
		CHRONOS_ORIGIN && sessionKey
			? buildChronosPublicSocketUrl(CHRONOS_ORIGIN, channelId)
			: null;

	return useChronosSocket(
		socketUrl,
		parseChronosPublicFrame,
		markPublicSeen,
		onNotification,
	);
};
