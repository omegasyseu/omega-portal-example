import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";

export const BadgeInformation = z
	.object({
		imageURL: z.string().optional(),
		imageUUID: z.string().optional(),
		mimeType: z.string(),
		name: z.string(),
		type: z.string(),
	})
	.optional();

export const challengerData = z
	.object({
		awardAmount: z.number(),
		imageBaseURL: z.string(),
		badge: z.union([z.string(), BadgeInformation]),
		challengeUUID: z.string(),
		currency: z.string(),
		endDate: z.string(),
		icon: z.union([z.string(), BadgeInformation]),
		percentage: z.number(),
		progress: z.number(),
		specification: z.string(),
		status: z.string(),
		target: z.string(),
		title: z.string(),
		type: z.string(),
		minWager: z.string().or(z.number()),
	})
	.optional();
export const challengerResponse = z
	.object({
		data: z.array(challengerData).optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);

// BADGES

export const BadgesSchema = z.object({
	badgeUUID: z.string(),
	badgeUrl: z.string(),
	badgeDate: z.string(),
	challenge: z
		.object({
			badge: z.union([z.string(), BadgeInformation]),
			challengeUUID: z.string(),
			endDate: z.string(),
			icon: z.union([z.string(), BadgeInformation]),
			specification: z.string(),
			status: z.string().nullable(),
			target: z.string(),
			title: z.string(),
			type: z.string(),
		})
		.optional(),
});

export const GetBadgesResponse = z
	.object({
		count: z.number(),
		data: z
			.object({
				count: z.number().optional(),
				badges: z.array(BadgesSchema).optional(),
			})
			.optional(),
	})
	.merge(BASE_RESPONSE_SCHEMA);
