'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readSeedOptions, shouldSeed } = require('./seed-inputs');
const { StarterContentError } = require('../src/seed-files.ts');

const IPS_ENV = { IPS_API: 'https://ips.example/ps/ips' };

test('the Dark Theme by default', () => {
  assert.deepEqual(readSeedOptions([], IPS_ENV), {
    theme: 'DARK',
    ipsUrl: 'https://ips.example/ps/ips',
    ifEmpty: false,
  });
});

test('--if-empty asks to skip a Strapi that already has content', () => {
  assert.equal(readSeedOptions(['--if-empty'], IPS_ENV).ifEmpty, true);
});

const EMPTY = { brands: 0, games: 0, collections: 0 };

test('an empty Strapi is seeded, with or without --if-empty', () => {
  assert.equal(shouldSeed(EMPTY, false), true);
  assert.equal(shouldSeed(EMPTY, true), true);
});

test('with --if-empty, a Strapi with any content is skipped, not refused', () => {
  assert.equal(shouldSeed({ ...EMPTY, brands: 3 }, true), false);
  assert.equal(shouldSeed({ ...EMPTY, collections: 1 }, true), false);
});

test('without --if-empty, a Strapi with content is refused, naming what it holds', () => {
  assert.throws(
    () => shouldSeed({ brands: 2, games: 5, collections: 1 }, false),
    (error) => error instanceof StarterContentError && /2 Brands, 5 Games and 1 Collections/.test(error.message),
  );
});

test('a Strapi whose seed started and never finished is refused, even with --if-empty, so a part-seeded one never passes as seeded', () => {
  const unfinished = { brands: 60, games: 42, collections: 2, seedStartedAt: '2026-10-19T09:15:00.000Z' };
  for (const ifEmpty of [true, false]) {
    assert.throws(
      () => shouldSeed(unfinished, ifEmpty),
      (error) =>
        error instanceof StarterContentError &&
        /2026-10-19T09:15:00.000Z/.test(error.message) &&
        /strapi\/data\//.test(error.message) &&
        /docker compose down -v/.test(error.message),
    );
  }
  assert.throws(() => shouldSeed({ ...EMPTY, seedStartedAt: '2026-10-19T09:15:00.000Z' }, true), StarterContentError);
});

test('the Light Theme', () => {
  assert.equal(readSeedOptions(['--theme=LIGHT'], IPS_ENV).theme, 'LIGHT');
});

test("refuses the old --games flag, as the seed's games are the same for every environment now", () => {
  assert.throws(() => readSeedOptions(['--games=omega'], IPS_ENV), /--games/);
});

test('refuses a theme other than DARK or LIGHT', () => {
  assert.throws(() => readSeedOptions(['--theme=light'], IPS_ENV), /--theme=DARK or --theme=LIGHT/);
});

test('refuses a flag it does not know, so a typo is not ignored', () => {
  assert.throws(() => readSeedOptions(['--them=LIGHT'], IPS_ENV), /--them/);
});

test('needs the IPS URL', () => {
  assert.throws(() => readSeedOptions([], {}), /IPS_API/);
});

test("in the portal image, the IPS URL falls back to the portal's PORTAL_IPS_API", () => {
  assert.equal(readSeedOptions([], { PORTAL_IPS_API: 'https://ips.example/ps/ips' }).ipsUrl, 'https://ips.example/ps/ips');
});

test('drops a trailing slash from the IPS URL', () => {
  const options = readSeedOptions([], { IPS_API: 'https://ips.example/ps/ips/' });
  assert.equal(options.ipsUrl, 'https://ips.example/ps/ips');
});

test("the seed's own refusals are StarterContentErrors, which it prints without a stack", () => {
  assert.throws(() => readSeedOptions(['--theme=light'], IPS_ENV), StarterContentError);
  assert.throws(() => readSeedOptions([], {}), StarterContentError);
});
