// The profile hub's tabs and which one a URL selects. Kept free of React so the rules
// can be tested on their own.

export type HubTabKey =
	| "general"
	| "kyc"
	| "responsible-gaming"
	| "game-history"
	| "transaction-history";

export type HubTab = {
	key: HubTabKey;
	label: string;
	to:
		| "/profile"
		| "/upload-documents"
		| "/responsible-gaming"
		| "/gaming-history"
		| "/transaction-history";
};

export const HUB_TABS: readonly HubTab[] = [
	{ key: "general", label: "General info", to: "/profile" },
	{ key: "kyc", label: "Kyc", to: "/upload-documents" },
	{
		key: "responsible-gaming",
		label: "Responsible Gaming",
		to: "/responsible-gaming",
	},
	{ key: "game-history", label: "Game history", to: "/gaming-history" },
	{
		key: "transaction-history",
		label: "Transaction history",
		to: "/transaction-history",
	},
];

// Saved links to the old Change Password and Contact Preferences pages open General
// info, which now holds both.
const GENERAL_INFO_ALIASES = ["/change-password", "/contact-preferences"];

export const hubTabFor = (pathname: string): HubTabKey | undefined => {
	const path =
		pathname.length > 1 && pathname.endsWith("/")
			? pathname.slice(0, -1)
			: pathname;
	if (GENERAL_INFO_ALIASES.includes(path)) {
		return "general";
	}
	return HUB_TABS.find((tab) => tab.to === path)?.key;
};
