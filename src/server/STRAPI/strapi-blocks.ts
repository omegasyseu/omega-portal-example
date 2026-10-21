import { z } from "zod";

// A Strapi Blocks rich-text body, as Strapi's public API returns it. Only the parts the
// portal draws are read. A node of another type, or one that doesn't have the expected
// shape, is read as "unsupported" and drawn as nothing, so one odd node never fails the
// whole Brand.

const unsupportedSchema = z
	.object({ type: z.string() })
	.transform(() => ({ type: "unsupported" as const }));

const textSchema = z.object({
	type: z.literal("text"),
	text: z.string(),
	bold: z.boolean().optional(),
	italic: z.boolean().optional(),
	underline: z.boolean().optional(),
	strikethrough: z.boolean().optional(),
	code: z.boolean().optional(),
});

const linkSchema = z.object({
	type: z.literal("link"),
	url: z.string(),
	children: z.array(textSchema),
});

const inlineSchema = z.union([textSchema, linkSchema, unsupportedSchema]);

const inlineChildren = z.array(inlineSchema);

export type BlocksText = z.infer<typeof textSchema>;

export type BlocksInline = z.infer<typeof inlineSchema>;

export type BlocksList = {
	type: "list";
	format: "ordered" | "unordered";
	children: (
		| { type: "list-item"; children: BlocksInline[] }
		| BlocksList
		| { type: "unsupported" }
	)[];
};

const listSchema: z.ZodType<BlocksList, unknown> = z.lazy(() =>
	z.object({
		type: z.literal("list"),
		format: z.enum(["ordered", "unordered"]),
		children: z.array(
			z.union([
				z.object({ type: z.literal("list-item"), children: inlineChildren }),
				listSchema,
				unsupportedSchema,
			]),
		),
	}),
);

export const blocksSchema = z.array(
	z.union([
		z.object({
			type: z.enum(["paragraph", "quote", "code"]),
			children: inlineChildren,
		}),
		z.object({
			type: z.literal("heading"),
			level: z.number().int().min(1).max(6),
			children: inlineChildren,
		}),
		listSchema,
		unsupportedSchema,
	]),
);

export type BlocksBody = z.infer<typeof blocksSchema>;

export type BlocksNode = BlocksBody[number];
