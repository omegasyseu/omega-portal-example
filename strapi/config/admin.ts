import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET')!,
    // `strapi build` inlines this path into the admin bundle. The image builds with
    // PUBLIC_URL=/strapi, so its admin keeps the login cookie under /strapi/admin, where
    // the browser sees it. At runtime PUBLIC_URL is unset: the server sets the cookie for
    // /admin and the image's nginx rewrites that to /strapi/admin (see server.ts).
    cookie: { path: env('PUBLIC_URL') ? `${env('PUBLIC_URL')}/admin` : undefined },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT')!,
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT')!,
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY')!,
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    docLinks: env.bool('FLAG_DOC_LINKS', true),
  },
});

export default config;
