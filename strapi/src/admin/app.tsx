import type { ComponentType } from 'react';
import type { StrapiApp } from '@strapi/strapi/admin';
import { GridNine } from '@strapi/icons';
import { BRAND_PERMISSIONS } from '../brand-permissions.ts';
import { FEATURE_VISIBILITY_FIELD } from '../feature-visibility.ts';
import { RefreshFromIpsButton } from './brand-refresh/RefreshFromIpsButton';

export default {
  config: {},
  register(app: StrapiApp) {
    // The Lobby editor builds a Brand's lobby from the catalogue (README.md, "Lobby editor").
    app.addMenuLink({
      to: 'lobby-editor',
      icon: GridNine,
      intlLabel: { id: 'lobby-editor.menu', defaultMessage: 'Lobby editor' },
      permissions: [BRAND_PERMISSIONS.update],
      Component: () => import('./lobby-editor/LobbyEditorPage'),
    });
    // A Brand's Feature visibility: a panel of switches, one per Engage Feature.
    app.customFields.register({
      ...FEATURE_VISIBILITY_FIELD,
      intlLabel: { id: 'feature-visibility.label', defaultMessage: 'Feature visibility' },
      intlDescription: {
        id: 'feature-visibility.description',
        defaultMessage: 'A switch per Engage Feature',
      },
      components: {
        Input: () =>
          import('./feature-visibility/FeatureVisibilityInput').then((module) => ({
            default: module.FeatureVisibilityInput as ComponentType,
          })),
      },
    });
  },
  bootstrap(app: StrapiApp) {
    // "Refresh from IPS" on the Brand list (README.md, "Brands added in IPS later").
    app.getPlugin('content-manager').injectComponent('listView', 'actions', {
      name: 'refresh-from-ips',
      Component: RefreshFromIpsButton,
    });
  },
};
