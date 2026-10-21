import type { Core } from '@strapi/strapi';
import { portalOriginWarning } from '../config/middlewares';
import { applyAdminViews } from './admin-views';
import { keepCollectionsInLobby } from './brand-collections';
import { brandRefreshRoutes } from './brand-refresh';
import { keepPaymentMethodsUnique } from './brand-payment-methods';
import { renameSportsCategory } from './game-category';
import { fillGameKey } from './game-key';
import { addStarterPaymentMethods } from './add-starter-payment-methods';
import { FEATURE_VISIBILITY_FIELD } from './feature-visibility';
import { grantPublicReadOnly } from './public-permissions';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    const warning = portalOriginWarning(process.env);
    if (warning) strapi.log.warn(warning);
    strapi.customFields.register({ ...FEATURE_VISIBILITY_FIELD, inputSize: { default: 12, isResizable: false } });
    strapi.documents.use(fillGameKey(strapi));
    strapi.documents.use(keepCollectionsInLobby(strapi));
    strapi.documents.use(keepPaymentMethodsUnique(strapi));
    strapi.server.routes(brandRefreshRoutes(strapi));
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await renameSportsCategory(strapi);
    await addStarterPaymentMethods(strapi);
    await grantPublicReadOnly(strapi);
    await applyAdminViews(strapi);
  },
};
