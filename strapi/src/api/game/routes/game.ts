import { factories } from '@strapi/strapi';
import { GAME_UID } from '../../../uids.ts';

export default factories.createCoreRouter(GAME_UID, {
  config: {
    find: { middlewares: ['global::published-only'] },
    findOne: { middlewares: ['global::published-only'] },
  },
});
