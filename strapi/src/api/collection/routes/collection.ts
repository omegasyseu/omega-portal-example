import { factories } from '@strapi/strapi';
import { COLLECTION_UID } from '../../../uids.ts';

export default factories.createCoreRouter(COLLECTION_UID, {
  config: {
    find: { middlewares: ['global::published-only'] },
    findOne: { middlewares: ['global::published-only'] },
  },
});
