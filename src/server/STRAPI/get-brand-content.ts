import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	type BrandContent,
	brandContentFor,
} from "@/providers/brand-content/brand-content.ts";
import { getStrapiUrl } from "@/server/config.ts";
import {
	fetchStrapiOne,
	strapiQueryOptions,
} from "@/server/STRAPI/strapi-client.ts";
import { brandSchema } from "@/server/STRAPI/strapi-schemas.ts";

// A Collection's games come as keys only: the lobby already holds the games themselves.
const BRAND_POPULATE =
	"populate[logo]=true&populate[banners][populate][image]=true&populate[lobby][populate][tile]=true" +
	"&populate[collections][populate][collection]=true&populate[collections][populate][games][fields][0]=key" +
	"&populate[paymentMethods][populate][logo]=true&populate[paymentMethods][populate][paymentMethod][populate][logo]=true" +
	"&populate[legalPages]=true";

// An IPS brand with the content Strapi publishes for it.
export type BrandWithContent = { brandId: string; content: BrandContent };

// The published Brand linked to an IPS brand; a Brand Strapi has none for gets the
// content of a Brand without content.
const fetchBrandContent = async (
	brandId: string,
	signal: AbortSignal,
): Promise<BrandWithContent> => {
	const brand = await fetchStrapiOne(
		`/api/brands?filters[brandId][$eq]=${encodeURIComponent(brandId)}&${BRAND_POPULATE}`,
		brandSchema,
		signal,
	);
	return { brandId, content: brandContentFor(brand, getStrapiUrl()) };
};

// A Brand's content from Strapi: its Brand Theme, logo, banners, lobby, Collections and
// Payment Method settings and Legal Pages.
// Waits while the Brand isn't known yet (IPS's brands still loading). While a newly
// selected Brand loads, it keeps the previous Brand's, marked as placeholder data.
export const useBrandContentQuery = (brandId: string | undefined) =>
	useQuery({
		...strapiQueryOptions("brand-content", brandId, fetchBrandContent),
		placeholderData: keepPreviousData,
	});
