'use strict';

/**
 * One-off seed: fills an empty Strapi with today's games, tiles, banners and logo, a
 * Collection per Game Category, the starter Payment Methods, and one Brand per IPS brand.
 * Run from strapi/ with `pnpm run seed` (see README).
 */

const path = require('node:path');
const { compileStrapi, createStrapi } = require('@strapi/strapi');
const { readSeedOptions, shouldSeed } = require('./seed-inputs');
const { createPaymentMethods } = require('../src/add-starter-payment-methods.ts');
const { fetchIpsBrands } = require('../src/ips-brands.ts');
const { readSeedData, SEED_STARTED, starterBrand } = require('../src/seed-data.ts');
const { StarterContentError } = require('../src/seed-files.ts');
const { mediaUploader, starterMedia } = require('../src/seed-media.ts');
const { missingPaymentMethods } = require('../src/starter-payment-methods-plan.ts');
const { BRAND_UID, COLLECTION_UID, GAME_UID, PAYMENT_METHOD_UID } = require('../src/uids.ts');

const SEED_DIR = path.join(__dirname, '..', 'seed');

// How much content Strapi holds, and when an unfinished seed started. Every document has a
// draft, so counting drafts counts published and unpublished ones.
const readSeedState = async (strapi) => ({
  brands: await strapi.documents(BRAND_UID).count({ status: 'draft' }),
  games: await strapi.documents(GAME_UID).count({ status: 'draft' }),
  collections: await strapi.documents(COLLECTION_UID).count({ status: 'draft' }),
  seedStartedAt: await strapi.store.get(SEED_STARTED),
});

// Runs `step` on each item, one after another, and returns the results in order.
const inTurn = (items, step) =>
  items.reduce(async (done, item) => [...(await done), await step(item)], Promise.resolve([]));

// Creates and publishes each Game, and returns each one's key and document ID, in lobby order.
const createGames = (strapi, games, upload) =>
  inTurn(games, async ({ tile, ...game }) => {
    const created = await strapi.documents(GAME_UID).create({
      data: { ...game, tile: await upload(tile, game.title) },
      status: 'published',
    });
    return { key: created.key, documentId: created.documentId };
  });

// Creates and publishes each Collection, and returns each one's slug and document ID.
const createCollections = (strapi, collections) =>
  inTurn(collections, async ({ category, ...collection }) => {
    const created = await strapi.documents(COLLECTION_UID).create({ data: collection, status: 'published' });
    return { slug: created.slug, documentId: created.documentId };
  });

// Strapi's one-time start-up step (src/add-starter-payment-methods.ts) has usually created the starter
// Payment Methods already, as this seed's own Strapi starts, so only missing ones are created.
// Returns every Payment Method's code and document ID.
const createStarterPaymentMethods = async (strapi, starters) => {
  const findAll = () => strapi.documents(PAYMENT_METHOD_UID).findMany({ status: 'draft', fields: ['code'] });
  const existing = await findAll();
  await createPaymentMethods(strapi, missingPaymentMethods(starters, existing.map((method) => method.code)));
  return findAll();
};

const seed = async (strapi, options, seedData) => {
  if (!shouldSeed(await readSeedState(strapi), options.ifEmpty)) {
    console.log('Strapi already has content, so there is nothing to seed.');
    return;
  }
  const ipsBrands = await fetchIpsBrands(options.ipsUrl);
  await strapi.store.set({ ...SEED_STARTED, value: new Date().toISOString() });
  const upload = mediaUploader(strapi);

  const games = await createGames(strapi, seedData.games, upload);
  console.log(`Created and published ${games.length} Games.`);
  const collections = await createCollections(strapi, seedData.collections);
  console.log(`Created and published the Collections ${seedData.collections.map(({ name }) => name).join(' and ')}.`);

  const methods = await createStarterPaymentMethods(strapi, seedData.paymentMethods);
  console.log(`Each Brand shows the Payment Methods ${seedData.paymentMethods.map(({ name }) => name).join(', ')}.`);

  const starter = { theme: options.theme, seed: seedData, held: { games, collections, paymentMethods: methods } };
  const media = await starterMedia(strapi, upload, seedData);
  const brands = ipsBrands.map((ipsBrand) => ({ ...starterBrand(ipsBrand, starter), ...media }));
  for (const brand of brands) {
    await strapi.documents(BRAND_UID).create({ data: brand, status: 'published' });
    console.log(`Created and published Brand ${brand.brandId} "${brand.name}".`);
  }
  await strapi.store.delete(SEED_STARTED);
  const [firstBrand] = brands;
  console.log(
    `Seeded ${brands.length} Brands (${options.theme}, ${firstBrand.banners.length} banners, ${firstBrand.lobby.length} lobby games, ${firstBrand.collections.length} Collections and ${firstBrand.paymentMethods.length} Payment Methods each) from ${options.ipsUrl}.`,
  );
};

// Strapi announces each publish once its transaction commits, without waiting for it,
// and reads the whole Brand back for that (@strapi/core's document-service events). Let
// those reads finish: destroying Strapi while they wait for the database aborts them, and
// the seed would fail after it had seeded everything.
const settle = async (strapi) => {
  const pool = strapi.db.connection.client.pool;
  do {
    await new Promise((resolve) => setImmediate(resolve));
  } while (pool.numUsed() + pool.numPendingAcquires() > 0);
};

const main = async () => {
  const options = readSeedOptions(process.argv.slice(2), process.env);
  const seedData = readSeedData(SEED_DIR, options);
  const strapi = await createStrapi(await compileStrapi()).load();
  strapi.log.level = 'error';
  try {
    await seed(strapi, options, seedData);
    await settle(strapi);
  } finally {
    await strapi.destroy();
  }
};

main().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  if (error.details) {
    console.error(JSON.stringify(error.details, null, 2));
  }
  // The seed's own refusals explain themselves; anything else (Strapi, the upload, a bug) gets its stack.
  if (!(error instanceof StarterContentError)) {
    console.error(error.stack);
  }
  process.exit(1);
});
