import { MantineProvider } from "@mantine/core";
import { createContext, type ReactNode, use, useEffect, useMemo } from "react";
import type { SelectedBrandState } from "@/components/brand/selected-brand.ts";
import { LoadErrorMessage } from "@/components/not-found/page-load-error.tsx";
import type { BrandContent } from "@/providers/brand-content/brand-content.ts";
import classes from "@/providers/brand-content/brand-loading-bar.module.css";
import {
	applyBrandTheme,
	type BrandTheme,
	brandThemeFor,
} from "@/providers/mantine-theme/brand-themes.ts";
import {
	cssVariablesResolver,
	mantineThemeFor,
} from "@/providers/mantine-theme/default.ts";
import {
	type BrandWithContent,
	useBrandContentQuery,
} from "@/server/STRAPI/get-brand-content.ts";

const ShownBrandContext = createContext<BrandWithContent | undefined>(
	undefined,
);

const useShownBrand = (): BrandWithContent => {
	const shown = use(ShownBrandContext);
	if (!shown) {
		throw new Error("Used outside BrandContentProvider");
	}
	return shown;
};

// The content of the Brand on screen. Only inside BrandContentProvider, which renders its
// children once the content has loaded.
export const useBrandContent = (): BrandContent => useShownBrand().content;

// The IPS id of the Brand on screen, always known inside BrandContentProvider. It is the
// Selected Brand, except while a newly picked Brand's content loads: then it stays the
// Brand still on screen, so requests match what the player sees.
export const useShownBrandId = (): string => useShownBrand().brandId;

const BrandMantineProvider = ({
	theme,
	children,
}: {
	theme: BrandTheme;
	children: ReactNode;
}) => {
	const mantineTheme = useMemo(() => mantineThemeFor(theme.palette), [theme]);
	useEffect(() => applyBrandTheme(theme), [theme]);

	return (
		<MantineProvider
			theme={mantineTheme}
			cssVariablesResolver={cssVariablesResolver}
			forceColorScheme={theme.colourMode.scheme}
		>
			{children}
		</MantineProvider>
	);
};

// A Brand without content gets the Dark Theme.
const NO_BRAND_THEME = brandThemeFor(undefined);

// No Brand to show (IPS's brands or Strapi can't be reached): the plain message, in the
// theme of a Brand without content, rather than a half-themed or wrong-brand portal.
const BrandContentError = () => (
	<BrandMantineProvider theme={NO_BRAND_THEME}>
		<LoadErrorMessage />
	</BrandMantineProvider>
);

type Props = {
	selected: SelectedBrandState;
	children: ReactNode;
};

// Draws the portal in the Selected Brand's theme. Nothing is drawn until its content has
// loaded, so the portal never shows in another Brand's theme. Picking another Brand
// keeps the current one on screen, with a loading bar in its theme, until the next
// Brand's content arrives; then the theme and the content change together.
export const BrandContentProvider = ({ selected, children }: Props) => {
	const {
		data: shown,
		error,
		isPlaceholderData,
	} = useBrandContentQuery(
		selected.status === "selected" ? selected.brandId : undefined,
	);
	const hasNoBrand = selected.status === "none";

	useEffect(() => {
		if (error) console.error("Brand content failed to load", error);
	}, [error]);

	useEffect(() => {
		if (hasNoBrand)
			console.error("No Brand to show: IPS /getBrands failed or listed none");
	}, [hasNoBrand]);

	if (hasNoBrand) return <BrandContentError />;
	// A refetch that fails keeps showing the content already loaded. A newly picked
	// Brand whose content fails shows the plain message, like a first load.
	if (!shown) return error ? <BrandContentError /> : null;

	return (
		<ShownBrandContext value={shown}>
			<BrandMantineProvider theme={shown.content.theme}>
				{isPlaceholderData ? (
					<div
						className={classes.bar}
						role="progressbar"
						aria-label="Loading the Brand"
					/>
				) : null}
				{children}
			</BrandMantineProvider>
		</ShownBrandContext>
	);
};
