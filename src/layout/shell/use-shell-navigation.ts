import { useMemo } from "react";
import { buildNavigation } from "@/layout/shell/navigation-model.ts";
import { useSession } from "@/providers/authentication/authentication.tsx";
import { useBrandContent } from "@/providers/brand-content/brand-content-provider.tsx";

export const useShellNavigation = () => {
	const { session } = useSession();
	const isLoggedIn = Boolean(session?.user);
	// Only known from the session, so a logged-out visitor always sees real-money wording.
	const isSocialBrand = Boolean(session?.user?.loggedInBrand?.isSocialBrand);
	const { collections, engageFeatures } = useBrandContent();

	return useMemo(
		() => ({
			isLoggedIn,
			...buildNavigation({
				isLoggedIn,
				isSocialBrand,
				gameCollections: collections,
				engageFeatures,
			}),
		}),
		[isLoggedIn, isSocialBrand, collections, engageFeatures],
	);
};
