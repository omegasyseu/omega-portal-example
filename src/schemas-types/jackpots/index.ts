import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";

const TierData = z.object({
	name: z.string(),
});

// The AMS feed leaves minutesRemaining out while burst mode is off.
const BurstMode = z.object({
	active: z.boolean(),
	minutesRemaining: z.number().optional(),
});

export const JackpotData = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	tiers: z.array(TierData),
	baseCurrency: z.string(),
	optIn: z.boolean(),
	burstMode: BurstMode.optional(),
});

const TierDataFeed = z.object({
	name: z.string(),
	value: z.number(),
	lastWon: z.string().optional(),
});

export const JackpotDataFeed = z.object({
	baseCurrency: z.string(),
	brandId: z.number(),
	icon: z.string().optional(),
	id: z.string(),
	name: z.string(),
	tiers: z.array(TierDataFeed),
	burstMode: BurstMode.optional(),
});

export const EligibleJackpotsResponse = z
	.object({
		data: z.array(JackpotData).optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

export type JackpotDataFeedType = z.infer<typeof JackpotDataFeed>;
export type BurstModeType = z.infer<typeof BurstMode>;
