import path from 'node:path';
import { z } from 'zod';
import { readSeedFile, StarterContentError, seedImageAt } from './seed-files.ts';

/** A Payment Method every environment starts with: IPS's code, its default name and its logo file, if any. */
export type StarterPaymentMethod = { code: string; name: string; logo: string | null };

// seed/payment-methods.json, as written: each logo is a path in the seed folder, or null.
// Its codes are IPS's, and match the portal's PAYMENT_METHOD_CODE (src/constants/payments.ts
// in the portal); change them together.
const starterFile = z.array(
  z.object({ code: z.string().min(1), name: z.string().min(1), logo: z.string().min(1).nullable() }),
);

/**
 * The Payment Methods the portal handles, from seed/payment-methods.json, with each logo as
 * an absolute path that exists. Strapi refuses SVG uploads, so the logos are PNG. A file
 * that's missing, isn't that shape, or names a missing or non-PNG logo is a StarterContentError.
 */
export const readStarterPaymentMethods = (seedDir: string): StarterPaymentMethod[] => {
  const methods = readSeedFile(path.join(seedDir, 'payment-methods.json'), starterFile);
  return methods.map((method) => {
    if (method.logo === null) return method;
    if (path.extname(method.logo) !== '.png') {
      throw new StarterContentError(`The ${method.name} logo must be a PNG file: ${path.join(seedDir, method.logo)}`);
    }
    return { ...method, logo: seedImageAt(seedDir, method.logo) };
  });
};
