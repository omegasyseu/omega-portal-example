const GAMES = "/games";
const QUOTED = /^".*"$/;
// Stands in for the portal's own address, so a relative href can be read as a URL.
const PORTAL = "http://portal.local";

// The game page an address points to on the portal, with the game's name when its
// gameName search param has one; nothing for any other page, or an address that
// resolves elsewhere, such as "//elsewhere/games/…".
const gamePageOf = (href: string) => {
	const url = new URL(href, PORTAL);
	if (url.origin !== PORTAL || !url.pathname.startsWith(`${GAMES}/`)) {
		return undefined;
	}
	const name = url.searchParams.get("gameName") ?? "";
	// The router quotes a value that would otherwise read as a number, such as "777".
	return { name: (QUOTED.test(name) ? name.slice(1, -1) : name) || undefined };
};

// Where the deposit confirmation's main button goes: back to the game the player
// deposited from, or on to the games.
export const returnLink = (origin?: string) => {
	const game = origin === undefined ? undefined : gamePageOf(origin);
	if (origin === undefined || game === undefined) {
		return { label: "Play games", href: GAMES };
	}
	return { label: `Back to ${game.name ?? "the game"}`, href: origin };
};

type RouterLocation = { pathname: string; href: string };

// The payment pages, which a deposit's way back skips over.
const PAYMENT_PAGES = [
	"/deposit",
	"/withdraw",
	"/purchase",
	"/repurchase",
	"/redeem",
];

const isPaymentPage = (pathname: string) =>
	PAYMENT_PAGES.some(
		(page) => pathname === page || pathname.startsWith(`${page}/`),
	);

// The page the player came to the payment pages from: recorded as they enter them,
// and kept while they move between them or go elsewhere.
export const nextOrigin = (
	current: string | undefined,
	from: RouterLocation | undefined,
	toPathname: string,
) =>
	from && isPaymentPage(toPathname) && !isPaymentPage(from.pathname)
		? from.href
		: current;

type ResolvedNavigation = {
	fromLocation?: RouterLocation;
	toLocation: RouterLocation;
};

// Kept outside React: by the time the deposit page renders, the router no longer says
// which page the player came from, so it's noted as they navigate.
let origin: string | undefined;

// Follows the router's navigations, so the deposit confirmation knows the way back.
export const trackPaymentOrigin = (router: {
	subscribe: (
		event: "onResolved",
		listener: (navigation: ResolvedNavigation) => void,
	) => () => void;
}) =>
	router.subscribe("onResolved", ({ fromLocation, toLocation }) => {
		origin = nextOrigin(origin, fromLocation, toLocation.pathname);
	});

export const getPaymentOrigin = () => origin;
