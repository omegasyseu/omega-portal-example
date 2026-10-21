import { z } from 'zod';

// The content manager's answers, as far as the Lobby editor reads them. lobby-api.ts checks
// each answer here as it arrives, so a changed Strapi fails with a clear error instead of
// a broken page later. Fields the editor doesn't read aren't checked, and are dropped.

const publicationStatus = z.enum(['draft', 'published', 'modified']);

const pageOf = <Item extends z.ZodType>(item: Item) =>
  z.object({ results: z.array(item), pagination: z.object({ pageCount: z.number().int().nonnegative() }) });

const media = z.object({
  url: z.string(),
  formats: z.object({ thumbnail: z.object({ url: z.string() }).optional() }).nullish(),
});

/**
 * Where the admin loads a tile from: its thumbnail, or the image itself. A file Strapi
 * stores itself has a relative address, which must be read from Strapi's own address
 * (`backendURL`, /strapi behind the image's nginx), as the Content Manager reads its images.
 */
export const tileUrlFor = (tile: z.infer<typeof media> | null | undefined, backendURL: string) => {
  if (!tile) return null;
  const url = tile.formats?.thumbnail?.url ?? tile.url;
  return url.startsWith('/') ? `${backendURL}${url}` : url;
};

// Strapi saves a draft without its required fields, so each may be null until it's filled in.
const draftText = z.string().nullable();

const gameDocument = z.object({
  documentId: z.string(),
  title: draftText,
  provider: draftText,
  gameId: draftText,
  category: draftText,
  tile: media.nullable(),
  status: publicationStatus,
});

const brandSummary = z.object({ documentId: z.string(), name: draftText, brandId: z.number().nullable() });

const collectionDocument = z.object({
  documentId: z.string(),
  name: draftText,
  slug: draftText,
  icon: draftText,
  status: publicationStatus,
});

/** Each content-manager answer the editor reads. */
export const RESPONSES = {
  gamesPage: pageOf(gameDocument),
  brandsPage: pageOf(brandSummary),
  collectionsPage: pageOf(collectionDocument),
  /** A page of a relation: the related documents' IDs. */
  relationPage: pageOf(z.object({ documentId: z.string() })),
  /** A Brand, with its status and its Collections' component entries. */
  brand: z.object({
    data: z.object({ status: publicationStatus, collections: z.array(z.object({ id: z.number() })).optional() }),
  }),
};

/**
 * The documents that have every one of `fields`, leaving out drafts saved without some of
 * them: the editor can't show or filter those, and the portal can't use them, until
 * they're filled in.
 */
export const withFields = <Item, Field extends keyof Item>(documents: readonly Item[], fields: readonly Field[]) =>
  documents.filter((document): document is Item & { [Key in Field]: NonNullable<Item[Key]> } =>
    fields.every((field) => document[field] !== null),
  );

/** The answer, checked against the shape the editor reads; `what` names it in the error. */
export const expectShape = <Answer>(shape: z.ZodType<Answer>, answer: unknown, what: string): Answer => {
  const result = shape.safeParse(answer);
  if (!result.success) {
    throw new Error(`The content manager sent ${what} in an unexpected shape:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
};
