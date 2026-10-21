import type { Core, Modules } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { GAME_UID } from './uids.ts';

const SAVE_ACTIONS = ['create', 'update', 'clone'];

type GameFields = { provider?: unknown; gameId?: unknown; key?: string };

/**
 * A Game's identity, `PROVIDER:gameId`. The portal builds the same key (gameKey in its
 * src/components/games/lobby-model.ts); change both together.
 */
export const gameKey = (provider: string, gameId: string) => `${provider}:${gameId}`;

/**
 * Fills a Game's `key` with `PROVIDER:gameId` on every save, so the key is
 * always the identity the portal uses (gameKey) and anything typed into it is replaced.
 *
 * Strapi checks `unique` only when publishing, so saving a draft that has the
 * same provider and game ID as another game is refused here.
 */
export const fillGameKey =
  (strapi: Core.Strapi): Modules.Documents.Middleware.Middleware =>
  async (context, next) => {
    if (context.uid !== GAME_UID || !SAVE_ACTIONS.includes(context.action)) {
      return next();
    }

    const params = context.params as { documentId?: string; data?: GameFields };
    // A typed key is always dropped; only the computed one is saved.
    const { key: _typedKey, ...data } = params.data ?? {};
    const isPartial = data.provider === undefined || data.gameId === undefined;
    const saved =
      isPartial && params.documentId
        ? await strapi.documents(GAME_UID).findOne({ documentId: params.documentId })
        : null;
    const provider = data.provider ?? saved?.provider;
    const gameId = data.gameId ?? saved?.gameId;

    // An incomplete draft gets no key yet; Strapi refuses to publish it without both fields.
    if (typeof provider !== 'string' || typeof gameId !== 'string') {
      params.data = data;
      return next();
    }

    const key = gameKey(provider, gameId);
    // An update may keep its own key; a create or a clone is a new game.
    const otherGames = context.action === 'update' ? { documentId: { $ne: params.documentId } } : {};
    const duplicate = await strapi.documents(GAME_UID).findFirst({
      filters: { key, ...otherGames },
      status: 'draft',
    });
    if (duplicate) {
      throw new errors.ValidationError(`Another game already has provider ${provider} and game ID ${gameId}.`, {
        errors: [{ path: ['gameId'], message: 'This provider and game ID are already in the catalogue.', name: 'ValidationError' }],
      });
    }

    params.data = { ...data, key };
    return next();
  };
