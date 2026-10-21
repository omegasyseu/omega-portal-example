import { afterEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "portal-5-selected-brand";

type Storage = {
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	clear: () => void;
};

const memoryStorage = (initial: Record<string, string> = {}) => {
	const items = new Map(Object.entries(initial));
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

// Storage the browser blocks outright (some private windows and previews).
const blockedStorage: Storage = {
	getItem: refused,
	setItem: refused,
	clear: refused,
};

// The saved Brand is read once, when the module loads, so each test loads it afresh
// against its own storage.
const loadSavedBrand = async (storage: Storage) => {
	vi.resetModules();
	vi.stubGlobal("localStorage", storage);
	vi.stubGlobal("window", new EventTarget());
	return import("@/components/brand/saved-brand.ts");
};

describe("saved Brand", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("starts on the Brand saved on an earlier visit", async () => {
		const savedBrand = await loadSavedBrand(
			memoryStorage({ [STORAGE_KEY]: "7" }),
		);
		expect(savedBrand.getSavedBrandId()).toBe("7");
	});

	it("keeps the visitor's pick through sign-out clearing storage", async () => {
		const storage = memoryStorage({ "other-key": "dropped" });
		const savedBrand = await loadSavedBrand(storage);

		savedBrand.saveBrandId("5");
		savedBrand.clearStorageKeepingSavedBrand();

		expect(storage.getItem(STORAGE_KEY)).toBe("5");
		expect(storage.getItem("other-key")).toBeNull();
	});

	it("keeps the Cookie Notice dismissal through sign-out clearing storage", async () => {
		const storage = memoryStorage({
			"portal-5-cookie-notice-dismissed": "true",
		});
		const savedBrand = await loadSavedBrand(storage);

		savedBrand.clearStorageKeepingSavedBrand();

		expect(storage.getItem("portal-5-cookie-notice-dismissed")).toBe("true");
	});

	it("keeps the visitor's pick for the visit when the browser blocks storage", async () => {
		const savedBrand = await loadSavedBrand(blockedStorage);
		expect(savedBrand.getSavedBrandId()).toBeUndefined();

		savedBrand.saveBrandId("5");
		const unsubscribe = savedBrand.subscribeToSavedBrand(() => {});
		savedBrand.clearStorageKeepingSavedBrand();

		expect(savedBrand.getSavedBrandId()).toBe("5");
		unsubscribe();
	});

	it("keeps this visit's pick over an older one when saving fails", async () => {
		const savedBrand = await loadSavedBrand({
			...memoryStorage({ [STORAGE_KEY]: "2" }),
			setItem: refused,
		});

		savedBrand.saveBrandId("5");
		// Subscribing re-reads storage for a pick another tab made, which would bring
		// back the older "2".
		const unsubscribe = savedBrand.subscribeToSavedBrand(() => {});

		expect(savedBrand.getSavedBrandId()).toBe("5");
		unsubscribe();
	});
});
