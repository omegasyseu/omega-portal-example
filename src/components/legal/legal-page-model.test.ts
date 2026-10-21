import { describe, expect, it } from "vitest";
import {
	LEGAL_PAGES,
	legalLinkHref,
	legalPageFor,
} from "@/components/legal/legal-page-model.ts";
import { brandContentFor } from "@/providers/brand-content/brand-content.ts";
import type { StrapiBrand } from "@/server/STRAPI/strapi-schemas.ts";

const paragraph = (text: string) => ({
	type: "paragraph" as const,
	children: [{ type: "text" as const, text }],
});

const TERMS = {
	page: "terms",
	title: "Terms and Conditions",
	body: [paragraph("These terms are between you and Omega Wins.")],
	updatedOn: "2026-10-20",
};

const contentWith = (legalPages: StrapiBrand["legalPages"]) =>
	brandContentFor(
		{ brandId: 1, name: "Omega Wins", legalPages },
		"https://strapi.example.com",
	);

describe("legalPageFor", () => {
	it("gives the Brand's page for a slug it has filled in", () => {
		expect(legalPageFor(contentWith([TERMS]), "terms")).toEqual({
			kind: "page",
			page: TERMS,
		});
	});

	it("says a known page the Brand hasn't filled in is not available yet, under its usual title", () => {
		expect(legalPageFor(contentWith([TERMS]), "privacy")).toEqual({
			kind: "not-available",
			title: "Privacy Policy",
		});
	});

	it("says a page with an empty body is not available yet", () => {
		expect(
			legalPageFor(contentWith([{ ...TERMS, body: [] }]), "terms").kind,
		).toBe("not-available");
	});

	it("says every page is not available yet for a Brand Strapi has no Legal Pages for", () => {
		const content = brandContentFor(undefined, "https://strapi.example.com");
		expect(
			LEGAL_PAGES.map(({ slug }) => legalPageFor(content, slug).kind),
		).toEqual(Array(5).fill("not-available"));
	});

	it("finds no page for a slug that isn't one of the five, even if Strapi has it", () => {
		const content = contentWith([{ ...TERMS, page: "cookies" }]);
		expect(legalPageFor(content, "cookies")).toEqual({ kind: "not-found" });
		expect(legalPageFor(content, "toString")).toEqual({ kind: "not-found" });
	});

	it("lists the five Legal Pages in the footer's order", () => {
		expect(LEGAL_PAGES.map(({ slug }) => slug)).toEqual([
			"gaming-rules",
			"player-protection",
			"terms",
			"privacy",
			"complaints",
		]);
	});
});

describe("legalLinkHref", () => {
	it("keeps web, email and phone links and portal paths", () => {
		expect(legalLinkHref("https://www.begambleaware.org")).toBe(
			"https://www.begambleaware.org",
		);
		expect(legalLinkHref("mailto:support@omegasys.eu")).toBe(
			"mailto:support@omegasys.eu",
		);
		expect(legalLinkHref("tel:+35699999999")).toBe("tel:+35699999999");
		expect(legalLinkHref("/responsible-gaming")).toBe("/responsible-gaming");
	});

	it("drops links that would run script or leave the portal through a path", () => {
		expect(legalLinkHref("javascript:alert(1)")).toBeUndefined();
		expect(legalLinkHref(" JavaScript:alert(1)")).toBeUndefined();
		expect(legalLinkHref("data:text/html,<script>")).toBeUndefined();
		expect(legalLinkHref("//evil.example.com")).toBeUndefined();
		expect(legalLinkHref("not a url")).toBeUndefined();
	});
});
