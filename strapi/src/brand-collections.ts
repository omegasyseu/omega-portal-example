import type { Core } from '@strapi/strapi';
import { checkSavedBrand } from './saved-brand-check.ts';

type GameRef = { documentId: string; title: string };
type SavedBrand = {
  lobby?: GameRef[] | null;
  collections?: Array<{ collection: { name: string } | null; games?: GameRef[] | null }> | null;
};

/** A Collection on a Brand that holds games the Brand's lobby doesn't list, and their titles. */
export type CollectionOutsideLobby = { collection: string; games: string[] };

/** The Brand's Collections that hold games its lobby doesn't list. A Collection may only pick from the lobby. */
export const collectionGamesOutsideLobby = (brand: SavedBrand): CollectionOutsideLobby[] => {
  const inLobby = new Set((brand.lobby ?? []).map((game) => game.documentId));
  return (brand.collections ?? []).flatMap(({ collection, games }) => {
    const outside = (games ?? []).filter((game) => !inLobby.has(game.documentId));
    return outside.length > 0
      ? [{ collection: collection?.name ?? 'A deleted Collection', games: outside.map((game) => game.title) }]
      : [];
  });
};

/**
 * Refuses to save a Brand whose Collections hold a game its lobby doesn't list, however the
 * lobby and the Collections were sent. The portal drops such games too.
 */
export const keepCollectionsInLobby = (strapi: Core.Strapi) =>
  checkSavedBrand<SavedBrand>(
    strapi,
    {
      lobby: { fields: ['title'] },
      collections: { populate: { collection: { fields: ['name'] }, games: { fields: ['title'] } } },
    },
    (brand) => {
      const problems = collectionGamesOutsideLobby(brand);
      if (problems.length === 0) return undefined;
      return {
        field: 'collections',
        message: problems
          .map(({ collection, games }) => `${collection} holds games that aren't in the lobby: ${games.join(', ')}.`)
          .join(' '),
        fix: 'Add them to the lobby or take them out of the Collection.',
      };
    },
  );
