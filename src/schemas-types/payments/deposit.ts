import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";
export const methodsSchema = z.array(
	z.object({
		name: z.string(),
		type: z.string(),
		brands: z.array(z.string()),
	}),
);

export const depositMethodsSchema = z.array(
	z.object({
		code: z.string(),
		paymentMethod: z.string(),
		minimumDeposit: z.string(),
		feeRate: z.string(),
		conversionRequired: z.boolean(),
		maximumDeposit: z.string(),
		popupRequired: z.boolean(),
		method: methodsSchema.optional(),
	}),
);
export type DepositType = z.infer<typeof depositMethodsSchema>[0];

export const getDepositMethodsResults = z.object({
	depositMethods: depositMethodsSchema.optional(),
});

export const depositsWithBaseRes = BASE_RESPONSE_SCHEMA.merge(
	getDepositMethodsResults,
);
export type depositsWithBaseRes = z.infer<typeof depositsWithBaseRes>;

// for depositsLimits
export const getDepositsLimitsSchema = z.object({
	dailyLimit: z.string(),
	weeklyLimit: z.string(),
	monthlyLimit: z.string(),
	operatorDailyLimit: z.string(),
	operatorWeeklyLimit: z.string(),
	operatorMonthlyLimit: z.string(),
	currency: z.string(),
	noOfCreditCard: z.unknown(),
	noOfCreditCardUsed: z.unknown(),
	noOfCreditCardDay: z.unknown(),
	noOfCreditCardWeek: z.unknown(),
	noOfCreditCardMonth: z.unknown(),
	noOfCreditCardDayUsed: z.unknown(),
	noOfCreditCardWeekUsed: z.unknown(),
	noOfCreditCardMonthUsed: z.unknown(),
});

// BONUS LIMITS
export const bonusPlans = z.array(
	z.object({
		bonusPlanName: z.string(),
		bonusAmount: z.string(),
		bonusPlanId: z.string(),
		minDepositAmount: z.string(),
		maxDepositAmount: z.string(),
		maxReleasedAmount: z.string(),
		gamePreferences: z.array(z.string()).optional(),
		description: z.string().nullish(),
		imageUrl: z.string(),
		startDate: z.string(),
		startDateFormatted: z.string(),
		endDate: z.string(),
		endDateFormatted: z.string(),
		paymentSubmethod: z.array(z.unknown()).nullish(),
		currency: z.array(z.string()).optional(),
		playable: z.boolean(),
	}),
);

export const getBonusesPlansSchema = z.object({
	bonusPlans: bonusPlans.optional(),
});

export type BonusPlanType = z.infer<typeof bonusPlans>[0];

// prepare deposits-purchase

export const GET_CURRENCY_LIST = z
	.object({
		data: z
			.array(
				z.object({
					id: z.number(),
					type: z.string(),
					currency: z.string(),
					precision: z.number(),
					minimum_amount: z.string(),
					deposit_fee_percent: z.string(),
					withdrawal_fee_percent: z.string(),
				}),
			)
			.optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

export type GET_CURRENCY_LIST = z.infer<typeof GET_CURRENCY_LIST>;

export const GET_CURRENCY_PAIR = z
	.object({
		currencyPairs: z
			.array(
				z.object({
					currency_from: z.object({
						currency: z.string(),
						type: z.string(),
						errors: z.null(),
						min_amount: z.string(),
						min_amount_deposit_with_exchange: z.null(),
					}),
					currency_to: z.object({
						currency: z.string(),
						type: z.string(),
						errors: z.null(),
						min_amount: z.null(),
						min_amount_deposit_with_exchange: z.null(),
					}),
					rate_from: z.string(),
					rate_to: z.string(),
				}),
			)
			.optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

export type GET_CURRENCY_PAIR = z.infer<typeof GET_CURRENCY_PAIR>;

export const TAKE_ADDRESS = z
	.object({
		address: z
			.object({
				providerCryptoAddressId: z.number(),
				partyId: z.number(),
				primaryPartyId: z.number(),
				paymentMethod: z.string(),
				providerUUID: z.string(),
				address: z.string(),
				currency: z.string(),
				convertTo: z.null(),
				dateTime: z.string(),
				tag: z.null(),
				status: z.string(),
			})
			.optional(),
		sessionKey: z.string(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

export type TAKE_ADDRESS = z.infer<typeof TAKE_ADDRESS>;

export const GET_PROVIDER_CRYPTO_ADDRESS = z
	.object({
		status: z.string(),
		continueUrl: z.null(),
		addresses: z
			.array(
				z.object({
					address: z.string(),
					tag: z.null(),
					currency: z.string(),
					convertTo: z.null(),
					createTime: z.string(),
				}),
			)
			.optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

export type GET_PROVIDER_CRYPTO_ADDRESS = z.infer<
	typeof GET_PROVIDER_CRYPTO_ADDRESS
>;

export const GET_EXCHANGE_INFO = z.object({
	status: z.string(),
	sessionId: z.optional(z.unknown()),
	customerCardId: z.optional(z.unknown()),
	conversionId: z.string(),
	convertToCurrency: z.string(),
	convertFromCurrency: z.string(),
	conversionRate: z.string(),
	merchantSession: z.null(),
	creditCards: z.optional(z.unknown()),
});

export type GET_EXCHANGE_INFO = z.infer<typeof GET_EXCHANGE_INFO>;
