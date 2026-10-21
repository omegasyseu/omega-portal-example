import { describe, expect, it } from "vitest";
import { shownEngageFeatures } from "@/components/engage/engage-features.ts";
import {
	getWidgetSettings,
	hasRailWidget,
	isWidgetOffered,
	readWidgetSettings,
	setWidgetSetting,
	shownWidgets,
} from "./widget-settings";

const ALL_SHOWN = {
	showQuest: true,
	showJackpot: true,
	showChallenge: true,
	showLeaderboard: true,
	showCashback: true,
};

describe("readWidgetSettings", () => {
	it("shows every widget when nothing is saved", () => {
		expect(readWidgetSettings(null)).toEqual(ALL_SHOWN);
	});

	it("keeps the choices the old game page saved", () => {
		const saved = JSON.stringify({
			showLevelup: false,
			showQuest: false,
			showJackpot: true,
			showCashback: false,
		});
		expect(readWidgetSettings(saved)).toEqual({
			...ALL_SHOWN,
			showQuest: false,
			showCashback: false,
		});
	});

	it("ignores saved values that aren't on or off", () => {
		const saved = JSON.stringify({ showJackpot: "no", showChallenge: 0 });
		expect(readWidgetSettings(saved)).toEqual(ALL_SHOWN);
	});

	it("shows every widget when the saved value can't be read", () => {
		expect(readWidgetSettings("{not json")).toEqual(ALL_SHOWN);
		expect(readWidgetSettings("[false]")).toEqual(ALL_SHOWN);
	});
});

describe("shownWidgets", () => {
	const noJackpotOrLeaderboard = shownEngageFeatures({
		featureVisibility: { jackpot: false, leaderboard: false },
	});

	it("hides a widget whose Engage Feature the Brand hides, whatever the player chose", () => {
		expect(shownWidgets(ALL_SHOWN, noJackpotOrLeaderboard)).toEqual({
			...ALL_SHOWN,
			showJackpot: false,
			showLeaderboard: false,
		});
	});

	it("keeps the player's own choices for the rest", () => {
		expect(
			shownWidgets(
				{ ...ALL_SHOWN, showQuest: false, showCashback: false },
				noJackpotOrLeaderboard,
			),
		).toEqual({
			...ALL_SHOWN,
			showQuest: false,
			showJackpot: false,
			showLeaderboard: false,
			showCashback: false,
		});
	});

	it("offers no switch for a Hidden Engage Feature, and always offers Cashback", () => {
		expect(isWidgetOffered("showJackpot", noJackpotOrLeaderboard)).toBe(false);
		expect(isWidgetOffered("showChallenge", noJackpotOrLeaderboard)).toBe(true);
		expect(
			isWidgetOffered(
				"showCashback",
				shownEngageFeatures({
					featureVisibility: {
						jackpot: false,
						challenge: false,
						levelUp: false,
						quest: false,
						leaderboard: false,
					},
				}),
			),
		).toBe(true);
	});
});

describe("hasRailWidget", () => {
	const ALL_HIDDEN = {
		showQuest: false,
		showJackpot: false,
		showChallenge: false,
		showLeaderboard: false,
		showCashback: false,
	};

	it("is true while any rail card is shown", () => {
		expect(hasRailWidget({ ...ALL_HIDDEN, showJackpot: true })).toBe(true);
	});

	it("is false when only the quest popup is left on", () => {
		expect(hasRailWidget({ ...ALL_HIDDEN, showQuest: true })).toBe(false);
	});

	it("leaves the challenges out, since they sit below the game", () => {
		expect(hasRailWidget({ ...ALL_HIDDEN, showChallenge: true })).toBe(false);
	});

	it("leaves the Daily Race out, since it sits below the game", () => {
		expect(hasRailWidget({ ...ALL_HIDDEN, showLeaderboard: true })).toBe(false);
	});
});

describe("setWidgetSetting", () => {
	// The test environment has no localStorage, as in a blocked private window.
	it("keeps a choice for the visit even when it can't be saved", () => {
		setWidgetSetting("showQuest", false);
		expect(getWidgetSettings()).toEqual({ ...ALL_SHOWN, showQuest: false });

		setWidgetSetting("showQuest", true);
		expect(getWidgetSettings()).toEqual(ALL_SHOWN);
	});
});
