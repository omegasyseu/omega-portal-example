import type { StarterPaymentMethod } from './starter-payment-methods.ts';

/** The starters Strapi has no Payment Method for, by code. */
export const missingPaymentMethods = (starters: StarterPaymentMethod[], existingCodes: string[]) =>
  starters.filter((method) => !existingCodes.includes(method.code));

/**
 * A Brand's settings for these Payment Methods, in order: each switched on for deposits and
 * withdrawals, with no name or logo of the Brand's own. The seed passes document IDs, the
 * one-time step row IDs.
 */
export const switchedOnSettings = <Id>(paymentMethods: Id[]) =>
  paymentMethods.map((paymentMethod) => ({ paymentMethod, deposit: true, withdrawal: true }));

/** One row of a Brand: its draft or its published version, with its Payment Method settings. */
export type BrandRow = {
  id: number;
  publishedAt: string | Date | null;
  updatedAt: string | Date;
  paymentMethods?: unknown[] | null;
};

/** What the one-time step reads from the seed folder and Strapi to plan its work. */
export type PlanInput = {
  starters: StarterPaymentMethod[];
  existingCodes: string[];
  brandRows: BrandRow[];
};

/** The starters, the Payment Methods to create and the Brand rows to give all the starters. */
export type Plan = {
  starters: StarterPaymentMethod[];
  create: StarterPaymentMethod[];
  fill: BrandRow[];
};

const updatedTime = (row: BrandRow) => new Date(row.updatedAt).getTime();

/**
 * What the one-time step does: "skip" once it has run (`hasRun`, from Strapi's store),
 * before reading anything, so nothing it reads can stop a start. Otherwise it reads its
 * input and plans the Payment Methods to create and the Brand rows to fill. Filling a row
 * sets its updatedAt, and the admin shows a Brand as Modified when its draft was updated
 * after its published version, so rows are filled oldest first to keep that order.
 */
export const starterPaymentMethodsPlan = async (
  hasRun: boolean,
  readInput: () => Promise<PlanInput>,
): Promise<'skip' | Plan> => {
  if (hasRun) return 'skip';
  const { starters, existingCodes, brandRows } = await readInput();
  return {
    starters,
    create: missingPaymentMethods(starters, existingCodes),
    fill: brandRows
      .filter((row) => (row.paymentMethods ?? []).length === 0)
      .sort((a, b) => updatedTime(a) - updatedTime(b)),
  };
};
