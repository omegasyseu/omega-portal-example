import { BRAND_UID } from './uids.ts';

/** The content manager's Brand permissions: editing a lobby is updating its Brand. */
export const BRAND_PERMISSIONS = {
  create: { action: 'plugin::content-manager.explorer.create', subject: BRAND_UID },
  update: { action: 'plugin::content-manager.explorer.update', subject: BRAND_UID },
  publish: { action: 'plugin::content-manager.explorer.publish', subject: BRAND_UID },
};

/**
 * "Refresh from IPS" creates Brands and publishes them, so it needs both. The admin
 * shows the button, and the server allows the refresh, only with these.
 */
export const REFRESH_PERMISSIONS = [BRAND_PERMISSIONS.create, BRAND_PERMISSIONS.publish];
