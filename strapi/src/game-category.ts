import type { Core } from '@strapi/strapi';
import { GAME_UID } from './uids.ts';

/**
 * A Game's category was free text, and sportsbooks were "sports". It's now a fixed
 * choice of slots or sportsbook, so on every start any
 * game still saying "sports", draft or published, becomes "sportsbook". Once none
 * does, this changes nothing.
 */
export const renameSportsCategory = async (strapi: Core.Strapi): Promise<void> => {
  await strapi.db.query(GAME_UID).updateMany({ where: { category: 'sports' }, data: { category: 'sportsbook' } });
};
