'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { repeatedPaymentMethods } = require('./brand-payment-methods.ts');

const setting = (documentId, name) => ({ paymentMethod: { documentId, name } });
const omegaBank = setting('a', 'OMEGA Bank');
const eVoucher = setting('b', 'E-Voucher');

test('a Brand listing each Payment Method once is fine', () => {
  assert.deepEqual(repeatedPaymentMethods({ paymentMethods: [omegaBank, eVoucher] }), []);
});

test('names each Payment Method the Brand lists more than once, once', () => {
  const brand = { paymentMethods: [omegaBank, eVoucher, omegaBank, eVoucher, omegaBank] };
  assert.deepEqual(repeatedPaymentMethods(brand), ['OMEGA Bank', 'E-Voucher']);
});

test('two different Payment Methods with the same name are judged apart', () => {
  const bank = setting('c', 'OMEGA Bank');
  assert.deepEqual(repeatedPaymentMethods({ paymentMethods: [omegaBank, bank] }), []);
  assert.deepEqual(repeatedPaymentMethods({ paymentMethods: [omegaBank, bank, bank] }), ['OMEGA Bank']);
});

test('settings with no Payment Method chosen, and a Brand with none, are fine', () => {
  assert.deepEqual(repeatedPaymentMethods({ paymentMethods: [{ paymentMethod: null }, { paymentMethod: null }] }), []);
  assert.deepEqual(repeatedPaymentMethods({}), []);
});
