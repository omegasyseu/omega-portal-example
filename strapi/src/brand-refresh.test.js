'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { errors } = require('@strapi/utils');
const { refreshBrandsFromIps } = require('./brand-refresh.ts');
const { BRAND_UID, PAYMENT_METHOD_UID } = require('./uids.ts');

const STARTER_METHODS = ['OMEGA_BANK', 'EVOUCHER', 'PAYMENTIQ_ALL', 'COINSPAID_V2'].map((code, index) => ({
  code,
  documentId: `method-${index}`,
}));

/**
 * A Strapi holding `brands`, with the seed folder of this project. Its transactions keep
 * what they created only if they finish, as the database's do. `failCreate` decides, per
 * Brand, an error its create throws. `createdMeanwhile` Brands appear just before the
 * refresh's transaction starts, as if someone created them while it asked IPS.
 */
const fakeStrapi = ({
  brands = [],
  methods = STARTER_METHODS,
  seedStartedAt = null,
  failCreate = () => null,
  createdMeanwhile = [],
} = {}) => {
  const state = { brands: [...brands], legalPages: [], uploads: 0, pending: null };
  const documents = (uid) => ({
    findMany: async () => (uid === BRAND_UID ? state.brands : uid === PAYMENT_METHOD_UID ? methods : []),
    create: async ({ data }) => {
      const error = failCreate(data);
      if (error) throw error;
      (state.pending ?? state.brands).push({ brandId: data.brandId, name: data.name });
      return data;
    },
  });
  const strapi = {
    dirs: { app: { root: path.join(__dirname, '..') } },
    log: { info: () => {} },
    store: { get: async ({ name, key }) => (name === 'seed' && key === 'started-at' ? seedStartedAt : null) },
    documents,
    db: {
      transaction: async (callback) => {
        state.brands.push(...createdMeanwhile);
        state.pending = [];
        try {
          const result = await callback();
          state.brands.push(...state.pending);
          return result;
        } finally {
          state.pending = null;
        }
      },
      // Each Brand is a draft row unless it says otherwise; a published version shares its
      // draft's documentId. A row's legalPages hold the IDs of its Legal Pages.
      query: () => ({
        findOne: async () => null,
        findMany: async () =>
          state.brands.map((brand, index) => ({
            id: index + 1,
            documentId: `brand-${index}`,
            publishedAt: null,
            legalPages: [],
            ...brand,
          })),
        create: async ({ data }) => {
          state.legalPages.push(data);
          return { id: state.legalPages.length };
        },
        update: async ({ where, data }) => {
          state.brands[where.id - 1] = { ...state.brands[where.id - 1], legalPages: data.legalPages };
        },
      }),
    },
    plugin: () => ({
      service: () => ({
        upload: async () => {
          state.uploads += 1;
          return [{ id: state.uploads }];
        },
      }),
    }),
  };
  return { strapi, state };
};

// IPS answering with these brands.
const ipsLists = (t, brands) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ status: 'SUCCESS', brands }));
};

const withIpsUrl = (t, url) => {
  const saved = { IPS_API: process.env.IPS_API, PORTAL_IPS_API: process.env.PORTAL_IPS_API };
  process.env.IPS_API = url;
  delete process.env.PORTAL_IPS_API;
  t.after(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
};

test('adds and publishes the IPS brands Strapi has none for', async (t) => {
  withIpsUrl(t, 'https://ips.example');
  ipsLists(t, [
    { id: 1, name: 'OMEGA' },
    { id: 2, name: 'Lucky Star' },
  ]);
  const { strapi, state } = fakeStrapi({ brands: [{ brandId: 1, name: 'OMEGA' }] });
  const summary = await refreshBrandsFromIps(strapi);
  assert.deepEqual(summary.added, [{ brandId: 2, name: 'Lucky Star' }]);
  assert.deepEqual(summary.existing, [{ brandId: 1, name: 'OMEGA' }]);
  assert.deepEqual(state.brands.map(({ brandId }) => brandId), [1, 2]);
});

test('gives the seed Legal Pages, in its name, to each Brand with none, and leaves the others alone', async (t) => {
  withIpsUrl(t, 'https://ips.example');
  ipsLists(t, [{ id: 1, name: 'OMEGA' }]);
  const kept = [{ id: 99 }];
  const { strapi, state } = fakeStrapi({
    brands: [
      { brandId: 1, name: 'OMEGA', legalPages: kept },
      { brandId: 4, name: 'Closed brand' },
    ],
  });
  const summary = await refreshBrandsFromIps(strapi);
  assert.deepEqual(summary.legalPagesAdded, [{ brandId: 4, name: 'Closed brand' }]);
  assert.deepEqual(summary.added, []);
  assert.equal(state.brands[0].legalPages, kept);
  const given = state.brands[1].legalPages.map(({ id }) => state.legalPages[id - 1]);
  assert.deepEqual(
    given.map(({ page }) => page),
    ['gaming-rules', 'player-protection', 'terms', 'privacy', 'complaints'],
  );
  assert.match(JSON.stringify(given[0].body), /every game offered by Closed brand\./);
  assert.doesNotMatch(JSON.stringify(given), /\{\{brand\}\}/);
  assert.equal(state.uploads, 0);
});

// A published Brand: its draft row, then its published row, each with its own name.
const publishedBrand = (documentId, brandId, draft, published) => [
  { documentId, brandId, ...draft },
  { documentId, brandId, publishedAt: '2026-10-01T00:00:00.000Z', ...published },
];

const givenPages = (state, row) => state.brands[row].legalPages.map(({ id }) => state.legalPages[id - 1]);

test("gives a published Brand's draft and published version the Legal Pages, each in its own name", async (t) => {
  withIpsUrl(t, 'https://ips.example');
  ipsLists(t, [{ id: 5, name: 'Star' }]);
  const { strapi, state } = fakeStrapi({
    brands: publishedBrand('star', 5, { name: 'Star Casino' }, { name: 'Star' }),
  });
  const summary = await refreshBrandsFromIps(strapi);
  assert.deepEqual(summary.legalPagesAdded, [{ brandId: 5, name: 'Star Casino' }]);
  assert.match(JSON.stringify(givenPages(state, 0)[0].body), /every game offered by Star Casino\./);
  assert.match(JSON.stringify(givenPages(state, 1)[0].body), /every game offered by Star\./);
});

test('gives no Legal Pages to a Brand whose published version has them but its draft has none', async (t) => {
  withIpsUrl(t, 'https://ips.example');
  ipsLists(t, [{ id: 5, name: 'Star' }]);
  const kept = [{ id: 99 }];
  const { strapi, state } = fakeStrapi({
    brands: publishedBrand('star', 5, { name: 'Star' }, { name: 'Star', legalPages: kept }),
  });
  const summary = await refreshBrandsFromIps(strapi);
  assert.deepEqual(summary.legalPagesAdded, []);
  assert.deepEqual(state.brands[0].legalPages ?? [], []);
  assert.equal(state.brands[1].legalPages, kept);
});

test('a Brand created since the refresh read the Brands counts as already there', async (t) => {
  withIpsUrl(t, 'https://ips.example');
  ipsLists(t, [
    { id: 1, name: 'OMEGA' },
    { id: 2, name: 'Lucky Star' },
  ]);
  const { strapi, state } = fakeStrapi({ createdMeanwhile: [{ brandId: 1, name: 'OMEGA' }] });
  const summary = await refreshBrandsFromIps(strapi);
  assert.deepEqual(summary.added, [{ brandId: 2, name: 'Lucky Star' }]);
  assert.deepEqual(summary.existing, [{ brandId: 1, name: 'OMEGA' }]);
  assert.deepEqual(state.brands.map(({ brandId }) => brandId), [1, 2]);
});

test('a failure part-way leaves none of the new Brands, and the next refresh runs', async (t) => {
  withIpsUrl(t, 'https://ips.example');
  ipsLists(t, [
    { id: 1, name: 'OMEGA' },
    { id: 2, name: 'Lucky Star' },
  ]);
  const failing = fakeStrapi({ failCreate: (data) => (data.brandId === 2 ? new Error('disk full') : null) });
  await assert.rejects(refreshBrandsFromIps(failing.strapi), /disk full/);
  assert.deepEqual(failing.state.brands, []);

  const working = fakeStrapi();
  const summary = await refreshBrandsFromIps(working.strapi);
  assert.deepEqual(summary.added.map(({ brandId }) => brandId), [1, 2]);
});

test("a plan that can't be built uploads no logo or banners and creates nothing", async (t) => {
  withIpsUrl(t, 'https://ips.example');
  ipsLists(t, [{ id: 2, name: 'Lucky Star' }]);
  const { strapi, state } = fakeStrapi({ methods: [] });
  await assert.rejects(
    refreshBrandsFromIps(strapi),
    (error) => error instanceof errors.ApplicationError && /no Payment Method OMEGA_BANK/.test(error.message),
  );
  assert.equal(state.uploads, 0);
  assert.deepEqual(state.brands, []);
});

test('without an IPS URL it is an ApplicationError saying what to set', async (t) => {
  withIpsUrl(t, '');
  const { strapi } = fakeStrapi();
  await assert.rejects(
    refreshBrandsFromIps(strapi),
    (error) => error instanceof errors.ApplicationError && /IPS_API/.test(error.message),
  );
});

test('refuses while a seed is running or stopped part-way, before asking IPS', async (t) => {
  withIpsUrl(t, 'https://ips.example');
  const fetch = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('IPS should not be asked');
  });
  const { strapi, state } = fakeStrapi({ seedStartedAt: '2026-10-19T08:00:00.000Z' });
  await assert.rejects(
    refreshBrandsFromIps(strapi),
    (error) =>
      error instanceof errors.ApplicationError && /seed started at 2026-10-19T08:00:00.000Z/.test(error.message),
  );
  assert.equal(fetch.mock.callCount(), 0);
  assert.deepEqual(state.brands, []);
});
