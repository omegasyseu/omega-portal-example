import { z } from "zod";

export const CashbackBalances = z
	.object({
		partyId: z.number(),
		currency: z.string(),
		cashbackPlanId: z.number(),
		cashbackAvailable: z.number(),
		cashbackAwarded: z.number(),
		cashbackClaimed: z.number(),
		cashbackAccumulated: z.number(),
		cashbackExpired: z.number(),
		label: z.string().optional(),
		value: z.string().optional(),
		cashbackPlanName: z.string().optional(),
		cashbackPlanType: z.string().optional(),
		isPlayerRedeemable: z.boolean().optional(),
		redemptionTriggerType: z.string().optional(),
		cashbackPlayerAvailable: z.number().optional(),
		cashbackPendingAvailable: z.number().optional(),
		cashbackNotEligible: z.number().optional(),
		minimumClaimAmount: z.number().optional(),
		claimCount: z.number().optional(),
		handle: z.number().optional(),
		totalHandle: z.number().optional(),
		planStatus: z.string().optional(),
		limitPerPlayer: z.number().optional(),
		limitUsed: z.number().optional(),
	})
	.optional();

export const cashbackschema = z.object({
	currency: z.string().optional(),
	cashbackPlayerAvailable: z.number().optional(),
	cashbackAvailable: z.number().optional(),
	cashbackAwarded: z.number().optional(),
	cashbackClaimed: z.number().optional(),
	cashbackAccumulated: z.number().optional(),
	cashbackExpired: z.number().optional(),
	planBalances: z.array(CashbackBalances).optional(),
});

export type cashbackschemaType = z.infer<typeof cashbackschema>;
