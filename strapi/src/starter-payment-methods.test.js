'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { StarterContentError } = require('./seed-files.ts');
const { readStarterPaymentMethods } = require('./starter-payment-methods.ts');

const SEED_DIR = path.join(__dirname, '..', 'seed');

// A seed folder holding only this payment-methods.json content and these files.
const seedFolder = (t, starterFile, files = {}) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  fs.writeFileSync(path.join(seedDir, 'payment-methods.json'), starterFile);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(seedDir, name), content);
  }
  return seedDir;
};

test('the four Payment Methods the portal handles, with PNG logos and none for CoinsPaid', () => {
  assert.deepEqual(readStarterPaymentMethods(SEED_DIR), [
    { code: 'OMEGA_BANK', name: 'OMEGA Bank', logo: path.join(SEED_DIR, 'payment-methods', 'omega-bank.png') },
    { code: 'EVOUCHER', name: 'E-Voucher', logo: path.join(SEED_DIR, 'payment-methods', 'evoucher.png') },
    { code: 'PAYMENTIQ_ALL', name: 'PaymentIQ', logo: path.join(SEED_DIR, 'payment-methods', 'paymentiq.png') },
    { code: 'COINSPAID_V2', name: 'CoinsPaid', logo: null },
  ]);
});

test('every logo file really is a PNG', () => {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (const { logo } of readStarterPaymentMethods(SEED_DIR).filter((method) => method.logo !== null)) {
    assert.deepEqual(fs.readFileSync(logo).subarray(0, 8), PNG_SIGNATURE, logo);
  }
});

test('refuses a logo that is not a PNG, as Strapi refuses SVG uploads', (t) => {
  const seedDir = seedFolder(t, JSON.stringify([{ code: 'OMEGA_BANK', name: 'OMEGA Bank', logo: 'bank.svg' }]), {
    'bank.svg': '<svg/>',
  });
  assert.throws(
    () => readStarterPaymentMethods(seedDir),
    (error) => error instanceof StarterContentError && /OMEGA Bank logo must be a PNG/.test(error.message),
  );
});

test('refuses a logo file that is missing', (t) => {
  const seedDir = seedFolder(t, JSON.stringify([{ code: 'OMEGA_BANK', name: 'OMEGA Bank', logo: 'bank.png' }]));
  assert.throws(
    () => readStarterPaymentMethods(seedDir),
    (error) => error instanceof StarterContentError && error.message.includes(`Seed image missing: ${path.join(seedDir, 'bank.png')}`),
  );
});

test('refuses a file that is not a list of Payment Methods, naming the file', (t) => {
  const seedDir = seedFolder(t, JSON.stringify([{ code: 'OMEGA_BANK', logo: null }]));
  assert.throws(
    () => readStarterPaymentMethods(seedDir),
    (error) =>
      error instanceof StarterContentError &&
      error.message.includes(path.join(seedDir, 'payment-methods.json')) &&
      /name/.test(error.message),
  );
});

test('refuses a file that is not JSON, or is missing, naming the file', (t) => {
  const brokenDir = seedFolder(t, '[{ "code": ');
  assert.throws(
    () => readStarterPaymentMethods(brokenDir),
    (error) => error instanceof StarterContentError && error.message.includes(path.join(brokenDir, 'payment-methods.json')),
  );
  const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(emptyDir, { recursive: true }));
  assert.throws(
    () => readStarterPaymentMethods(emptyDir),
    (error) => error instanceof StarterContentError && error.message.includes(path.join(emptyDir, 'payment-methods.json')),
  );
});
