import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";
import { BadgeInformation } from "@/schemas-types/challenger";

export const LevelUpRangeData = z.object({
	awardAmount: z.number(),
	challengeTypeUUID: z.string(),
	currency: z.string(),
	fromLevel: z.number(),
	minWager: z.number(),
	percentage: z.number(),
	status: z.string(),
	target: z.string(),
	toLevel: z.number(),
});

export const ItemAvailability = z.object({
	playerCanPurchase: z.number(),
	playerMaxAllowed: z.number(),
	playerPurchased: z.number(),
	remainingGlobal: z.number(),
	soldOut: z.boolean(),
	totalQuantity: z.number(),
});

export const QuestItem = z.object({
	amount: z.number(),
	availability: ItemAvailability,
	awardType: z.string(),
	configurationId: z.string(),
	configurationTypeId: z.string(),
	description: z.string(),
	id: z.string(),
	level: z.number(),
	playerPurchaseCount: z.number(),
	price: z.number(),
	type: z.string(),
});

export const QuestLevel = z.object({
	accessible: z.boolean(),
	itemCount: z.number(),
	items: z.array(QuestItem),
	level: z.number(),
	purchasedCount: z.number(),
});

export const RedeemAwardsSchema = z
	.array(
		z
			.object({
				awardType: z.string(),
				awardValue: z.string(),
				currency: z.string(),
				status: z.string(),
				creationDate: z.string(),
				redemptionBy: z.string(),
				level: z.number(),
				redemptionDate: z.string(),
				rounds: z.number(),
				roundAmount: z.number(),
			})
			.optional(),
	)
	.optional();

export const ClaimableAwardsSchema = z
	.array(
		z
			.object({
				awardType: z.string(),
				awardValue: z.string(),
				currency: z.string(),
				status: z.string(),
				creationDate: z.string(),
				redemptionBy: z.string(),
				level: z.number(),
			})
			.optional(),
	)
	.optional();

const QuestPointHistorySchema = z.object({
	level: z.number(),
	awardType: z.string(),
	awardValue: z.string(),
	redemptionDate: z.string(),
	creationDate: z.string().optional(),
});

export const LevelupData = z.object({
	awardAmount: z.number(),
	awardType: z.string(),
	configurationId: z.string(),
	currency: z.string(),
	currentLevel: z.number(),
	endDate: z.string(),
	featureType: z.string(),
	levels: z.array(QuestLevel),
	questPointBalance: z.number(),
	maxLevel: z.number(),
	minWager: z.number(),
	percentage: z.number(),
	periodType: z.string(),
	progress: z.number(),
	specification: z.string(),
	startDate: z.string(),
	status: z.string(),
	target: z.string(),
	title: z.string(),
	type: z.string(),
	// Keep old fields as optional for backward compatibility during migration
	imageBaseURL: z.string().optional(),
	badge: z.union([z.string(), BadgeInformation]).optional(),
	challengeUUID: z.string().optional(),
	icon: z.union([z.string(), BadgeInformation]).optional(),
	challengeTypes: z.array(LevelUpRangeData).optional(),
	levelUpUUID: z.string().optional(),
	redeemedAwards: RedeemAwardsSchema.optional(),
	claimableAwards: ClaimableAwardsSchema.optional(),
	questPointBalanceHistory: z.array(QuestPointHistorySchema).optional(),
});

export type ItemAvailabilityType = z.infer<typeof ItemAvailability>;
export type QuestItemType = z.infer<typeof QuestItem>;
export type QuestLevelType = z.infer<typeof QuestLevel>;
export type LevelUpDataType = z.infer<typeof LevelupData>;

export const LevelUpResponse = z
	.object({
		data: z.array(LevelupData).optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);
