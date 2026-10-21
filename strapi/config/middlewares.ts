import type { Core } from '@strapi/strapi';

/**
 * The warning Strapi logs at start without PORTAL_ORIGIN outside the image, where the
 * portal is on another origin and every browser call would fail CORS with no hint why.
 * The image runs in production without it on purpose, so there's no warning there.
 */
export const portalOriginWarning = (env: Record<string, string | undefined>): string | null =>
  env.PORTAL_ORIGIN || env.NODE_ENV === 'production'
    ? null
    : "PORTAL_ORIGIN isn't set, so browsers can't call the API from any other origin; local development needs PORTAL_ORIGIN (the portal's URL, e.g. http://localhost:3000) in strapi/.env.";

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  // Local development runs the portal on its own origin. The image serves both from one
  // origin (the portal reads Strapi at /strapi), so it leaves this unset and allows none.
  const portalOrigin = env('PORTAL_ORIGIN');

  return [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    // Browsers may call the API cross-origin only from the portal. The admin panel is same-origin.
    { name: 'strapi::cors', config: { origin: portalOrigin ? [portalOrigin] : [] } },
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
