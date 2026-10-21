import {
	saveBrandId,
	useSavedBrandId,
} from "@/components/brand/saved-brand.ts";
import {
	selectedBrand,
	selectedBrandState,
} from "@/components/brand/selected-brand.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useShownBrandId } from "@/providers/brand-content/brand-content-provider.tsx";
import { useGetIpsBrands } from "@/server/IPS/general/get-ips-brands.ts";

// The Selected Brand (selected-brand.ts) from IPS's brands, the visitor's saved choice and
// the signed-in player's Brand, with the brands the switcher lists. The Brand id is
// undefined until IPS's brands load, and when IPS lists none or can't be reached; `state`
// says which.
export const useSelectedBrand = () => {
	const { data, isPending } = useGetIpsBrands();
	const { session } = useSession();
	const savedBrandId = useSavedBrandId();
	const brands = data?.res?.brands ?? [];

	const selected = selectedBrand({
		brands,
		savedBrandId,
		player: session?.user
			? { brandId: session.user.loggedInBrand?.id?.toString() }
			: undefined,
	});

	return {
		brands,
		selectBrand: saveBrandId,
		...selected,
		state: selectedBrandState(selected.brandId, isPending),
	};
};

// The IPS brand of the Brand on screen (useShownBrandId), for its name and whether it is
// a social brand. Only inside BrandContentProvider.
export const useShownIpsBrand = () => {
	const brandId = useShownBrandId();
	const { data } = useGetIpsBrands();
	return data?.res?.brands?.find((brand) => String(brand.id) === brandId);
};
