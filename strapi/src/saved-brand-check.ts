import type { Core, Modules } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { BRAND_UID } from './uids.ts';

const SAVE_ACTIONS = ['create', 'update'];

/** Why a saved Brand is refused: the field at fault, what's wrong, and how to fix it. */
export type BrandRefusal = { field: string; message: string; fix: string };

/**
 * A document middleware that checks a Brand as saved, inside the save's transaction, so a
 * refused save changes nothing, however the Brand was sent. It reads the saved draft back
 * with `populate` and refuses the save with a ValidationError on the field `refusalFor` names.
 */
export const checkSavedBrand =
  <SavedBrand>(
    strapi: Core.Strapi,
    populate: Modules.Documents.Params.Populate.Any<typeof BRAND_UID>,
    refusalFor: (brand: SavedBrand) => BrandRefusal | undefined,
  ): Modules.Documents.Middleware.Middleware =>
  async (context, next) => {
    if (context.uid !== BRAND_UID || !SAVE_ACTIONS.includes(context.action)) {
      return next();
    }

    return strapi.db.transaction(async () => {
      const result = await next();
      const saved = result as { documentId?: string } | null;
      const documentId = saved?.documentId ?? (context.params as { documentId: string }).documentId;
      const brand = await strapi.documents(BRAND_UID).findOne({ documentId, status: 'draft', populate });
      const refused = refusalFor((brand ?? {}) as SavedBrand);
      if (refused) {
        throw new errors.ValidationError(`${refused.message} ${refused.fix}`, {
          errors: [{ path: [refused.field], message: refused.message, name: 'ValidationError' }],
        });
      }
      return result;
    });
  };
