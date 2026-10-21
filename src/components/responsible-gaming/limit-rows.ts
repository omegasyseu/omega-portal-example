import { formatNumByCurrency } from "@/hooks/use-format/fomatCurrencySymbol";
import {
	type LimitPeriod,
	type LimitType,
	MONEY_LIMIT_PERIODS,
	type MoneyLimitPeriod,
	type MoneyLimitType,
	type ResponsibleGamingLimit,
} from "@/schemas-types/responsible-gaming";
import type { LimitChange } from "@/server/IPS/responsible-gaming/update-responsible-gaming-limit.tsx";

export const LIMIT_TYPE_LABELS: Record<LimitType, string> = {
	DEPOSIT_LIMIT: "Deposit limit",
	WAGER_LIMIT: "Wager limit",
	LOSS_LIMIT: "Loss limit",
	SESSION_LIMIT: "Session Limit",
	REALITY_CHECK: "Reality Check",
};

type LimitSlot = {
	active?: ResponsibleGamingLimit;
	pending?: ResponsibleGamingLimit;
};

// One limit type + period holds at most one ACTIVE row and one PENDING change.
export const findLimitSlot = (
	limits: ResponsibleGamingLimit[],
	limitType: LimitType,
	periodType: LimitPeriod,
): LimitSlot => {
	const matching = limits.filter(
		(limit) => limit.limitType === limitType && limit.periodType === periodType,
	);
	return {
		active: matching.find((limit) => limit.status === "ACTIVE"),
		pending: matching.find((limit) => limit.status === "PENDING"),
	};
};

export const formatAmount = (
	value: number | null | undefined,
	currency?: string,
) =>
	value === null || value === undefined
		? "—"
		: formatNumByCurrency(value, currency);

// A money limit card's fields: an amount per period, or "" for no limit.
export type MoneyLimitValues = Record<MoneyLimitPeriod, number | "">;

// The requests a card's Save sends: one per period whose field differs from the active
// limit. A cleared field removes the limit.
export const moneyLimitChanges = (
	limitType: MoneyLimitType,
	limits: ResponsibleGamingLimit[],
	values: MoneyLimitValues,
): LimitChange[] =>
	MONEY_LIMIT_PERIODS.flatMap((periodType) => {
		const current =
			findLimitSlot(limits, limitType, periodType).active?.limit ?? null;
		const value = values[periodType];
		const next = value === "" ? null : value;
		return next === current ? [] : [{ limitType, periodType, limit: next }];
	});

// What a money limit card keeps when a Save stops on an error: the amounts that weren't
// saved, and the backend's reason for the one it refused. The card remounts once the
// changes that did save come back, and starts from these instead of losing them.
export type UnsavedLimitFields = {
	limitType: MoneyLimitType;
	values: Partial<MoneyLimitValues>;
	errors: Partial<Record<MoneyLimitPeriod, string>>;
};

export const unsavedLimitFields = (
	limitType: MoneyLimitType,
	unsent: LimitChange[],
	rejection: string | null,
): UnsavedLimitFields => {
	const [rejected] = unsent;
	return {
		limitType,
		values: Object.fromEntries(
			unsent.map(({ periodType, limit }) => [periodType, limit ?? ""]),
		),
		errors: rejection && rejected ? { [rejected.periodType]: rejection } : {},
	};
};

// When a Pending Limit takes over. The backend sends the date already formatted for the
// brand; without one, it's simply after the Cool-down.
const afterCoolDown = (effectiveDate?: string | null) =>
	effectiveDate
		? ` on ${effectiveDate}, after the Cool-down.`
		: " after the Cool-down.";

export const minutesLabel = (minutes: number | null | undefined) =>
	minutes ? `${minutes} minutes` : "Off";

// The Pending Limit note under a Session Limit or Reality Check card.
export const pendingSessionNote = (pending: ResponsibleGamingLimit) =>
	`changes to ${minutesLabel(pending.limit)}${afterCoolDown(pending.effectiveDate)}`;

// The Pending Limit note under a money limit card: a raise or removal waiting for its
// Cool-down.
export const pendingLimitNote = ({
	periodType,
	pending,
	active,
	currency,
}: {
	periodType: LimitPeriod;
	pending: ResponsibleGamingLimit;
	active?: ResponsibleGamingLimit;
	currency?: string;
}) => {
	const limit = `your ${periodType.toLowerCase()} limit`;
	const change =
		pending.limit === null || pending.limit === undefined
			? `${limit} is removed`
			: `${limit} rises to ${formatAmount(pending.limit, currency)}`;
	const when = afterCoolDown(pending.effectiveDate);
	const meanwhile = active?.limit
		? ` Until then ${formatAmount(active.limit, currency)} applies.`
		: "";
	return `${change}${when}${meanwhile}`;
};
