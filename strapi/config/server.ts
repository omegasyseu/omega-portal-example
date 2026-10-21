import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // The image builds the admin with PUBLIC_URL=/strapi, where its nginx serves Strapi. nginx
  // strips that prefix, so the server itself runs at the root and the image leaves it unset.
  url: env('PUBLIC_URL', ''),
  // Behind the image's nginx: trust its X-Forwarded-* headers (client IP, https).
  proxy: { koa: env.bool('IS_PROXIED', false) },
  app: {
    keys: env.array('APP_KEYS')!,
  },
  // Uploads land in data/public/uploads, on the same volume as the database.
  dirs: {
    public: './data/public',
  },
});

export default config;
