import type { Core } from '@strapi/strapi';

/**
 * Pins REST reads to published content. Without it, anyone allowed to `find`
 * could read drafts by adding `?status=draft`.
 */
const publishedOnly: Core.MiddlewareFactory = () => async (ctx, next) => {
  ctx.query = { ...ctx.query, status: 'published' };
  await next();
};

export default publishedOnly;
