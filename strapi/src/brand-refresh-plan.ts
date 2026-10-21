import type { IpsBrand } from './ips-brands.ts';
import { StarterContentError } from './seed-files.ts';

/**
 * A Brand in Strapi; a draft saved without its required fields may have no Brand ID or name
 * yet. It has Legal Pages when its draft or its published version lists any.
 */
export type StrapiBrand = { brandId: number | null; name: string | null; hasLegalPages: boolean };

/**
 * What "Refresh from IPS" does: add the IPS brands Strapi has no Brand for, give the seed's
 * Legal Pages to every named Brand that has none (in IPS or not), and report the ones
 * already there and the Brands IPS no longer lists. It changes nothing else of an existing
 * Brand, and never deletes one.
 */
export const refreshPlan = <Brand extends StrapiBrand>(ipsBrands: IpsBrand[], strapiBrands: Brand[]) => {
  const inStrapi = new Set(strapiBrands.map((brand) => brand.brandId));
  const inIps = new Set<number | null>(ipsBrands.map((brand) => brand.brandId));
  return {
    add: ipsBrands.filter((brand) => !inStrapi.has(brand.brandId)),
    // An unnamed draft waits for its name, which its pages are written in.
    giveLegalPages: strapiBrands.filter(
      (brand): brand is Brand & { name: string } => brand.name !== null && !brand.hasLegalPages,
    ),
    existing: strapiBrands.filter((brand) => inIps.has(brand.brandId)),
    notInIps: strapiBrands.filter((brand) => brand.brandId !== null && !inIps.has(brand.brandId)),
  };
};

/**
 * IPS's URL for Strapi itself: IPS_API, or in the portal image the portal's own
 * PORTAL_IPS_API, which its container already has. Without either it's a StarterContentError.
 */
export const ipsUrlFrom = (env: Record<string, string | undefined>): string => {
  const url = (env.IPS_API || env.PORTAL_IPS_API || '').replace(/\/+$/, '');
  if (!url) {
    throw new StarterContentError(
      "Strapi doesn't know IPS's URL. Set IPS_API in Strapi's environment (strapi/.env locally), e.g. IPS_API=https://ps.example.com/ps/ips; the portal image uses its PORTAL_IPS_API.",
    );
  }
  return url;
};
