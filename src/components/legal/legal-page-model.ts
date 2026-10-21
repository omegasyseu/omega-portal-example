import {
	type BrandContent,
	PORTAL_PATH,
} from "@/providers/brand-content/brand-content.ts";
import type { StrapiLegalPage } from "@/server/STRAPI/strapi-schemas.ts";

// The five Legal Pages every Brand publishes, in the footer's order, each with the title
// it goes by until the Brand fills it in. The slugs are the pages' paths (/legal/$page)
// and are listed twice more, in strapi/src/components/brand/legal-page.json's page
// enumeration and strapi/src/seed-data.ts's LEGAL_PAGES; change all three together.
export const LEGAL_PAGES = [
	{ slug: "gaming-rules", title: "Gaming Rules" },
	{ slug: "player-protection", title: "Player Protection Information" },
	{ slug: "terms", title: "Terms and Conditions" },
	{ slug: "privacy", title: "Privacy Policy" },
	{ slug: "complaints", title: "Complaints and Contact" },
] as const;

export type LegalPageSlug = (typeof LEGAL_PAGES)[number]["slug"];

export type LegalPageResult =
	| { kind: "page"; page: StrapiLegalPage }
	| { kind: "not-available"; title: string }
	| { kind: "not-found" };

export type ShownLegalPage = Exclude<LegalPageResult, { kind: "not-found" }>;

// What /legal/$page shows for the Selected Brand: its page, "not available yet" for one
// of the five it hasn't filled in (no entry, or an empty body), or not-found for any
// other slug. One of the five is never not-found.
export function legalPageFor(
	content: BrandContent,
	slug: LegalPageSlug,
): ShownLegalPage;
export function legalPageFor(
	content: BrandContent,
	slug: string,
): LegalPageResult;
export function legalPageFor(
	content: BrandContent,
	slug: string,
): LegalPageResult {
	const known = LEGAL_PAGES.find((page) => page.slug === slug);
	if (!known) return { kind: "not-found" };
	const page = content.legalPages.find(
		(entry) => entry.page === slug && entry.body.length > 0,
	);
	return page
		? { kind: "page", page }
		: { kind: "not-available", title: known.title };
}

const LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

// Where a link in a Legal Page's body may go: a path on this portal, or a web, email or
// phone address. Undefined for anything else (such as javascript:), which is then drawn
// as plain text.
export const legalLinkHref = (url: string): string | undefined => {
	if (url.startsWith("/")) return PORTAL_PATH.test(url) ? url : undefined;
	if (!URL.canParse(url)) return undefined;
	return LINK_PROTOCOLS.includes(new URL(url).protocol) ? url : undefined;
};
