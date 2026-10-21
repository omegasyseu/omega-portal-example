import { describe, expect, it } from "vitest";
import {
	isLinkToHiddenFeature,
	shownEngageFeatures,
} from "@/components/engage/engage-features.ts";

const ALL_SHOWN = {
	jackpot: true,
	challenge: true,
	levelUp: true,
	quest: true,
	leaderboard: true,
};

describe("shownEngageFeatures", () => {
	it("shows every Engage Feature for a Brand saved before the switches existed", () => {
		expect(shownEngageFeatures({})).toEqual(ALL_SHOWN);
		expect(shownEngageFeatures({ featureVisibility: null })).toEqual(ALL_SHOWN);
		expect(
			shownEngageFeatures({
				featureVisibility: { jackpot: null, quest: undefined },
			}),
		).toEqual(ALL_SHOWN);
	});

	it("shows every Engage Feature for a Brand with no content in Strapi", () => {
		expect(shownEngageFeatures(undefined)).toEqual(ALL_SHOWN);
	});

	it("hides only the Engage Features the Brand switched off", () => {
		expect(
			shownEngageFeatures({
				featureVisibility: {
					jackpot: false,
					challenge: true,
					levelUp: false,
					quest: true,
					leaderboard: false,
				},
			}),
		).toEqual({
			jackpot: false,
			challenge: true,
			levelUp: false,
			quest: true,
			leaderboard: false,
		});
	});
});

describe("isLinkToHiddenFeature", () => {
	const noLeaderboardOrJackpot = {
		...ALL_SHOWN,
		leaderboard: false,
		jackpot: false,
	};

	it("catches a page in a hidden feature, and the pages below it", () => {
		expect(isLinkToHiddenFeature("/leaderboard", noLeaderboardOrJackpot)).toBe(
			true,
		);
		expect(
			isLinkToHiddenFeature(
				"/leaderboard?period=WEEKLY#top",
				noLeaderboardOrJackpot,
			),
		).toBe(true);
		expect(
			isLinkToHiddenFeature("/leaderboard/weekly", noLeaderboardOrJackpot),
		).toBe(true);
		expect(isLinkToHiddenFeature("/Leaderboard", noLeaderboardOrJackpot)).toBe(
			true,
		);
		expect(isLinkToHiddenFeature("/jackpot", noLeaderboardOrJackpot)).toBe(
			true,
		);
	});

	it("catches a link that opens a hidden feature's dialog over any page", () => {
		expect(
			isLinkToHiddenFeature("/games?dialog=jackpot", noLeaderboardOrJackpot),
		).toBe(true);
	});

	it("leaves pages of shown features and other pages alone", () => {
		expect(isLinkToHiddenFeature("/quest", noLeaderboardOrJackpot)).toBe(false);
		expect(
			isLinkToHiddenFeature("/?dialog=challenges", noLeaderboardOrJackpot),
		).toBe(false);
		expect(isLinkToHiddenFeature("/bonus", noLeaderboardOrJackpot)).toBe(false);
		expect(
			isLinkToHiddenFeature("/leaderboards-promo", noLeaderboardOrJackpot),
		).toBe(false);
		expect(isLinkToHiddenFeature("/leaderboard", ALL_SHOWN)).toBe(false);
	});

	it("counts the Badges page as part of Challenge", () => {
		expect(
			isLinkToHiddenFeature("/badges", { ...ALL_SHOWN, challenge: false }),
		).toBe(true);
	});
});
