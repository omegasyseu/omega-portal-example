import { describe, expect, it } from "vitest";
import { blocksSchema } from "@/server/STRAPI/strapi-blocks.ts";

describe("blocksSchema", () => {
	it("reads headings, paragraphs with links and nested lists", () => {
		const body = [
			{
				type: "heading",
				level: 2,
				children: [{ type: "text", text: "Help", bold: true }],
			},
			{
				type: "paragraph",
				children: [
					{ type: "text", text: "Visit " },
					{
						type: "link",
						url: "https://www.begambleaware.org",
						children: [{ type: "text", text: "BeGambleAware" }],
					},
				],
			},
			{
				type: "list",
				format: "ordered",
				children: [
					{ type: "list-item", children: [{ type: "text", text: "One" }] },
					{
						type: "list",
						format: "unordered",
						children: [
							{ type: "list-item", children: [{ type: "text", text: "1a" }] },
						],
					},
				],
			},
		];
		expect(blocksSchema.parse(body)).toEqual(body);
	});

	it("reads a node it doesn't draw, or a malformed one, as unsupported instead of failing", () => {
		expect(
			blocksSchema.parse([
				{ type: "image", image: { url: "/uploads/a.png" } },
				{ type: "heading", level: 9, children: [] },
				{
					type: "paragraph",
					children: [{ type: "mention", id: 3 }],
				},
			]),
		).toEqual([
			{ type: "unsupported" },
			{ type: "unsupported" },
			{ type: "paragraph", children: [{ type: "unsupported" }] },
		]);
	});
});
