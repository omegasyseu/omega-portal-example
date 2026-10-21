import { z } from "zod";
import { email } from "@/schemas-types/auth/general";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";

const referralLinks = z
	.array(
		z.object({
			referralCode: z.string(),
			referralLink: z.string(),
		}),
	)
	.optional();

export const getReferraLinksSchema = z
	.object({
		referralLinks: referralLinks,
	})
	.merge(BASE_RESPONSE_SCHEMA);

const referee = z.object({
	depositAmountPassed: z.boolean(),
	// IPS leaves the key out until the referee has a KYC status
	kycStatus: z.string().optional(),
	kycpassed: z.boolean(),
	lockedStatus: z.string(),
	lockedStatusPassed: z.boolean(),
	partyId: z.number(),
	referDate: z.string(),
	referEmail: z.string(),
	referralRewardStatus: z.string(),
	referralRewarded: z.boolean(),
	regDate: z.string(),
	regEmail: z.string(),
	regStatus: z.string(),
	userId: z.string(),
});

const referees = z.array(referee).optional();
export type Referee = z.infer<typeof referee>;
export type Referees = z.infer<typeof referees>;

export const getRefereesSchema = z
	.object({
		referees: referees,
	})
	.merge(BASE_RESPONSE_SCHEMA);

export const referFriendSchema = z
	.object({
		sessionKey: z.string(),
		notificationTarget: z.string().optional(),
		emails: z.string().optional(),
		phones: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.notificationTarget === "EMAIL") {
				return data.emails && data.emails.length > 0; // Ensure emails is not empty
			}
			if (
				data.notificationTarget === "SMS" ||
				data.notificationTarget === "WHATSAPP"
			) {
				return data.phones && data.phones.length > 0; // Ensure phones is not empty
			}
			return true;
		},
		{
			message: "Required field missing based on the notification target",
		},
	);

export type ReferFriendSchema = z.infer<typeof referFriendSchema>;

export const referFriendFormData = z.object({
	notificationTarget: z.string().optional(),
	emails: z
		.array(z.object({ email: email.or(z.literal("")) }))
		.refine((emails) => emails.some((emailObj) => emailObj.email !== ""), {
			message: "At least one valid email is required",
		}),
});

export type ReferFriendFormData = z.infer<typeof referFriendFormData>;
