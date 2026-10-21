import type { FetchClient } from '@strapi/strapi/admin';
import type { z } from 'zod';
import { brandUpdate, type BrandCollection, type BrandSelection, type CatalogueGame } from './lobby-selection';
import { expectShape, RESPONSES, tileUrlFor, withFields } from './lobby-responses';
import { BRAND_COLLECTION_UID, BRAND_UID, COLLECTION_UID, GAME_UID } from '../../uids.ts';

const BRANDS_URL = `/content-manager/collection-types/${BRAND_UID}`;
const GAMES_URL = `/content-manager/collection-types/${GAME_UID}`;
const COLLECTIONS_URL = `/content-manager/collection-types/${COLLECTION_UID}`;
const PAGE_SIZE = 100;

// The admin sets window.strapi.backendURL, but Strapi's global types give window.strapi the server's type.
const backendURL = () => (window.strapi as unknown as { backendURL: string }).backendURL;

/** A document's state, as the content manager reports it. */
export type PublicationStatus = 'draft' | 'published' | 'modified';

/** A catalogue game with what the Lobby editor shows next to it. */
export type EditorGame = CatalogueGame & {
  tileUrl: string | null;
  /** A game that was never published: the portal ignores it, even in a lobby. */
  isDraft: boolean;
};

/** A Collection an admin defined, which a Brand may show. */
export type EditorCollection = {
  documentId: string;
  name: string;
  slug: string;
  icon: string;
  /** A Collection that was never published: the portal ignores it, even on a Brand. */
  isDraft: boolean;
};

export type BrandSummary = {
  documentId: string;
  name: string;
  brandId: number;
};

/** A page of a content-manager list, as RESPONSES checks it. */
type Page<Item> = { results: Item[]; pagination: { pageCount: number } };

/**
 * Every result of a paged content-manager list, fetching the pages after the first in
 * parallel. Each page is checked against `page`; `what` names the list in the error.
 */
const fetchAll = async <Item>(
  client: FetchClient,
  url: string,
  params: Record<string, string>,
  page: z.ZodType<Page<Item>>,
  what: string,
): Promise<Item[]> => {
  const fetchPage = async (number: number): Promise<Page<Item>> => {
    const response = await client.get<unknown>(url, { params: { ...params, page: number, pageSize: PAGE_SIZE } });
    return expectShape(page, response.data, what);
  };
  const first = await fetchPage(1);
  const laterPages = Array.from({ length: first.pagination.pageCount - 1 }, (_, index) => fetchPage(index + 2));
  const rest = await Promise.all(laterPages);
  return [first, ...rest].flatMap((answer) => answer.results);
};

/** The whole catalogue, by title, including games that were never published, once their required fields are filled in. */
export const fetchCatalogue = async (client: FetchClient): Promise<EditorGame[]> => {
  const games = await fetchAll(client, GAMES_URL, { sort: 'title:ASC' }, RESPONSES.gamesPage, 'the catalogue');
  const complete = withFields(games, ['title', 'provider', 'gameId', 'category']);
  return complete.map(({ documentId, title, provider, gameId, category, tile, status }) => ({
    documentId,
    title,
    provider,
    gameId,
    category,
    tileUrl: tileUrlFor(tile, backendURL()),
    isDraft: status === 'draft',
  }));
};

/** Every Brand, by name, once its name and Brand ID are filled in. */
export const fetchBrands = async (client: FetchClient): Promise<BrandSummary[]> => {
  const brands = await fetchAll(client, BRANDS_URL, { sort: 'name:ASC' }, RESPONSES.brandsPage, 'the Brands');
  return withFields(brands, ['name', 'brandId']).map(({ documentId, name, brandId }) => ({
    documentId,
    name,
    brandId,
  }));
};

/** Every Collection an admin defined, by name, including ones that were never published, once their required fields are filled in. */
export const fetchCollections = async (client: FetchClient): Promise<EditorCollection[]> => {
  const collections = await fetchAll(
    client,
    COLLECTIONS_URL,
    { sort: 'name:ASC' },
    RESPONSES.collectionsPage,
    'the Collections',
  );
  return withFields(collections, ['name', 'slug', 'icon']).map(({ documentId, name, slug, icon, status }) => ({
    documentId,
    name,
    slug,
    icon,
    isDraft: status === 'draft',
  }));
};

/** A draft relation's document IDs in order. The relations endpoint lists the last one first. */
const fetchRelation = async (client: FetchClient, url: string): Promise<string[]> => {
  const newestFirst = await fetchAll(client, url, { status: 'draft' }, RESPONSES.relationPage, `the relation ${url}`);
  return newestFirst.map((document) => document.documentId).reverse();
};

/** One of the Brand's Collections, from its component entry. An entry whose Collection was deleted is dropped. */
const fetchBrandCollection = async (client: FetchClient, entryId: number): Promise<BrandCollection[]> => {
  const entryUrl = `/content-manager/relations/${BRAND_COLLECTION_UID}/${entryId}`;
  const [[collectionId], games] = await Promise.all([
    fetchRelation(client, `${entryUrl}/collection`),
    fetchRelation(client, `${entryUrl}/games`),
  ]);
  return collectionId ? [{ collectionId, games }] : [];
};

/** The Brand as saved: its status and its Collections' component entries. */
const savedBrand = (answer: unknown) => expectShape(RESPONSES.brand, answer, 'the Brand').data;

/** The Brand's draft lobby and Collections in order, and the Brand's status. */
export const fetchBrandSelection = async (
  client: FetchClient,
  brandId: string,
): Promise<{ selection: BrandSelection; status: PublicationStatus }> => {
  const [lobby, response] = await Promise.all([
    fetchRelation(client, `/content-manager/relations/${BRAND_UID}/${brandId}/lobby`),
    client.get<unknown>(`${BRANDS_URL}/${brandId}`),
  ]);
  const brand = savedBrand(response.data);
  const collections = await Promise.all(
    (brand.collections ?? []).map((entry) => fetchBrandCollection(client, entry.id)),
  );
  return { selection: { lobby, collections: collections.flat() }, status: brand.status };
};

/** Saves the lobby and Collections as the Brand's draft, leaving every other field as it is. Returns the Brand's new status. */
export const saveSelection = async (
  client: FetchClient,
  brandId: string,
  selection: BrandSelection,
): Promise<PublicationStatus> => {
  const response = await client.put<unknown>(`${BRANDS_URL}/${brandId}`, brandUpdate(selection));
  return savedBrand(response.data).status;
};

/** Saves the lobby and Collections and publishes the Brand in one request, as the content manager's Publish does. */
export const publishSelection = async (
  client: FetchClient,
  brandId: string,
  selection: BrandSelection,
): Promise<PublicationStatus> => {
  const response = await client.post<unknown>(`${BRANDS_URL}/${brandId}/actions/publish`, brandUpdate(selection));
  return savedBrand(response.data).status;
};
