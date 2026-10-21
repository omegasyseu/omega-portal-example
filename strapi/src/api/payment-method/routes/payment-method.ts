import { factories } from '@strapi/strapi';
import { PAYMENT_METHOD_UID } from '../../../uids.ts';

export default factories.createCoreRouter(PAYMENT_METHOD_UID, {
  config: {
    find: { middlewares: ['global::published-only'] },
    findOne: { middlewares: ['global::published-only'] },
  },
});
