import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "../base-responses";

export * from "./deposit";
export * from "./withdraw";

const paymentInformation = z.object({
	id: z.number(),
	partyId: z.number(),
	type: z.string(),
	paymentMethods: z.array(z.string()),
	description: z.string(),
	priority: z.number(),
	ccExpired: z.boolean(),
	details: z.array(z.unknown()),
	active: z.boolean(),
	detailsAsMap: z.record(z.string(), z.string()).optional(),
});

export const PaymentInformationResponse = z
	.object({ data: z.array(paymentInformation).optional() })
	.merge(BASE_RESPONSE_SCHEMA)
	.optional();

export type PaymentInformationResponse = z.infer<
	typeof PaymentInformationResponse
>;
export type PaymentInformation = z.infer<typeof paymentInformation>;

const recommendedPaymentMethod = z.object({
	paymentMethod: z.string(),
	subPaymentMethod: z.string(),
});

export const RecommendedPaymentMethodResponse = recommendedPaymentMethod
	.merge(BASE_RESPONSE_SCHEMA)
	.optional();
export type RecommendedPaymentMethodResponse = z.infer<
	typeof RecommendedPaymentMethodResponse
>;
