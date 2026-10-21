import { withoutTrailingSlash } from "@/utils/without-trailing-slash.ts";

const getConfig = <T extends keyof RuntimeConfig>(
	key: T,
	fallback?: RuntimeConfig[T],
): RuntimeConfig[T] => {
	const runtimeValue =
		typeof window === "undefined" ? undefined : window.RUNTIME_CONFIG?.[key];
	// Check if the runtime value is a placeholder (starts with 'PORTAL_')
	const isPlaceholder =
		typeof runtimeValue === "string" && runtimeValue.startsWith("PORTAL_");

	if (runtimeValue && !isPlaceholder) {
		return runtimeValue;
	}

	return (import.meta.env[key] as T) ?? fallback;
};

const IPS_API = import.meta.env.IPS_API;
const AMS_API = import.meta.env.AMS_API;
const GAME_LAUNCH_BASE_URL = import.meta.env.GAME_LAUNCH_BASE_URL;

export const API_CFG = {
	IPS_API,
	AMS_API,
	GAME_LAUNCH_BASE_URL,
};

export const isEnableQuickSignupLink = (): boolean => {
	return getConfig("ENABLE_QUICK_SIGNUP_LINK") !== "false";
};

/**
 * The environment's Strapi (e.g. http://localhost:1337), where each Brand's theme, logo,
 * banners and lobby are published. Without a trailing slash. Throws when it isn't set,
 * rather than quietly asking the portal's own origin.
 */
export const getStrapiUrl = (): string => {
	const url = withoutTrailingSlash(String(getConfig("STRAPI_URL", "") ?? ""));
	if (!url) {
		throw new Error(
			"STRAPI_URL is not set, so no Brand's content can load. Set it to the environment's Strapi, e.g. http://localhost:1337 (PORTAL_STRAPI_URL in the container).",
		);
	}
	return url;
};

/**
 * The server's date.pattern registry, the Java pattern every IPS date comes back in (e.g. MM-dd-yyyy HH:mm:ss).
 * Empty means day first. It's one value for the environment and must match the server, so it
 * stays a setting rather than Brand content in Strapi.
 */
export const getDatePattern = (): string => {
	return getConfig("DATE_PATTERN", "");
};

/**
 * Origin of the Chronos engine private WebSocket (e.g. wss://chronos.example.com).
 * Returns undefined when it is not configured or not usable, which disables Chronos notifications.
 */
export const getChronosSocketUrl = (): string | undefined => {
	const raw = String(getConfig("CHRONOS_SOCKET_URL", "") ?? "").trim();
	if (!raw) return undefined;

	try {
		const url = new URL(raw);
		// Browsers block ws:// from an https page (mixed content)
		const isSecurePage = window.location.protocol === "https:";
		if (url.protocol === "wss:" || (url.protocol === "ws:" && !isSecurePage)) {
			return `${url.protocol}//${url.host}`;
		}
	} catch {
		// Invalid URL, disable below
	}

	console.warn(
		"CHRONOS_SOCKET_URL is not a usable ws(s) origin, Chronos notifications are disabled",
	);
	return undefined;
};

// Chronos parses channel store ids as Java Integers
const MAX_CHANNEL_ID = 2147483647;

// Comma separated channel store ids. Blank, invalid and out of range ids are dropped, duplicates removed.
const parseChannelIds = (raw: unknown): string[] => {
	const ids = String(raw ?? "")
		.split(",")
		.map((token) => token.trim())
		.filter((token) => /^\d{1,10}$/.test(token))
		.map(Number)
		.filter((id) => id >= 1 && id <= MAX_CHANNEL_ID)
		.map(String);
	return [...new Set(ids)];
};

/**
 * Optional filter for private Chronos channel store ids (e.g. "3,4"). Undefined = all private channels.
 */
export const getChronosChannelIds = (): string | undefined => {
	const ids = parseChannelIds(getConfig("CHRONOS_CHANNEL_IDS", ""));
	return ids.length > 0 ? ids.join(",") : undefined;
};

/**
 * Public Chronos channel store ids to subscribe to (e.g. "7,8"). Empty = no public channels.
 */
export const getChronosPublicChannelIds = (): string[] =>
	parseChannelIds(getConfig("CHRONOS_PUBLIC_CHANNEL_IDS", ""));
