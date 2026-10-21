import { z } from "zod";

// Codes as defined by the backend's ResponsibleGamingLimitTypeEnum / ResponsibleGamingPeriodTypeEnum.
export const MONEY_LIMIT_TYPES = [
	"DEPOSIT_LIMIT",
	"WAGER_LIMIT",
	"LOSS_LIMIT",
] as const;
export const SESSION_SETTING_TYPES = [
	"SESSION_LIMIT",
	"REALITY_CHECK",
] as const;
export const LIMIT_TYPES = [
	...MONEY_LIMIT_TYPES,
	...SESSION_SETTING_TYPES,
] as const;
export const MONEY_LIMIT_PERIODS = ["Daily", "Weekly", "Monthly"] as const;
// Session limit and reality check have no accumulation window.
export const SESSION_SETTING_PERIOD = "Permanent";
export const LIMIT_PERIODS = [
	...MONEY_LIMIT_PERIODS,
	SESSION_SETTING_PERIOD,
] as const;

export type MoneyLimitType = (typeof MONEY_LIMIT_TYPES)[number];
export type SessionSettingType = (typeof SESSION_SETTING_TYPES)[number];
export type LimitType = (typeof LIMIT_TYPES)[number];
export type MoneyLimitPeriod = (typeof MONEY_LIMIT_PERIODS)[number];
export type LimitPeriod = (typeof LIMIT_PERIODS)[number];

// The backend matches codes case-insensitively, so rows created elsewhere may come back as e.g. "DAILY".
const caseInsensitiveEnum = <T extends readonly [string, ...string[]]>(
	values: T,
) =>
	z.preprocess(
		(value) =>
			typeof value === "string"
				? (values.find((code) => code.toLowerCase() === value.toLowerCase()) ??
					value)
				: value,
		z.enum(values),
	);

export const ResponsibleGamingLimitSchema = z.object({
	responsibleGamingLimitID: z.number(),
	limitType: caseInsensitiveEnum(LIMIT_TYPES),
	periodType: caseInsensitiveEnum(LIMIT_PERIODS),
	// null on a pending row means the limit is being removed
	limit: z.number().nullable().optional(),
	cumulatedValue: z.number().nullable().optional(),
	remainingAllowance: z.number().nullable().optional(),
	// Already formatted by the backend in the brand's date pattern and timezone
	effectiveDate: z.string().nullable().optional(),
	status: caseInsensitiveEnum(["ACTIVE", "INACTIVE", "PENDING"] as const),
});

export const GetResponsibleGamingLimitsResponseSchema = z.object({
	status: z.string(),
	limits: z.array(ResponsibleGamingLimitSchema).optional(),
});

export type ResponsibleGamingLimit = z.infer<
	typeof ResponsibleGamingLimitSchema
>;
