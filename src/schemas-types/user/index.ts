import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";

export const CurrencySchema = z.object({
	isoCode: z.string(),
	name: z.string(),
	numericCode: z.string().nullable(),
	symbol: z.string(),
	isDefault: z.boolean(),
	symbolCode: z.string(),
	symbolPosition: z.string().nullable(),
	numberDecimalPoint: z.number(),
	type: z.string(),
	refreshInterval: z.number(),
	alertThreshold: z.number(),
	stopThreshold: z.number(),
	isRedeemable: z.boolean(),
});

export const playerInformation = z.object({
	status: z.string(),
	firstName: z.string(),
	middleName: z.string(),
	lastName: z.string(),
	userId: z.string(),
	nickname: z.string(),
	title: z.null(),
	address: z.string().optional(),
	city: z.string().optional(),
	province: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().optional(),
	nationality: z.string().optional(),
	language: z.string(),
	phone: z.string().optional(),
	phoneCountryCode: z.null(),
	phoneLocalNumber: z.null(),
	phoneNeedsReview: z.boolean(),
	birthDate: z.string(),
	birthDateFormatted: z.string(),
	birthCity: z.null(),
	birthDepartment: z.null(),
	birthCountry: z.null(),
	regDate: z.string(),
	regDateFormatted: z.string(),
	email: z.string(),
	partyId: z.string(),
	mobilePhone: z.string(),
	mobileCountryCode: z.null(),
	mobileLocalNumber: z.null(),
	mobileNeedsReview: z.boolean(),
	currency: z.string(),
	currencies: z.record(z.string(), CurrencySchema),
	vipStatus: z.string(),
	// null until a KYC check has started
	kycStatus: z.string().nullable(),
	lastLogin: z.string(),
	lastLoginFormatted: z.string(),
	level: z.number(),
	parentId: z.null(),
	userType: z.number(),
	isAutopay: z.boolean(),
	registrationStatus: z.string(),
	sessionKey: z.string(),
	extraInfo: z.array(z.unknown()),
	gender: z.string(),
	contactPreference: z.string(),
	emailVerificationStatus: z.string(),
	verificationStatus: z.string(),
	verificationMethod: z.string(),
	mfaSystem: z.null(),
	docNumber: z.null(),
	taxId: z.null(),
	readonlyFields: z.string(),
	municipality: z.null(),
	accountNumber: z.null(),
	idCardNumber: z.null(),
	madeDeposit: z.boolean(),
	socialMedia: z.object({
		socialLoginPlatform: z.array(z.unknown()),
		hasPwdSetupAfterSocialSignup: z.null(),
	}),
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
	lockedStatus: z.string(),
	testPlayer: z.boolean(),
	loginTimeDurations: z.object({
		currentLoginTimeDurationMinutes: z.number(),
		dailyCumulativeLoginTimeDurationMinutes: z.number(),
		weeklyCumulativeLoginTimeDurationMinutes: z.number(),
		monthlyCumulativeLoginTimeDurationMinutes: z.number(),
	}),
	streetNumber: z.string().optional(),
	building: z.string().optional(),
	unit: z.string().optional(),
	floorNumber: z.string().optional(),
	tags: z.string().optional(),
});

export type PlayerInformation = z.infer<typeof playerInformation>;

// GAME-LAUCH

export const CurrenciesConversion = z.object({
	currencyConversions: z
		.array(
			z.object({
				playerCurrency: z.string(),
				gameCurrency: z.string(),
				currentRate: z.number(),
				playerCurrencyType: z.string(),
				gameCurrencyType: z.string(),
			}),
		)
		.optional(),
});

export const CurrencySelection =
	BASE_RESPONSE_SCHEMA.merge(CurrenciesConversion).optional();

export type CurrencySelection = z.infer<typeof CurrencySelection>;

// CASHB
