import { z } from "zod";
import { username } from "@/schemas-types/auth/general";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";
import { requiredError } from "@/schemas-types/required-error";

export const loginSchema = z.object({
	username: username,
	password: z
		.string({ error: requiredError("Password is required") })
		.min(6, {
			message: "Password must be at least 6 characters",
		})
		.max(16, {
			message: "Password must be at most 16 characters",
		}),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;

// API LOGIN SCHEMA

const LoginSchema = z.object({
	partyId: z.string(),
	username: z.string(),
	language: z.string(),
	currency: z.string(),
	email: z.string(),
	brandId: z.union([z.number(), z.string()]),
	sessionKey: z.string(),
	parentId: z.string(),
	level: z.string(),
	userType: z.string(),
	isFirstLogin: z.string(),
	registrationStatus: z.string(),
	pendingLimitConfirmation: z.string(),
	country: z.null(),
	kycStatus: z.string(),
	associateAccounts: z.array(
		z.object({
			partyId: z.number(),
			currency: z.string(),
			sessionKey: z.string(),
			isPrimary: z.boolean(),
		}),
	),
	responsibleGamingLimits: z.array(
		z.object({
			responsibleGamingLimitID: z.number(),
			partyID: z.number(),
			limitType: z.string(),
			periodType: z.string(),
			effectiveDate: z.string(),
			expiryDate: z.string(),
			limit: z.number(),
			limitUnit: z.string(),
			cumulatedValue: z.number(),
			lastCumulationDateTime: z.string(),
			creationDate: z.string(),
			lastUpdateDate: z.string(),
			status: z.string(),
		}),
	),
	lockStatus: z.string(),
	securityVerificationRequiredFields: z.array(z.string()),
	kycStatusDetails: z.object({
		expiryDate: z.string(),
		kycTypeStatus: z.array(z.unknown()),
	}),
});

export const MergedSchemas = LoginSchema.merge(BASE_RESPONSE_SCHEMA);
