'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ipsUrlFrom, refreshPlan } = require('./brand-refresh-plan.ts');
const { StarterContentError } = require('./seed-files.ts');

test('adds only the IPS brands Strapi has no Brand for, reports the rest as already there', () => {
  const ips = [
    { brandId: 1, name: 'OMEGA' },
    { brandId: 9, name: 'The Palaces' },
    { brandId: 12, name: 'Lucky Star' },
  ];
  const strapi = [{ brandId: 9, name: 'Palaces (renamed in Strapi)' }];
  const plan = refreshPlan(ips, strapi);
  assert.deepEqual(plan.add, [
    { brandId: 1, name: 'OMEGA' },
    { brandId: 12, name: 'Lucky Star' },
  ]);
  assert.deepEqual(plan.existing, [{ brandId: 9, name: 'Palaces (renamed in Strapi)' }]);
});

test("reports Strapi's Brands that IPS no longer lists, and never adds them", () => {
  const plan = refreshPlan([{ brandId: 1, name: 'OMEGA' }], [
    { brandId: 1, name: 'OMEGA' },
    { brandId: 4, name: 'Closed brand' },
  ]);
  assert.deepEqual(plan.add, []);
  assert.deepEqual(plan.notInIps, [{ brandId: 4, name: 'Closed brand' }]);
});

test('a draft Brand saved without its Brand ID is neither in IPS nor blocks an IPS brand', () => {
  const plan = refreshPlan([{ brandId: 1, name: 'OMEGA' }], [{ brandId: null, name: 'Half-made' }]);
  assert.deepEqual(plan.add, [{ brandId: 1, name: 'OMEGA' }]);
  assert.deepEqual(plan.existing, []);
  assert.deepEqual(plan.notInIps, []);
});

test('gives Legal Pages to the named Brands with none, in IPS or not, and leaves out those with any', () => {
  const plan = refreshPlan([{ brandId: 1, name: 'OMEGA' }], [
    { brandId: 1, name: 'OMEGA', hasLegalPages: true },
    { brandId: 4, name: 'Closed brand', hasLegalPages: false },
    { brandId: 9, name: 'The Palaces', hasLegalPages: false },
    { brandId: null, name: null, hasLegalPages: false },
  ]);
  assert.deepEqual(plan.giveLegalPages, [
    { brandId: 4, name: 'Closed brand', hasLegalPages: false },
    { brandId: 9, name: 'The Palaces', hasLegalPages: false },
  ]);
});

test("IPS's URL is IPS_API, without a trailing slash", () => {
  assert.equal(ipsUrlFrom({ IPS_API: 'https://ips.example/ps/ips/', PORTAL_IPS_API: 'https://other' }), 'https://ips.example/ps/ips');
});

test("in the portal image, IPS's URL falls back to the portal's PORTAL_IPS_API", () => {
  assert.equal(ipsUrlFrom({ PORTAL_IPS_API: 'https://ips.example/ps/ips' }), 'https://ips.example/ps/ips');
});

test("refuses, explaining what to set, when neither gives IPS's URL", () => {
  assert.throws(
    () => ipsUrlFrom({ IPS_API: '' }),
    (error) => error instanceof StarterContentError && /IPS_API/.test(error.message) && /PORTAL_IPS_API/.test(error.message),
  );
});
