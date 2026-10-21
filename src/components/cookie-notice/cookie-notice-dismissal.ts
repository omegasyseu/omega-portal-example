// Whether the visitor dismissed the Cookie Notice, remembered in the browser. Blocked
// storage just means the notice shows again.
const STORAGE_KEY = "portal-5-cookie-notice-dismissed";

export const wasCookieNoticeDismissed = () => {
	try {
		return localStorage.getItem(STORAGE_KEY) !== null;
	} catch (error) {
		console.warn(
			"Couldn't read the Cookie Notice dismissal; it may show again",
			error,
		);
		return false;
	}
};

export const rememberCookieNoticeDismissed = () => {
	try {
		localStorage.setItem(STORAGE_KEY, "true");
	} catch (error) {
		console.warn(
			"Couldn't remember the Cookie Notice dismissal; it may show again",
			error,
		);
	}
};
