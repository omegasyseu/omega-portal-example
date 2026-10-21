import type { Core } from '@strapi/strapi';
import { checkSavedBrand } from './saved-brand-check.ts';

type SavedBrand = {
  paymentMethods?: Array<{ paymentMethod: { documentId: string; name: string } | null }> | null;
};

/** The names of the Payment Methods a Brand lists more than once, each method named once. */
export const repeatedPaymentMethods = (brand: SavedBrand): string[] => {
  const listed = new Map<string, { name: string; count: number }>();
  for (const { paymentMethod } of brand.paymentMethods ?? []) {
    if (!paymentMethod) continue;
    const count = (listed.get(paymentMethod.documentId)?.count ?? 0) + 1;
    listed.set(paymentMethod.documentId, { name: paymentMethod.name, count });
  }
  return [...listed.values()].filter(({ count }) => count > 1).map(({ name }) => name);
};

/**
 * Refuses to save a Brand that lists a Payment Method more than once, as the portal could
 * not tell which settings apply.
 */
export const keepPaymentMethodsUnique = (strapi: Core.Strapi) =>
  checkSavedBrand<SavedBrand>(
    strapi,
    { paymentMethods: { populate: { paymentMethod: { fields: ['name'] } } } },
    (brand) => {
      const repeated = repeatedPaymentMethods(brand);
      if (repeated.length === 0) return undefined;
      return {
        field: 'paymentMethods',
        message: `${repeated.join(', ')} ${repeated.length === 1 ? 'is' : 'are'} listed more than once.`,
        fix: 'Keep one entry per Payment Method.',
      };
    },
  );
