import { describe, expect, it } from "vitest";
import { brandSchema } from "@/server/STRAPI/strapi-schemas.ts";

const TERMS = {
	page: "terms",
	title: "Terms and Conditions",
	body: [
		{ type: "paragraph", children: [{ type: "text", text: "Play fair." }] },
	],
	updatedOn: null,
};

const brandWith = (legalPages: unknown[]) => ({
	brandId: 1,
	name: "OMEGA",
	legalPages,
});

describe("brandSchema", () => {
	it.each([
		["a null body", { ...TERMS, page: "privacy", body: null }],
		["a null title", { ...TERMS, page: "privacy", title: null }],
		["a null node", { ...TERMS, page: "privacy", body: [null] }],
		["a node without a type", { ...TERMS, page: "privacy", body: [{}] }],
		["no page at all", null],
	])(
		"drops a Legal Page with %s and keeps the Brand and its other pages",
		(_what, broken) => {
			const result = brandSchema.safeParse(brandWith([broken, TERMS]));

			expect(result.success).toBe(true);
			expect(result.data?.legalPages?.map(({ page }) => page)).toEqual([
				"terms",
			]);
		},
	);

	it("keeps a Brand's Feature visibility switches", () => {
		const featureVisibility = { jackpot: false, quest: true };

		expect(
			brandSchema.parse({ ...brandWith([]), featureVisibility })
				.featureVisibility,
		).toEqual(featureVisibility);
	});

	it("reads malformed Feature visibility as unset, so the Brand shows every Engage Feature", () => {
		const result = brandSchema.safeParse({
			...brandWith([]),
			featureVisibility: { jackpot: "no" },
		});

		expect(result.success).toBe(true);
		expect(result.data?.featureVisibility).toBeNull();
	});
});
