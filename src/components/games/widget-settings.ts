import { useSyncExternalStore } from "react";
import type {
	EngageFeature,
	ShownEngageFeatures,
} from "@/components/engage/engage-features.ts";

// The game page's Widget settings, as on Omega Wins: which cards show beside the
// game, which tabs (challenges, the Daily Race) show below it, and whether quest
// level-ups pop up. Saved in the browser under the key the old
// game page used, so players keep the choices they made there.
const STORAGE_KEY = "omega_widget_settings";

export type WidgetSettings = {
	showQuest: boolean;
	showJackpot: boolean;
	showChallenge: boolean;
	showLeaderboard: boolean;
	showCashback: boolean;
};

export type WidgetSetting = keyof WidgetSettings;

const DEFAULT_SETTINGS: WidgetSettings = {
	showQuest: true,
	showJackpot: true,
	showChallenge: true,
	showLeaderboard: true,
	showCashback: true,
};

const SETTING_NAMES = Object.keys(DEFAULT_SETTINGS) as WidgetSetting[];

// The cards beside the game. The challenges (showChallenge) and the Daily Race
// (showLeaderboard) sit below it instead.
const RAIL_SETTINGS: readonly WidgetSetting[] = ["showJackpot", "showCashback"];

// The Engage Feature each widget belongs to; Cashback isn't one.
const WIDGET_FEATURES: Record<WidgetSetting, EngageFeature | undefined> = {
	showQuest: "quest",
	showJackpot: "jackpot",
	showChallenge: "challenge",
	showLeaderboard: "leaderboard",
	showCashback: undefined,
};

// A widget of a Hidden Engage Feature has no switch: it never shows on that Brand.
export const isWidgetOffered = (
	name: WidgetSetting,
	shown: ShownEngageFeatures,
) => {
	const feature = WIDGET_FEATURES[name];
	return feature === undefined || shown[feature];
};

// What shows: the player's choices, less the Brand's Hidden Engage Features.
export const shownWidgets = (
	settings: WidgetSettings,
	shown: ShownEngageFeatures,
): WidgetSettings =>
	Object.fromEntries(
		SETTING_NAMES.map((name) => [
			name,
			settings[name] && isWidgetOffered(name, shown),
		]),
	) as WidgetSettings;

const parse = (raw: string): unknown => {
	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
};

// Every widget shows unless the saved value turns it off; anything unreadable is ignored.
export const readWidgetSettings = (raw: string | null): WidgetSettings => {
	const saved = raw === null ? null : parse(raw);
	if (typeof saved !== "object" || saved === null || Array.isArray(saved)) {
		return DEFAULT_SETTINGS;
	}
	const values = saved as Record<string, unknown>;
	return Object.fromEntries(
		SETTING_NAMES.map((name) => [
			name,
			typeof values[name] === "boolean" ? values[name] : DEFAULT_SETTINGS[name],
		]),
	) as WidgetSettings;
};

export const hasRailWidget = (settings: WidgetSettings) =>
	RAIL_SETTINGS.some((name) => settings[name]);

// Storage can be blocked (private windows, previews); the settings then last for the visit.
const loadRaw = (): string | null => {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
};

const listeners = new Set<() => void>();
let rawValue = loadRaw();
let snapshot = readWidgetSettings(rawValue);
// Set when saving fails; storage then can't be trusted over this visit's choices.
let isStorageBlocked = false;

const update = (raw: string | null) => {
	if (raw === rawValue) return;
	rawValue = raw;
	snapshot = readWidgetSettings(raw);
	for (const listener of listeners) listener();
};

// Picks up a change another tab made while nothing here was listening.
const resync = () => {
	if (!isStorageBlocked) update(loadRaw());
};

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	resync();
	// Another tab changing the settings.
	const onStorage = (event: StorageEvent) => {
		if (event.key === STORAGE_KEY) update(event.newValue);
	};
	window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
};

export const setWidgetSetting = (name: WidgetSetting, isShown: boolean) => {
	const raw = JSON.stringify({ ...snapshot, [name]: isShown });
	try {
		localStorage.setItem(STORAGE_KEY, raw);
	} catch {
		// Kept for this visit only.
		isStorageBlocked = true;
	}
	update(raw);
};

// For code outside React, such as the notification handler.
export const getWidgetSettings = () => {
	resync();
	return snapshot;
};

export const useWidgetSettings = () =>
	useSyncExternalStore(
		subscribe,
		() => snapshot,
		() => DEFAULT_SETTINGS,
	);
