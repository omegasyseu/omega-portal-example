'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { brandsFromIps, fetchIpsBrands } = require('./ips-brands.ts');
const { StarterContentError } = require('./seed-files.ts');

test('one Brand per IPS brand, with its ID and name', () => {
  const body = {
    status: 'SUCCESS',
    brands: [
      { id: 1, name: 'OMEGA', isSocialBrand: false },
      { id: 9, name: 'The Palaces', isSocialBrand: false },
    ],
  };
  assert.deepEqual(brandsFromIps(body), [
    { brandId: 1, name: 'OMEGA' },
    { brandId: 9, name: 'The Palaces' },
  ]);
});

test('refuses a response IPS did not mark as a success', () => {
  const body = { status: 'FAIL', message: 'Something went wrong', errors: [] };
  assert.throws(() => brandsFromIps(body), /IPS \/getBrands did not succeed: FAIL Something went wrong/);
});

test('refuses an IPS response with no brands', () => {
  assert.throws(() => brandsFromIps({ status: 'SUCCESS', brands: [] }), /IPS lists no brands/);
  assert.throws(() => brandsFromIps({ status: 'SUCCESS' }), /IPS lists no brands/);
});

test('refuses a brand without a whole-number ID or a name', () => {
  const body = { status: 'SUCCESS', brands: [{ id: '1', name: 'OMEGA' }] };
  assert.throws(() => brandsFromIps(body), /IPS brand {"id":"1","name":"OMEGA"}/);
  assert.throws(() => brandsFromIps({ status: 'SUCCESS', brands: [{ id: 1 }] }), /IPS brand {"id":1}/);
  assert.throws(() => brandsFromIps({ status: 'SUCCESS', brands: [null] }), StarterContentError);
  assert.throws(() => brandsFromIps(null), StarterContentError);
});

test('an IPS that answers with an HTTP error is a StarterContentError naming the status, without a blank status text', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  await assert.rejects(
    fetchIpsBrands('https://ips.example/ps/ips'),
    (error) => error instanceof StarterContentError && error.message === 'IPS https://ips.example/ps/ips/getBrands answered 404.',
  );
});

test('its refusals are StarterContentErrors, which the seed prints without a stack', () => {
  assert.throws(() => brandsFromIps({ status: 'SUCCESS', brands: [] }), StarterContentError);
});
