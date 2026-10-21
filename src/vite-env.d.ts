/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly IPS_API: string;
	readonly AMS_API: string;
	readonly GAME_LAUNCH_BASE_URL: string;
	readonly ENABLE_QUICK_SIGNUP_LINK: string;
	readonly STRAPI_URL?: string;
	readonly DATE_PATTERN?: string;
	readonly CHRONOS_SOCKET_URL?: string;
	readonly CHRONOS_CHANNEL_IDS?: string;
	readonly CHRONOS_PUBLIC_CHANNEL_IDS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
