import {
	DIALOG_FEATURE,
	isLinkToHiddenFeature,
	type ShownEngageFeatures,
	shownEngageFeatures,
} from "@/components/engage/engage-features.ts";
import type { EngageDialog } from "@/components/engage-dialog/engage-dialog.ts";
import {
	COLLECTION_ICONS,
	type CollectionIcon,
	type GameCollection,
	gameKey,
	type LobbyGame,
} from "@/components/games/lobby-model.ts";
import {
	type BrandTheme,
	brandThemeFor,
} from "@/providers/mantine-theme/brand-themes.ts";
import type {
	StrapiBrand,
	StrapiGame,
	StrapiLegalPage,
} from "@/server/STRAPI/strapi-schemas.ts";

// The dialogs a banner may open: "jackpot" for now, as Strapi's banner link rule allows
// (strapi/src/components/brand/banner.json).
const BANNER_DIALOGS = ["jackpot"] as const satisfies readonly EngageDialog[];

export type BannerDialog = (typeof BANNER_DIALOGS)[number];

export type BannerLink =
	| { kind: "page"; to: string }
	| { kind: "dialog"; dialog: BannerDialog };

export type BrandBanner = {
	title: string;
	buttonText: string;
	link: BannerLink;
	imageUrl: string | undefined;
};

// How a Brand shows one Payment Method, if IPS offers it to the player.
export type PaymentMethodSetting = {
	deposit: boolean;
	withdrawal: boolean;
	name: string;
	// Undefined when neither the Brand nor the Payment Method has a logo.
	logoUrl: string | undefined;
};

// A Brand's Payment Method settings by IPS's method code.
export type PaymentMethodSettings = ReadonlyMap<string, PaymentMethodSetting>;

// What the portal shows for a Brand, read from its published content in Strapi. Kept
// free of React so the rules can be tested on their own.
export type BrandContent = {
	// Undefined when the Brand has no content in Strapi.
	name: string | undefined;
	theme: BrandTheme;
	logoUrl: string | undefined;
	banners: BrandBanner[];
	lobby: LobbyGame[];
	// The Collections the Brand shows, in order, each holding games from the lobby.
	collections: GameCollection[];
	paymentMethods: PaymentMethodSettings;
	// As Strapi gives them; legalPageFor reads one (legal-page-model.ts).
	legalPages: StrapiLegalPage[];
	// Which Engage Features the Brand shows; a hidden one gets no way in on its pages.
	engageFeatures: ShownEngageFeatures;
};

type Media = { url: string } | null | undefined;

// Strapi's own uploads come back as paths on Strapi ("/uploads/..."); other upload
// providers give full addresses, which are kept.
const mediaUrl = (media: Media, strapiUrl: string): string | undefined => {
	if (!media) return undefined;
	const isPathOnStrapi =
		media.url.startsWith("/") && !media.url.startsWith("//");
	return isPathOnStrapi ? `${strapiUrl}${media.url}` : media.url;
};

const DIALOG_PREFIX = "dialog:";

// A path on this portal: one leading slash, never "//" or "/\", which browsers read as
// another site, and no whitespace. Strapi checks the same rule when the link is saved
// (strapi/src/components/brand/banner.json); change both together.
export const PORTAL_PATH = /^\/(?![/\\])\S*$/;

const isBannerDialog = (name: string): name is BannerDialog =>
	(BANNER_DIALOGS as readonly string[]).includes(name);

// Undefined when the link leads anywhere else, or into a Hidden Engage Feature, which
// drops the banner.
const bannerLink = (
	link: string,
	shown: ShownEngageFeatures,
): BannerLink | undefined => {
	if (link.startsWith(DIALOG_PREFIX)) {
		const dialog = link.slice(DIALOG_PREFIX.length);
		return isBannerDialog(dialog) && shown[DIALOG_FEATURE[dialog]]
			? { kind: "dialog", dialog }
			: undefined;
	}
	return PORTAL_PATH.test(link) && !isLinkToHiddenFeature(link, shown)
		? { kind: "page", to: link }
		: undefined;
};

type StrapiBanner = NonNullable<StrapiBrand["banners"]>[number];

const brandBanners = (
	banners: StrapiBanner[],
	strapiUrl: string,
	shown: ShownEngageFeatures,
): BrandBanner[] =>
	banners.flatMap(({ title, buttonText, link, image }) => {
		const resolved = bannerLink(link, shown);
		return resolved
			? [
					{
						title,
						buttonText,
						link: resolved,
						imageUrl: mediaUrl(image, strapiUrl),
					},
				]
			: [];
	});

// A game from a Brand's lobby, or one looked up on its own for a direct link.
export const lobbyGameFor = (
	game: StrapiGame,
	strapiUrl: string,
): LobbyGame => ({
	gameProvider: game.provider,
	gameId: game.gameId,
	title: game.title,
	category: game.category ?? undefined,
	image: mediaUrl(game.tile, strapiUrl) ?? "",
});

const DEFAULT_COLLECTION_ICON: CollectionIcon = "dice";

const isCollectionIcon = (icon: string): icon is CollectionIcon =>
	(COLLECTION_ICONS as readonly string[]).includes(icon);

type StrapiBrandCollection = NonNullable<StrapiBrand["collections"]>[number];

// Strapi refuses a Collection game the lobby doesn't list, and any that slips through is
// dropped here too, so a Collection only ever holds lobby games. An unpublished
// Collection is dropped; an icon this portal can't draw is drawn as the dice.
const brandCollections = (
	entries: StrapiBrandCollection[],
	lobby: LobbyGame[],
): GameCollection[] => {
	const lobbyByKey = new Map(lobby.map((game) => [gameKey(game), game]));
	return entries.flatMap(({ collection, games }) => {
		if (!collection) return [];
		const icon = collection.icon ?? DEFAULT_COLLECTION_ICON;
		return [
			{
				slug: collection.slug,
				name: collection.name,
				icon: isCollectionIcon(icon) ? icon : DEFAULT_COLLECTION_ICON,
				games: (games ?? []).flatMap(({ key }) => {
					const game = key ? lobbyByKey.get(key) : undefined;
					return game ? [game] : [];
				}),
			},
		];
	});
};

type StrapiBrandPaymentMethod = NonNullable<
	StrapiBrand["paymentMethods"]
>[number];

// The Brand's own name and logo win over the Payment Method's. A setting whose Payment
// Method isn't published is ignored, so the method stays hidden.
const brandPaymentMethods = (
	entries: StrapiBrandPaymentMethod[],
	strapiUrl: string,
): PaymentMethodSettings =>
	new Map(
		entries.flatMap(({ deposit, withdrawal, name, logo, paymentMethod }) => {
			if (!paymentMethod) return [];
			const setting: PaymentMethodSetting = {
				deposit,
				withdrawal,
				name: name || paymentMethod.name,
				logoUrl: mediaUrl(logo ?? paymentMethod.logo, strapiUrl),
			};
			return [[paymentMethod.code, setting] as const];
		}),
	);

export const brandContentFor = (
	brand: StrapiBrand | undefined,
	strapiUrl: string,
): BrandContent => {
	const lobby = (brand?.lobby ?? []).map((game) =>
		lobbyGameFor(game, strapiUrl),
	);
	const engageFeatures = shownEngageFeatures(brand);
	return {
		name: brand?.name,
		theme: brandThemeFor(brand?.theme ?? undefined),
		logoUrl: mediaUrl(brand?.logo, strapiUrl),
		banners: brandBanners(brand?.banners ?? [], strapiUrl, engageFeatures),
		lobby,
		collections: brandCollections(brand?.collections ?? [], lobby),
		paymentMethods: brandPaymentMethods(brand?.paymentMethods ?? [], strapiUrl),
		legalPages: brand?.legalPages ?? [],
		engageFeatures,
	};
};
