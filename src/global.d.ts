interface RuntimeConfig {
	ENABLE_QUICK_SIGNUP_LINK: string;
	STRAPI_URL: string;
	DATE_PATTERN: string;
	CHRONOS_SOCKET_URL: string;
	CHRONOS_CHANNEL_IDS: string;
	CHRONOS_PUBLIC_CHANNEL_IDS: string;
}

interface Window {
	RUNTIME_CONFIG?: RuntimeConfig;
}
