import { isAuthPath } from "@/components/auth/auth-steps.ts";

// A placeholder origin: parsing against it shows whether a value would leave the portal.
const PORTAL_ORIGIN = "https://portal.invalid";

// Where to send a player after they sign in, taken from the ?redirect= search param.
// Only paths inside the portal are allowed, so a crafted link can't send a player to
// another site, and never a sign-in page; anything else gives undefined.
export const safeRedirectPath = (value: unknown): string | undefined => {
	if (
		typeof value !== "string" ||
		!value.startsWith("/") ||
		value.includes("\\")
	) {
		return undefined;
	}
	const url = new URL(value, PORTAL_ORIGIN);
	// Dot segments can collapse "/.//host" into "//host", a link to another site.
	if (
		url.origin !== PORTAL_ORIGIN ||
		url.pathname.startsWith("//") ||
		// Routes match regardless of case, so /LOGIN is a sign-in page too.
		isAuthPath(url.pathname.toLowerCase())
	) {
		return undefined;
	}
	return `${url.pathname}${url.search}${url.hash}`;
};

// The page to come back to when a player is sent to sign in from where they are now.
// Inside the sign-in flow (the dialog open on a page, or one of its old pages) that is
// the return-to page the flow already carries.
export const pageToReturnTo = (location: {
	pathname: string;
	href: string;
	search: { auth?: unknown; redirect?: unknown };
}): string | undefined => {
	const isInSignInFlow =
		location.search.auth !== undefined || isAuthPath(location.pathname);
	if (!isInSignInFlow) {
		return location.href;
	}
	return typeof location.search.redirect === "string"
		? location.search.redirect
		: undefined;
};

// Whether a return-to address is on the page the player is already on (only its search
// params differ), such as the page with a dialog open on it.
export const isSamePage = (href: string, pathname: string) =>
	new URL(href, PORTAL_ORIGIN).pathname === pathname;
