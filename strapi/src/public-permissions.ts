import type { Core } from '@strapi/strapi';
import { BRAND_UID, COLLECTION_UID, GAME_UID, PAYMENT_METHOD_UID } from './uids.ts';

const ROLE_UID = 'plugin::users-permissions.role';
const PERMISSION_UID = 'plugin::users-permissions.permission';

/** Everything the portal may do without signing in: read Brands, Collections, Games and Payment Methods. */
const PUBLIC_ACTIONS = [BRAND_UID, COLLECTION_UID, GAME_UID, PAYMENT_METHOD_UID].flatMap((uid) => [
  `${uid}.find`,
  `${uid}.findOne`,
]);

/**
 * Makes the public role read-only on Brands, Collections, Games and Payment Methods and removes
 * every other public permission, including any granted in the admin panel. Runs on every start.
 */
export const grantPublicReadOnly = async (strapi: Core.Strapi): Promise<void> => {
  const role = await strapi.db.query(ROLE_UID).findOne({ where: { type: 'public' } });
  if (!role) {
    throw new Error('The users-permissions public role is missing, so public access cannot be set.');
  }

  const permissions: Array<{ id: number; action: string }> = await strapi.db
    .query(PERMISSION_UID)
    .findMany({ where: { role: role.id } });

  const extraIds = permissions
    .filter((permission) => !PUBLIC_ACTIONS.includes(permission.action))
    .map((permission) => permission.id);
  if (extraIds.length > 0) {
    await strapi.db.query(PERMISSION_UID).deleteMany({ where: { id: { $in: extraIds } } });
  }

  const granted = permissions.map((permission) => permission.action);
  const missing = PUBLIC_ACTIONS.filter((action) => !granted.includes(action));
  for (const action of missing) {
    await strapi.db.query(PERMISSION_UID).create({ data: { action, role: role.id } });
  }
};
