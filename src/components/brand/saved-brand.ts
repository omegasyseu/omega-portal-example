import { useSyncExternalStore } from "react";
import {
	rememberCookieNoticeDismissed,
	wasCookieNoticeDismissed,
} from "@/components/cookie-notice/cookie-notice-dismissal.ts";

// The Brand the visitor last picked in the Brand switcher, remembered in the browser and
// shared by its tabs. Storage can be blocked (private windows, previews); the choice then
// lasts for the visit.
const STORAGE_KEY = "portal-5-selected-brand";

const load = (): string | null => {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
};

const listeners = new Set<() => void>();
let savedBrandId = load();
// Set when saving fails; storage then can't be trusted over this visit's choice.
let isStorageBlocked = false;

const update = (brandId: string | null) => {
	if (brandId === savedBrandId) return;
	savedBrandId = brandId;
	for (const listener of listeners) listener();
};

const write = (brandId: string) => {
	try {
		localStorage.setItem(STORAGE_KEY, brandId);
	} catch {
		isStorageBlocked = true;
	}
};

// The store behind useSavedBrandId, for useSyncExternalStore.
export const subscribeToSavedBrand = (listener: () => void) => {
	listeners.add(listener);
	// Picks up a choice another tab made while nothing here was listening.
	if (!isStorageBlocked) update(load());
	// Another tab picking a Brand, or clearing storage (a null key).
	const onStorage = (event: StorageEvent) => {
		if (event.key === STORAGE_KEY || event.key === null) update(load());
	};
	window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
};

export const getSavedBrandId = () => savedBrandId ?? undefined;

export const useSavedBrandId = () =>
	useSyncExternalStore(subscribeToSavedBrand, getSavedBrandId, () => undefined);

export const saveBrandId = (brandId: string) => {
	write(brandId);
	update(brandId);
};

// Signing out clears the browser's storage, but the Selected Brand outlives it, so
// signing in again lands on the same Brand. So does the Cookie Notice dismissal, which
// belongs to the browser, not the sign-in.
export const clearStorageKeepingSavedBrand = () => {
	const wasNoticeDismissed = wasCookieNoticeDismissed();
	try {
		localStorage.clear();
	} catch {
		return;
	}
	if (savedBrandId !== null) write(savedBrandId);
	if (wasNoticeDismissed) rememberCookieNoticeDismissed();
};
