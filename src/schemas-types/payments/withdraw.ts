import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";
import { GET_EXCHANGE_INFO } from "@/schemas-types/payments/deposit.ts";

const methods = z
	.array(
		z
			.object({
				name: z.string(),
				code: z.string(),
				ussdTemplate: z.string(),
				baseUssdCode: z.string(),
				transferUssdTemplate: z.string(),
			})
			.optional(),
	)
	.optional();

const withdrawalMethods = z
	.array(
		z.object({
			code: z.string(),
			paymentMethod: z.string(),
			minimumWithdrawal: z.string(),
			maximumWithdrawal: z.string(),
			conversionRequired: z.boolean(),
			methods,
		}),
	)
	.optional();

export const MixedWithdrawalMethods = z
	.object({
		withdrawalMethods,
	})
	.merge(BASE_RESPONSE_SCHEMA)
	.optional();

export type MixedWithdrawalMethods = z.infer<typeof MixedWithdrawalMethods>;

// withdrawal limits

export const withdrawalLimits = z
	.object({
		status: z.string(),
		minWithdrawal: z.string(),
		minWithdrawalNumber: z.number(),
		maxWithdrawal: z.string(),
		maxWithdrawalNumber: z.number(),
		currency: z.string(),
	})
	.merge(BASE_RESPONSE_SCHEMA)
	.optional();

export const withdrawResponse = z
	.object({
		paymentId: z.string(),
	})
	.merge(BASE_RESPONSE_SCHEMA)
	.optional();

export const prepareDepositMethods = z.array(
	z
		.object({
			code: z.string(),
			paymentMethod: z.string(),
			minimumWithdrawal: z.string(),
			maximumWithdrawal: z.string(),
			conversionRequired: z.boolean(),
			methods: z.array(z.unknown()),
		})
		.optional(),
);

export const prepareDeposits =
	GET_EXCHANGE_INFO.merge(BASE_RESPONSE_SCHEMA).optional();
