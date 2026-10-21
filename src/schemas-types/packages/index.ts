import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";

export const PackageCurrencySchema = z.object({
	currency: z.string(),
	bonusCoin: z.number().nullable(),
	realCoin: z.number().nullable(),
	freePlay: z.number().nullable(),
});
export type PackageCurrencyType = z.infer<typeof PackageCurrencySchema>;

export const PackageSchema = z
	.object({
		packageId: z.number(),
		brandId: z.number(),
		triggerType: z.string(),
		purchasePrice: z.number(),
		purchaseCurrency: z.string(),
		bonusPlanId: z.number(),
		currencies: z.array(PackageCurrencySchema).optional(),
		brandName: z.string(),
		startDate: z.string(),
		endDate: z.string(),
		expiryDays: z.number(),
		priority: z.number(),
		status: z.string(),
		name: z.string(),
		description: z.string(),
		imageUrl: z.unknown(),
		packageCode: z.unknown(),
		maxTriggerPlayer: z.unknown(),
		maxTriggerAll: z.unknown(),
		redeemableCoinIsPlayable: z.boolean(),
		redeemableCoinAwardType: z.string(),
		redeemableCoinMultiplier: z.string(),
		redeemableCoinWagerReq: z.number(),
		redeemableCoinWagerRequirementAction: z.string(),
		purchaseMethods: z.string(),
	})
	.optional();
export type PackageType = z.infer<typeof PackageSchema>;

export const PackageResponseSchema = z
	.object({
		data: z.array(PackageSchema).optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);
