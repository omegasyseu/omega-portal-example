import fs from 'node:fs';
import path from 'node:path';
import type { Core } from '@strapi/strapi';
import { type BrandRow, starterPaymentMethodsPlan, switchedOnSettings } from './starter-payment-methods-plan.ts';
import { readStarterPaymentMethods, type StarterPaymentMethod } from './starter-payment-methods.ts';
import { BRAND_PAYMENT_METHOD_UID, BRAND_UID, PAYMENT_METHOD_UID } from './uids.ts';

type UploadService = { upload: (input: unknown) => Promise<Array<{ id: number }>> };

const uploadLogo = async (strapi: Core.Strapi, file: string): Promise<number> => {
  const upload = strapi.plugin('upload').service('upload') as UploadService;
  const [media] = await upload.upload({
    data: { fileInfo: { alternativeText: null } },
    files: { filepath: file, originalFilename: path.basename(file), mimetype: 'image/png', size: fs.statSync(file).size },
  });
  return media.id;
};

/** Creates and publishes each Payment Method, uploading its logo. The seed uses it too. */
export const createPaymentMethods = async (strapi: Core.Strapi, methods: StarterPaymentMethod[]): Promise<void> => {
  for (const { logo, ...method } of methods) {
    await strapi.documents(PAYMENT_METHOD_UID).create({
      data: { ...method, logo: logo === null ? null : await uploadLogo(strapi, logo) },
      status: 'published',
    });
  }
};

/**
 * Gives one Brand row the starters, each switched on for deposits and withdrawals, with no
 * overrides. It writes the row itself rather than through the document service, so a
 * published Brand's published version is filled without publishing its draft. Like Strapi's
 * own publish, a draft row links each method's draft and a published row its published
 * version (none when the method isn't published).
 */
const fillBrandRow = async (
  strapi: Core.Strapi,
  row: BrandRow,
  starters: StarterPaymentMethod[],
  methodRows: Array<{ id: number; code: string; publishedAt: string | null }>,
): Promise<void> => {
  const isPublished = row.publishedAt !== null;
  const versionOf = (code: string) =>
    methodRows.find((method) => method.code === code && (method.publishedAt !== null) === isPublished);
  const settings = await Promise.all(
    switchedOnSettings(starters.map(({ code }) => versionOf(code)?.id ?? null)).map((setting) =>
      strapi.db.query(BRAND_PAYMENT_METHOD_UID).create({ data: setting }),
    ),
  );
  // Links the settings to the row the way Strapi's own document service does
  // (@strapi/core's document-service/components.js, checked on 5.57); recheck after an upgrade.
  const paymentMethods = settings.map(({ id }) => ({
    id,
    __pivot: { field: 'paymentMethods', component_type: BRAND_PAYMENT_METHOD_UID },
  }));
  await strapi.db.query(BRAND_UID).update({ where: { id: row.id }, data: { paymentMethods } });
};

// Strapi's own store records that the one-time step ran, per environment.
const STEP_RAN = { type: 'api', name: 'payment-method', key: 'starter-payment-methods-added' };

/**
 * The one-time start-up step that brings an environment seeded before Payment Methods up to
 * date. Called on every start, it acts only the first time: it
 * creates and publishes any starter Payment Method that's missing, gives every Brand row with
 * no Payment Method settings all of them, and records in Strapi's store that it ran, so a
 * Brand an editor later clears stays cleared. If it fails part-way, the next start runs it
 * again: methods and Brand rows it already filled are left alone.
 */
export const addStarterPaymentMethods = async (strapi: Core.Strapi): Promise<void> => {
  const plan = await starterPaymentMethodsPlan((await strapi.store.get(STEP_RAN)) === true, async () => {
    const starters = readStarterPaymentMethods(path.join(strapi.dirs.app.root, 'seed'));
    const existing: Array<{ code: string }> = await strapi.db.query(PAYMENT_METHOD_UID).findMany({ select: ['code'] });
    const brandRows: BrandRow[] = await strapi.db.query(BRAND_UID).findMany({
      select: ['id', 'publishedAt', 'updatedAt'],
      populate: { paymentMethods: { select: ['id'] } },
    });
    return { starters, existingCodes: existing.map((method) => method.code), brandRows };
  });
  if (plan === 'skip') return;

  await createPaymentMethods(strapi, plan.create);
  const methodRows = await strapi.db.query(PAYMENT_METHOD_UID).findMany({ select: ['id', 'code', 'publishedAt'] });
  for (const row of plan.fill) {
    await fillBrandRow(strapi, row, plan.starters, methodRows);
  }
  await strapi.store.set({ ...STEP_RAN, value: true });
  strapi.log.info(
    `Payment Methods: created ${plan.create.length}, and gave ${plan.fill.length} Brand drafts and published versions all ${plan.starters.length}. This never runs again.`,
  );
};
