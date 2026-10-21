import {
	type EngageDialog,
	PAGE_ORIGIN,
} from "@/components/engage-dialog/engage-dialog.ts";

// Which Engage Features a Brand shows (GLOSSARY.md). A Hidden Engage Feature's page still
// opens by direct link; only the ways into it go. Kept free of React so the rules can be
// tested on their own.

export type EngageFeature =
	| "jackpot"
	| "challenge"
	| "levelUp"
	| "quest"
	| "leaderboard";

export type ShownEngageFeatures = Readonly<Record<EngageFeature, boolean>>;

// The Brand's Feature visibility as Strapi gives it. A Brand that never saved it has none.
type BrandSwitches = {
	featureVisibility?: Partial<Record<EngageFeature, boolean | null>> | null;
};

// Shown unless the Brand switched it off: a missing switch means shown.
export const shownEngageFeatures = (
	brand: BrandSwitches | undefined,
): ShownEngageFeatures => {
	const switches = brand?.featureVisibility;
	return {
		jackpot: switches?.jackpot !== false,
		challenge: switches?.challenge !== false,
		levelUp: switches?.levelUp !== false,
		quest: switches?.quest !== false,
		leaderboard: switches?.leaderboard !== false,
	};
};

export const DIALOG_FEATURE: Record<EngageDialog, EngageFeature> = {
	jackpot: "jackpot",
	challenges: "challenge",
};

// Each feature's pages: the page itself and the pages below it.
const FEATURE_PAGES: Record<EngageFeature, readonly string[]> = {
	jackpot: ["/jackpot"],
	challenge: ["/challenges", "/badges"],
	levelUp: ["/levelup"],
	quest: ["/quest"],
	leaderboard: ["/leaderboard"],
};

const isDialog = (name: string | null): name is EngageDialog =>
	name !== null && Object.hasOwn(DIALOG_FEATURE, name);

const isUnder = (pathname: string, page: string) =>
	pathname === page || pathname.startsWith(`${page}/`);

// Whether a portal path ("/leaderboard?period=WEEKLY", "/games?dialog=jackpot") leads into
// a Hidden Engage Feature.
export const isLinkToHiddenFeature = (
	path: string,
	shown: ShownEngageFeatures,
) => {
	const url = new URL(path, PAGE_ORIGIN);
	// The router matches paths regardless of case, so "/Leaderboard" opens Leaderboard too.
	const pathname = url.pathname.toLowerCase();
	const dialog = url.searchParams.get("dialog");
	if (isDialog(dialog) && !shown[DIALOG_FEATURE[dialog]]) {
		return true;
	}
	return Object.entries(FEATURE_PAGES).some(
		([feature, pages]) =>
			!shown[feature as EngageFeature] &&
			pages.some((page) => isUnder(pathname, page)),
	);
};
