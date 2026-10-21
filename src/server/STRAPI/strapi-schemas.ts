import { z } from "zod";
import { blocksSchema } from "@/server/STRAPI/strapi-blocks.ts";

// A Brand and a Game as Strapi's public API returns them (Strapi 5, flat responses). Only
// published content comes back, so a relation whose entries are all unpublished arrives
// empty or missing; those are read as empty here rather than failing the whole portal.

const mediaSchema = z.object({ url: z.string() });

export const gameSchema = z.object({
	provider: z.string(),
	gameId: z.string(),
	title: z.string(),
	category: z.string().nullish(),
	tile: mediaSchema.nullish(),
});

const bannerSchema = z.object({
	title: z.string(),
	buttonText: z.string(),
	// A portal path ("/leaderboard") or a dialog ("dialog:jackpot").
	link: z.string(),
	image: mediaSchema.nullish(),
});

// One of the Brand's Collections. An unpublished Collection arrives as null. Its games
// come as keys ("PROVIDER:gameId") that the portal finds in the lobby.
const brandCollectionSchema = z.object({
	collection: z
		.object({ name: z.string(), slug: z.string(), icon: z.string().nullish() })
		.nullish(),
	games: z.array(z.object({ key: z.string().nullish() })).nullish(),
});

// The Brand's setting for one Payment Method: shown for deposits and for withdrawals,
// under the Brand's own name and logo when it gives them. An unpublished Payment Method
// arrives as null.
const brandPaymentMethodSchema = z.object({
	deposit: z.boolean(),
	withdrawal: z.boolean(),
	name: z.string().nullish(),
	logo: mediaSchema.nullish(),
	paymentMethod: z
		.object({ code: z.string(), name: z.string(), logo: mediaSchema.nullish() })
		.nullish(),
});

// One of the Brand's Legal Pages. Strapi allows only the five pages' slugs; one the
// portal doesn't know is ignored rather than failing the Brand, and so is one that
// arrives malformed.
const legalPageSchema = z.object({
	page: z.string(),
	title: z.string(),
	body: blocksSchema,
	// A date ("2026-10-20"), when the editor gives one.
	updatedOn: z.string().nullish(),
});

export const brandSchema = z.object({
	brandId: z.number(),
	name: z.string(),
	// DARK or LIGHT; anything else is read as the Dark Theme.
	theme: z.string().nullish(),
	logo: mediaSchema.nullish(),
	// List order is display order.
	banners: z.array(bannerSchema).nullish(),
	// Relation order is lobby order, as arranged in the admin panel.
	lobby: z.array(gameSchema).nullish(),
	// List order is the order of the menu's links and the Games page's tabs.
	collections: z.array(brandCollectionSchema).nullish(),
	// List order doesn't matter: IPS orders the methods.
	paymentMethods: z.array(brandPaymentMethodSchema).nullish(),
	// Missing on a Strapi from before Legal Pages. List order doesn't matter.
	legalPages: z
		.array(
			legalPageSchema.nullable().catch(({ error }) => {
				console.warn("Skipped a malformed Legal Page", error);
				return null;
			}),
		)
		.transform((pages) => pages.filter((page) => page !== null))
		.nullish(),
	// The Brand's Feature visibility switches, one per Engage Feature. Null on a Brand that
	// never saved them, which shows them all (shownEngageFeatures). Strapi stores them as
	// JSON it doesn't check, so a malformed value reads as unset rather than failing the Brand.
	featureVisibility: z
		.object({
			jackpot: z.boolean().nullish(),
			challenge: z.boolean().nullish(),
			levelUp: z.boolean().nullish(),
			quest: z.boolean().nullish(),
			leaderboard: z.boolean().nullish(),
		})
		.nullish()
		.catch(({ error }) => {
			console.warn("Ignored malformed Feature visibility", error);
			return null;
		}),
});

export type StrapiBrand = z.infer<typeof brandSchema>;

export type StrapiLegalPage = z.infer<typeof legalPageSchema>;

export type StrapiGame = z.infer<typeof gameSchema>;
