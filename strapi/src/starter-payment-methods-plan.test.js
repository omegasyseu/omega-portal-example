'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { starterPaymentMethodsPlan, switchedOnSettings } = require('./starter-payment-methods-plan.ts');

const starters = [
  { code: 'OMEGA_BANK', name: 'OMEGA Bank', logo: '/seed/omega-bank.png' },
  { code: 'EVOUCHER', name: 'E-Voucher', logo: '/seed/evoucher.png' },
  { code: 'COINSPAID_V2', name: 'CoinsPaid', logo: null },
];

const row = (id, updatedAt, paymentMethods, publishedAt = null) => ({ id, updatedAt, publishedAt, paymentMethods });

const planFor = (input) => starterPaymentMethodsPlan(false, async () => ({ starters, existingCodes: [], brandRows: [], ...input }));

test('never runs again once it has run, and reads nothing then', async () => {
  const plan = await starterPaymentMethodsPlan(true, async () => {
    throw new Error('read its input although it had run');
  });
  assert.equal(plan, 'skip');
});

test('creates only the Payment Methods Strapi has no document for', async () => {
  const plan = await planFor({ existingCodes: ['EVOUCHER'] });
  assert.deepEqual(
    plan.create.map((method) => method.code),
    ['OMEGA_BANK', 'COINSPAID_V2'],
  );
});

test('fills only the Brand rows, draft or published, that have no Payment Method settings', async () => {
  const brandRows = [
    row(1, '2026-10-01T10:00:00.000Z', []),
    row(2, '2026-10-01T10:00:00.000Z', [], '2026-10-01T10:00:00.000Z'),
    row(3, '2026-10-02T10:00:00.000Z', [{ id: 7 }]),
    row(4, '2026-10-02T10:00:00.000Z', undefined, '2026-10-02T10:00:00.000Z'),
  ];
  const plan = await planFor({ brandRows });
  assert.deepEqual(
    plan.fill.map((brand) => brand.id),
    [1, 2, 4],
  );
});

test("fills each Brand's rows oldest first, so a Brand with unpublished changes still shows Modified", async () => {
  const brandRows = [
    row(1, '2026-10-03T10:00:00.000Z', []),
    row(2, '2026-10-01T10:00:00.000Z', [], '2026-10-01T10:00:00.000Z'),
    row(3, '2026-10-02T10:00:00.000Z', []),
  ];
  const plan = await planFor({ brandRows });
  assert.deepEqual(
    plan.fill.map((brand) => brand.id),
    [2, 3, 1],
  );
});

test('gives the filled rows every starter', async () => {
  const plan = await planFor({ existingCodes: ['OMEGA_BANK', 'EVOUCHER', 'COINSPAID_V2'] });
  assert.deepEqual(plan.starters, starters);
});

test('switches each Payment Method on for deposits and withdrawals, in order, with no overrides', () => {
  assert.deepEqual(switchedOnSettings(['omega-bank', 'e-voucher']), [
    { paymentMethod: 'omega-bank', deposit: true, withdrawal: true },
    { paymentMethod: 'e-voucher', deposit: true, withdrawal: true },
  ]);
});
