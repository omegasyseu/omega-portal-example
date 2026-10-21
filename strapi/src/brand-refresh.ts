import path from 'node:path';
import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { REFRESH_PERMISSIONS } from './brand-permissions.ts';
import { ipsUrlFrom, refreshPlan, type StrapiBrand } from './brand-refresh-plan.ts';
import { fetchIpsBrands, type IpsBrand } from './ips-brands.ts';
import { readSeedData, SEED_STARTED, starterBrand, starterLegalPages } from './seed-data.ts';
import { StarterContentError } from './seed-files.ts';
import { mediaUploader, starterMedia } from './seed-media.ts';
import { BRAND_UID, COLLECTION_UID, GAME_UID, LEGAL_PAGE_UID, PAYMENT_METHOD_UID } from './uids.ts';

/** A Brand as the summary lists it. */
type ListedBrand = Pick<StrapiBrand, 'brandId' | 'name'>;

/** What a refresh did, as the admin's summary shows it. */
export type RefreshSummary = {
  added: IpsBrand[];
  legalPagesAdded: ListedBrand[];
  existing: ListedBrand[];
  notInIps: ListedBrand[];
};

// A new Brand gets the Dark Theme, whatever theme the environment was seeded with.
const STARTER_THEME = 'DARK' as const;

/**
 * A Brand in Strapi with its rows: its draft and, once published, its published version,
 * each with its own name.
 */
type BrandDocument = StrapiBrand & { rows: Array<{ id: number; name: string | null }> };

type BrandRow = {
  id: number;
  documentId: string;
  brandId?: number | null;
  name?: string | null;
  publishedAt: string | null;
  legalPages: unknown[];
};

// Reads the rows themselves, so a Brand's published version counts as well as its draft.
// Every document has a draft, so its draft's Brand ID and name are the ones an editor sees.
const strapiBrands = async (strapi: Core.Strapi): Promise<BrandDocument[]> => {
  const rows: BrandRow[] = await strapi.db.query(BRAND_UID).findMany({
    select: ['id', 'documentId', 'brandId', 'name', 'publishedAt'],
    populate: { legalPages: { select: ['id'] } },
  });
  return rows
    .filter((row) => row.publishedAt === null)
    .map((draft) => {
      const versions = rows.filter((row) => row.documentId === draft.documentId);
      return {
        brandId: draft.brandId ?? null,
        name: draft.name ?? null,
        hasLegalPages: versions.some((row) => row.legalPages.length > 0),
        rows: versions.map((row) => ({ id: row.id, name: row.name ?? null })),
      };
    });
};

/**
 * Gives each of a Brand's rows the seed's Legal Pages in that row's name (the draft's when
 * the row has none), writing the rows themselves rather than through the document service,
 * so a published Brand's published version gets them without publishing its draft. Only
 * `legalPages` is written, so every other field and component of the row stays as it is.
 */
const addLegalPages = async (
  strapi: Core.Strapi,
  brand: BrandDocument & { name: string },
  seedPages: Parameters<typeof starterLegalPages>[0],
) => {
  for (const { id, name } of brand.rows) {
    const pages = starterLegalPages(seedPages, name ?? brand.name);
    const created = await Promise.all(pages.map((data) => strapi.db.query(LEGAL_PAGE_UID).create({ data })));
    // Links them the way Strapi's own document service does (@strapi/core's
    // document-service/components.js, checked on 5.57), as add-starter-payment-methods.ts does.
    const legalPages = created.map((page) => ({
      id: page.id,
      __pivot: { field: 'legalPages', component_type: LEGAL_PAGE_UID },
    }));
    await strapi.db.query(BRAND_UID).update({ where: { id }, data: { legalPages } });
  }
};

const listed = ({ brandId, name }: ListedBrand): ListedBrand => ({ brandId, name });

const starterInput = async (strapi: Core.Strapi) => ({
  theme: STARTER_THEME,
  seed: readSeedData(path.join(strapi.dirs.app.root, 'seed'), { theme: STARTER_THEME }),
  held: {
    games: await strapi.documents(GAME_UID).findMany({ status: 'draft', fields: ['key'] }),
    collections: await strapi.documents(COLLECTION_UID).findMany({ status: 'draft', fields: ['slug'] }),
    paymentMethods: await strapi.documents(PAYMENT_METHOD_UID).findMany({ status: 'draft', fields: ['code'] }),
  },
});

const refuseDuringSeed = async (strapi: Core.Strapi) => {
  const seedStartedAt = await strapi.store.get(SEED_STARTED);
  if (seedStartedAt) {
    throw new StarterContentError(
      `A seed started at ${seedStartedAt} and hasn't finished: it's still running, or it stopped part-way. Refresh from IPS once the seed has finished; if it stopped, Strapi holds only part of it, so delete all content and seed again (see the README).`,
    );
  }
};

/**
 * Builds every new Brand before uploading the shared logo and banners, so a seed or Strapi
 * that can't make one uploads nothing, then gives Legal Pages and creates the new Brands
 * in one transaction, so a failure part-way writes none of it. The upload stays outside
 * it: a rolled-back upload would leave its files on disk.
 */
const refresh = async (strapi: Core.Strapi): Promise<RefreshSummary> => {
  await refuseDuringSeed(strapi);
  // IPS first, so a failing IPS writes nothing.
  const ipsBrands = await fetchIpsBrands(ipsUrlFrom(process.env));
  const plan = refreshPlan(ipsBrands, await strapiBrands(strapi));
  const added: IpsBrand[] = [];
  const legalPagesAdded: ListedBrand[] = [];
  const existing: ListedBrand[] = [...plan.existing];
  if (plan.add.length > 0 || plan.giveLegalPages.length > 0) {
    const input = await starterInput(strapi);
    const brands = plan.add.map((ipsBrand) => ({ ipsBrand, data: starterBrand(ipsBrand, input) }));
    const media = brands.length > 0 ? await starterMedia(strapi, mediaUploader(strapi), input.seed) : {};
    await strapi.db.transaction(async () => {
      // Read again under the write lock: a seed or an editor may have written since the reads
      // above. Creating a taken brandId instead would leave its draft behind, as Strapi's own
      // rollback doesn't run inside this transaction.
      await refuseDuringSeed(strapi);
      const current = await strapiBrands(strapi);
      for (const brand of refreshPlan(ipsBrands, current).giveLegalPages) {
        await addLegalPages(strapi, brand, input.seed.legalPages);
        legalPagesAdded.push(listed(brand));
      }
      const held = new Set(current.map(({ brandId }) => brandId));
      for (const { ipsBrand, data } of brands) {
        if (held.has(ipsBrand.brandId)) {
          existing.push(ipsBrand);
          continue;
        }
        await strapi.documents(BRAND_UID).create({ data: { ...data, ...media }, status: 'published' });
        added.push(ipsBrand);
      }
    });
  }
  strapi.log.info(
    `Refresh from IPS: added ${added.length} Brands, gave Legal Pages to ${legalPagesAdded.length}, ${existing.length} already there, ${plan.notInIps.length} not in IPS.`,
  );
  return { added, legalPagesAdded, existing: existing.map(listed), notInIps: plan.notInIps.map(listed) };
};

// One refresh at a time, so a second click waits and then finds the first one's Brands.
let running: Promise<unknown> = Promise.resolve();

/**
 * "Refresh from IPS": creates and publishes a starter Brand for every brand IPS lists that
 * Strapi has none for, gives the seed's Legal Pages to every named Brand that has none, and
 * reports the Brands already there and those IPS no longer lists. It changes nothing else
 * of a Brand and never deletes one. A seed running or stopped part-way, IPS failing, or
 * no IPS URL is an ApplicationError with the reason, and nothing is written; any other
 * failure writes none of it.
 */
export const refreshBrandsFromIps = (strapi: Core.Strapi): Promise<RefreshSummary> => {
  const run = running.then(() =>
    refresh(strapi).catch((error) => {
      throw error instanceof StarterContentError ? new errors.ApplicationError(error.message) : error;
    }),
  );
  running = run.catch(() => undefined);
  return run;
};

/** The admin route behind the button, for admins whose role may create and publish Brands. */
export const brandRefreshRoutes = (strapi: Core.Strapi): Core.Router => ({
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/brand-refresh',
      info: { apiName: 'brand' },
      handler: async (ctx) => {
        ctx.body = await refreshBrandsFromIps(strapi);
      },
      config: {
        policies: ['admin::isAuthenticatedAdmin', { name: 'admin::hasPermissions', config: { actions: REFRESH_PERMISSIONS } }],
      },
    },
  ],
});
