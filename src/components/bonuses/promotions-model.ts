import dayjs from "dayjs";
import type { BonusType } from "@/components/bonuses/queries/get-active-bonuses.ts";
import { capitalizeString } from "@/hooks/use-format/capitalizaString";

// What the Promotions page shows, derived from the player's Bonuses. Kept free of React
// and of the clock so the rules can be tested on their own.

// A Bonus as the page shows it, with how much of its wagering requirement is done. My
// Rewards and Expired show the same fields.
export type BonusCard = {
	id: number;
	planName: string;
	amount: number;
	currency: string;
	wagered: number;
	wagerRequirement: number;
	// Percent of the requirement wagered, 0 to 100.
	progress: number;
	triggered: string;
	expires: string;
	// The games a Bonus's wagering is limited to, and the games that don't count.
	restrictedGames: string[];
	excludedGames: string[];
	// The status for people to read: "Active", "Released", "Cancelled".
	status: string;
	// Only an active Bonus can be canceled.
	canCancel: boolean;
};

export type PromotionsInput = {
	active: readonly (BonusType | undefined)[] | undefined;
	history: readonly (BonusType | undefined)[] | undefined;
};

export type Promotions = {
	// The active Bonuses.
	rewards: BonusCard[];
	// Past Bonuses from the history, without the ones still active.
	expired: BonusCard[];
};

const PERCENT = 100;

// A Bonus with nothing to wager counts as fully wagered; wagering past the requirement
// still shows a full bar.
const wageringProgress = (wagered: number, requirement: number) =>
	requirement <= 0
		? PERCENT
		: Math.min((wagered / requirement) * PERCENT, PERCENT);

const ACTIVE_STATUS = "ACTIVE";

// The API doesn't document what a game in a restriction looks like, so use a name when
// there is one and the raw value otherwise.
const gameLabel = (game: unknown): string => {
	if (typeof game === "string" || typeof game === "number") {
		return `${game}`;
	}
	if (game && typeof game === "object") {
		const { gameName, name, title, gameId } = game as Record<string, unknown>;
		const label = gameName ?? name ?? title ?? gameId;
		if (typeof label === "string" || typeof label === "number") {
			return `${label}`;
		}
	}
	return JSON.stringify(game);
};

const toBonusCard = (bonus: BonusType): BonusCard => ({
	id: bonus.id,
	planName: bonus.bonusPlanName,
	amount: bonus.amountNumber,
	currency: bonus.currency,
	wagered: bonus.amountWageredNumber,
	wagerRequirement: bonus.wagerRequirementNumber,
	progress: wageringProgress(
		bonus.amountWageredNumber,
		bonus.wagerRequirementNumber,
	),
	triggered: bonus.triggerDateFormatted,
	expires: bonus.expiryDateFormatted,
	restrictedGames: (bonus.restrictedGames ?? []).map(gameLabel),
	excludedGames: (bonus.excludedGames ?? []).map(gameLabel),
	status: capitalizeString(bonus.status.toLowerCase()),
	canCancel: bonus.status === ACTIVE_STATUS,
});

const toCards = (bonuses: PromotionsInput["active"]) =>
	(bonuses ?? []).flatMap((bonus) => (bonus ? [toBonusCard(bonus)] : []));

export const buildPromotions = ({
	active,
	history,
}: PromotionsInput): Promotions => {
	const rewards = toCards(active);
	const activeIds = new Set(rewards.map(({ id }) => id));
	return {
		rewards,
		expired: toCards(history).filter(({ id }) => !activeIds.has(id)),
	};
};

// The Expired section's dates, in the "YYYY-MM-DD" form the bonus history API takes.
export type HistoryWindow = { from: string; to: string };

export const DEFAULT_HISTORY_DAYS = 90;

const API_DATE_FORMAT = "YYYY-MM-DD";

// The last 90 days up to `today`, which the caller passes in so nothing reads the clock.
export const defaultHistoryWindow = (today: Date): HistoryWindow => ({
	from: dayjs(today)
		.subtract(DEFAULT_HISTORY_DAYS, "day")
		.format(API_DATE_FORMAT),
	to: dayjs(today).format(API_DATE_FORMAT),
});
