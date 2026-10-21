import { useShownIpsBrand } from "@/components/brand/use-selected-brand.ts";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";

// The name the Brand on screen goes by: Strapi's, else IPS's for a Brand with no content in
// Strapi, else none while IPS's brands are still unknown.
export const useBrandName = (): string | undefined => {
	const { name } = useBrandContent();
	const ipsName = useShownIpsBrand()?.name;
	return name ?? ipsName;
};
