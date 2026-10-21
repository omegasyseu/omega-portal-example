import type {
	EngageFeature,
	ShownEngageFeatures,
} from "@/components/engage/engage-features.ts";
import {
	dialogForPath,
	type EngageDialog,
} from "@/components/engage-dialog/engage-dialog.ts";
import type {
	CollectionIcon,
	GameCollection,
} from "@/components/games/lobby-model.ts";
import {
	LEGAL_PAGES,
	type LegalPageSlug,
} from "@/components/legal/legal-page-model.ts";

// What the app shell links to (sidebar, mobile bottom nav, footer), derived from who is
// looking. Kept free of React so the rules can be tested on their own.

export type NavPath =
	| "/"
	| "/games"
	| "/signup"
	| "/bonus"
	| "/jackpot"
	| "/challenges"
	| "/levelup"
	| "/quest"
	| "/leaderboard"
	| "/refer-a-friend"
	| "/deposit"
	| "/withdraw"
	| "/purchase"
	| "/redeem"
	| "/responsible-gaming";

export type NavIcon =
	| "promotions"
	| "jackpot"
	| "challenge"
	| "levelup"
	| "quest"
	| "leaderboard"
	| "refer"
	| "deposit"
	| "withdraw"
	| "purchase"
	| "redeem"
	| "home"
	| "games"
	| "register"
	| "menu"
	| "responsible-gaming";

export type NavLink = {
	key: string;
	label: string;
	icon: NavIcon;
	to: NavPath;
	// The page needs a logged-in player: its route guard sends anyone else to sign in
	// and back again afterwards. A gated link is never shown as the current page.
	gated: boolean;
	// The header's primary button; it is styled apart and never shown as current.
	isCallToAction?: true;
};

// A link into the games lobby: a Collection's tab, with its icon, or every game.
export type GameNavLink = {
	key: string;
	label: string;
	collection?: string;
	icon?: CollectionIcon;
};

// The last bottom-nav slot opens the sidebar instead of navigating.
export type MenuSlot = {
	key: "menu";
	label: "Menu";
	icon: "menu";
	to?: undefined;
	gated: false;
};

export type FooterLink =
	| ({ kind: "page" } & Omit<NavLink, "icon">)
	| ({ kind: "games" } & GameNavLink)
	// A Legal Page (/legal/<key>): public, so never gated.
	| { kind: "legal"; key: LegalPageSlug; label: string };

export type FooterColumn = {
	title: string;
	links: FooterLink[];
};

export type NavigationInput = {
	isLoggedIn: boolean;
	isSocialBrand: boolean;
	// The Collections the Brand shows, in order.
	gameCollections: readonly Pick<GameCollection, "slug" | "name" | "icon">[];
	// A Hidden Engage Feature gets no link.
	engageFeatures: ShownEngageFeatures;
};

export type Navigation = {
	// The header's primary button: Register, Deposit or Buy Coins.
	callToAction: NavLink;
	socialCenter: NavLink[];
	// Deposit and Withdraw, or Purchase and Redeem: set apart, and only for a logged-in
	// player.
	payments: NavLink[];
	games: GameNavLink[];
	bottomNav: (NavLink | MenuSlot)[];
	footer: FooterColumn[];
};

// A personal item needs a logged-in player; its route guard would bounce anyone else.
// An Engage Feature's item goes when the Brand hides the feature.
type NavEntry = Omit<NavLink, "gated"> & {
	personal: boolean;
	feature?: EngageFeature;
};

const PROMOTIONS: NavEntry = {
	key: "promotions",
	label: "Promotions",
	icon: "promotions",
	to: "/bonus",
	personal: true,
};
const JACKPOT: NavEntry = {
	key: "jackpot",
	label: "Jackpot",
	icon: "jackpot",
	to: "/jackpot",
	personal: true,
	feature: "jackpot",
};
const CHALLENGE: NavEntry = {
	key: "challenge",
	label: "Challenge",
	icon: "challenge",
	to: "/challenges",
	personal: true,
	feature: "challenge",
};
const LEVEL_UP: NavEntry = {
	key: "levelup",
	label: "Level Up",
	icon: "levelup",
	to: "/levelup",
	personal: true,
	feature: "levelUp",
};
const QUEST: NavEntry = {
	key: "quest",
	label: "Quest",
	icon: "quest",
	to: "/quest",
	personal: true,
	feature: "quest",
};
const LEADERBOARD: NavEntry = {
	key: "leaderboard",
	label: "Leaderboard",
	icon: "leaderboard",
	to: "/leaderboard",
	personal: false,
	feature: "leaderboard",
};
const REFER_A_FRIEND: NavEntry = {
	key: "refer",
	label: "Refer a friend",
	icon: "refer",
	to: "/refer-a-friend",
	personal: true,
};
const DEPOSIT: NavEntry = {
	key: "deposit",
	label: "Deposit",
	icon: "deposit",
	to: "/deposit",
	personal: true,
};
const WITHDRAW: NavEntry = {
	key: "withdraw",
	label: "Withdraw",
	icon: "withdraw",
	to: "/withdraw",
	personal: true,
};
const PURCHASE: NavEntry = {
	key: "purchase",
	label: "Purchase",
	icon: "purchase",
	to: "/purchase",
	personal: true,
};
const REDEEM: NavEntry = {
	key: "redeem",
	label: "Redeem",
	icon: "redeem",
	to: "/redeem",
	personal: true,
};
const BUY_COINS: NavEntry = {
	key: "buy-coins",
	label: "Buy Coins",
	icon: "purchase",
	to: "/purchase",
	personal: true,
};
const REGISTER: NavEntry = {
	key: "register",
	label: "Register",
	icon: "register",
	to: "/signup",
	personal: false,
};
const HOME: NavEntry = {
	key: "home",
	label: "Home",
	icon: "home",
	to: "/",
	personal: false,
};
const GAMES: NavEntry = {
	key: "games",
	label: "Games",
	icon: "games",
	to: "/games",
	personal: false,
};
const RESPONSIBLE_GAMING: NavEntry = {
	key: "responsible-gaming",
	label: "Responsible Gaming",
	icon: "responsible-gaming",
	to: "/responsible-gaming",
	personal: true,
};

const LEGAL_PAGE_LINKS: FooterLink[] = LEGAL_PAGES.map(({ slug, title }) => ({
	kind: "legal",
	key: slug,
	label: title,
}));

const MENU_SLOT: MenuSlot = {
	key: "menu",
	label: "Menu",
	icon: "menu",
	gated: false,
};

const toLink =
	(isLoggedIn: boolean) =>
	({ personal, feature: _feature, ...link }: NavEntry): NavLink => ({
		...link,
		gated: personal && !isLoggedIn,
	});

const toFooterPage = ({ icon: _icon, ...page }: NavLink): FooterLink => ({
	kind: "page",
	...page,
});

const toGameLinks = (
	collections: NavigationInput["gameCollections"],
): GameNavLink[] => [
	{ key: "all", label: "All Games" },
	...collections.map(({ slug, name, icon }) => ({
		key: slug,
		label: name,
		collection: slug,
		icon,
	})),
];

const callToActionEntry = (isLoggedIn: boolean, isSocialBrand: boolean) => {
	if (!isLoggedIn) {
		return REGISTER;
	}
	return isSocialBrand ? BUY_COINS : DEPOSIT;
};

export const buildNavigation = ({
	isLoggedIn,
	isSocialBrand,
	gameCollections,
	engageFeatures,
}: NavigationInput): Navigation => {
	const asLink = toLink(isLoggedIn);
	const isShown = ({ feature }: NavEntry) =>
		feature === undefined || engageFeatures[feature];
	const games = toGameLinks(gameCollections);
	const callToAction: NavLink = {
		...asLink(callToActionEntry(isLoggedIn, isSocialBrand)),
		isCallToAction: true,
	};

	return {
		callToAction,
		socialCenter: [
			PROMOTIONS,
			JACKPOT,
			CHALLENGE,
			LEVEL_UP,
			QUEST,
			LEADERBOARD,
			REFER_A_FRIEND,
		]
			.filter(isShown)
			.map(asLink),
		payments: !isLoggedIn
			? []
			: (isSocialBrand ? [PURCHASE, REDEEM] : [DEPOSIT, WITHDRAW]).map(asLink),
		games,
		bottomNav: [
			callToAction,
			...[HOME, PROMOTIONS, GAMES].map(asLink),
			MENU_SLOT,
		],
		footer: [
			{
				title: "Policies & Terms",
				links: [...LEGAL_PAGE_LINKS, toFooterPage(asLink(RESPONSIBLE_GAMING))],
			},
			{
				title: "Other pages",
				links: [PROMOTIONS, LEADERBOARD, CHALLENGE, JACKPOT]
					.filter(isShown)
					.map(asLink)
					.map(toFooterPage),
			},
			{
				title: "Games",
				links: games.map((link) => ({ kind: "games", ...link })),
			},
		],
	};
};

export const isMenuSlot = (slot: NavLink | MenuSlot): slot is MenuSlot =>
	slot.key === "menu" && slot.to === undefined;

// Whether a link points at the page being shown. Home only matches itself; other links
// also match the pages below them. Gated links, the call to action and the menu slot are
// never current.
// A dialog's link (Jackpot, Challenges) is current while its dialog is open, on any page.
export const isLinkActive = (
	link: NavLink | MenuSlot,
	pathname: string,
	openDialog?: EngageDialog,
) => {
	if (isMenuSlot(link) || link.gated || link.isCallToAction) {
		return false;
	}
	const dialog = dialogForPath(link.to);
	if (dialog) {
		return dialog === openDialog;
	}
	return link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
};

// A game's own page (/games/<id>), not the lobby at /games or /games/.
export const isGamePath = (pathname: string) =>
	/^\/games\/[^/]+/.test(pathname);
