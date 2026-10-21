// The Selected Brand: the Brand the whole portal shows, kept free of React and storage.

type Brand = { id: number };

type Input = {
	// IPS's brands in the order it lists them; empty until they load.
	brands: readonly Brand[];
	// The Brand the visitor last picked, as saved in the browser.
	savedBrandId: string | undefined;
	// The signed-in player, with their own Brand when the session knows it.
	player: { brandId: string | undefined } | undefined;
};

// A signed-in player stays in their own Brand, so the switcher is locked. A visitor keeps
// the Brand they saved while IPS still lists it, else the first Brand IPS lists. With a
// single Brand there is nothing to switch to.
export const selectedBrand = ({ brands, savedBrandId, player }: Input) => {
	const ids = brands.map((brand) => String(brand.id));
	return {
		brandId: player?.brandId ?? ids.find((id) => id === savedBrandId) ?? ids[0],
		isSwitcherShown: ids.length > 1,
		isSwitcherLocked: player !== undefined,
	};
};

// The Selected Brand as the portal draws it: its id, or why there is none yet. A signed-in
// player's Brand is known before IPS's brands load.
export type SelectedBrandState =
	| { status: "selected"; brandId: string }
	// IPS's brands are still loading.
	| { status: "loading" }
	// IPS lists no brand, or can't be reached.
	| { status: "none" };

export const selectedBrandState = (
	brandId: string | undefined,
	isLoadingBrands: boolean,
): SelectedBrandState => {
	if (brandId !== undefined) return { status: "selected", brandId };
	return isLoadingBrands ? { status: "loading" } : { status: "none" };
};
