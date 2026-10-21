import { z } from "zod";

export const successSchemaSocial = z.object({
	status: z.literal("SUCCESS"),
	message: z.string().optional(),
	advices: z.array(z.unknown()).optional(),
	partyId: z.string(),
	username: z.string(),
	language: z.string(),
	currency: z.string(),
	email: z.string(),
	sessionKey: z.string(),
	parentId: z.string(),
	level: z.string(),
	userType: z.string(),
	isFirstLogin: z.string(),
	registrationStatus: z.union([
		z.literal("PLAYER"),
		z.literal("QUICK_OPEN"),
		z.literal("QUICK_REG"),
	]),
	pendingLimitConfirmation: z.string(),
	country: z.string(),
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
	kycStatusDetails: z.object({ kycTypeStatus: z.array(z.unknown()) }),
});

export const failedSchemaSocial = z.object({
	status: z.string().optional(),
	message: z.string().optional(),
	advices: z.array(z.unknown()).nullable().optional(),
	errors: z
		.array(z.object({ field: z.string(), error: z.string() }))
		.nullable(),
	additionalInfo: z
		.array(z.object({ key: z.string(), value: z.string() }))
		.nullable(),
});

export type ApiResponse = SuccessData | FailedData;
export type SuccessData = z.infer<typeof successSchemaSocial>;
export type FailedData = z.infer<typeof failedSchemaSocial>;
