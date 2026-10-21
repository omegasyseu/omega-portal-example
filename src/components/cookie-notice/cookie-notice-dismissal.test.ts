import { afterEach, describe, expect, it, vi } from "vitest";
import {
	rememberCookieNoticeDismissed,
	wasCookieNoticeDismissed,
} from "@/components/cookie-notice/cookie-notice-dismissal.ts";

const memoryStorage = () => {
	const items = new Map<string, string>();
	return {
		getItem: (key: string) => items.get(key) ?? null,
		setItem: (key: string, value: string) => {
			items.set(key, value);
		},
		clear: () => items.clear(),
	};
};

const refused = () => {
	throw new DOMException("The operation is insecure.", "SecurityError");
};

describe("Cookie Notice dismissal", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("is not remembered on a first visit", () => {
		vi.stubGlobal("localStorage", memoryStorage());
		expect(wasCookieNoticeDismissed()).toBe(false);
	});

	it("is remembered once the visitor dismisses the notice", () => {
		vi.stubGlobal("localStorage", memoryStorage());
		rememberCookieNoticeDismissed();
		expect(wasCookieNoticeDismissed()).toBe(true);
	});

	it("is forgotten when the browser's storage is cleared", () => {
		const storage = memoryStorage();
		vi.stubGlobal("localStorage", storage);
		rememberCookieNoticeDismissed();
		storage.clear();
		expect(wasCookieNoticeDismissed()).toBe(false);
	});

	it("shows the notice again when storage is blocked", () => {
		vi.stubGlobal("localStorage", { getItem: refused, setItem: refused });
		vi.spyOn(console, "warn").mockImplementation(() => {});
		expect(() => rememberCookieNoticeDismissed()).not.toThrow();
		expect(wasCookieNoticeDismissed()).toBe(false);
	});
});
