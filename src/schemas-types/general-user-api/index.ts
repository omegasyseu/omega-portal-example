import { z } from "zod";
import { BASE_RESPONSE_SCHEMA } from "@/schemas-types/base-responses";

const BrandsResponse = z.object({
	brands: z.array(
		z.object({
			id: z.number(),
			name: z.string(),
			isSocialBrand: z.boolean(),
			socialType: z.string(),
			socialCurrency: z.object({
				virtual: z.record(z.string(), z.object({ redeemable: z.boolean() })),
				real: z.record(z.string(), z.object({ redeemable: z.boolean() })),
				purchaseCurrencies: z.array(z.string()),
				repurchaseCurrencies: z.array(z.string()),
			}),
		}),
	),
});
export const getBrandsResponse =
	BASE_RESPONSE_SCHEMA.merge(BrandsResponse).optional();

export type GetBrandsResponse = z.infer<typeof getBrandsResponse>;

export const userCountry = z.object({
	status: z.string(),
	countryInfo: z.object({
		name: z.string(),
		iso2Code: z.string(),
		phonePrefix: z.string(),
	}),
	currency: z.object({
		isoCode: z.string(),
		name: z.string(),
		numericCode: z.null(),
		symbol: z.string(),
		isDefault: z.null(),
		symbolCode: z.null(),
		symbolPosition: z.null(),
		numberDecimalPoint: z.null(),
		type: z.string(),
		refreshInterval: z.number(),
		alertThreshold: z.number(),
		stopThreshold: z.number(),
		isRedeemable: z.null(),
	}),
	city: z.string(),
	provinceState: z.string(),
});

export type UserCountryType = z.infer<typeof userCountry>;

export const countriesResponseSchema = z.object({
	status: z.string(),
	countries: z.array(z.string()),
	countryDetails: z.array(
		z.object({
			code: z.string(),
			provState: z.array(z.object({ type: z.string(), value: z.string() })),
		}),
	),
});

const consents = z.array(
	z
		.object({
			id: z.number(),
			key: z.string(),
			name: z.string(),
			isMandatory: z.boolean(),
			parentKey: z.unknown(),
			version: z.number(),
			consentVersionId: z.number(),
		})
		.optional(),
);
export type consents = z.infer<typeof consents>;
export const getConsentsResponseSchema = z.object({
	consents: consents.optional(),
});
