import { factories } from '@strapi/strapi';
import { BRAND_UID } from '../../../uids.ts';

export default factories.createCoreRouter(BRAND_UID, {
  config: {
    find: { middlewares: ['global::published-only'] },
    findOne: { middlewares: ['global::published-only'] },
  },
});
