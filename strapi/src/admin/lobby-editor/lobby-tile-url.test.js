'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { tileUrlFor } = require('./lobby-responses.ts');

const tile = (url, thumbnail) => ({ url, formats: thumbnail ? { thumbnail: { url: thumbnail } } : null });

test("a tile Strapi stores itself loads from Strapi's own address, as the Content Manager's images do", () => {
  // Behind the image's nginx the admin runs under /strapi; /uploads alone reaches the portal.
  assert.equal(tileUrlFor(tile('/uploads/a.avif', '/uploads/thumbnail_a.avif'), '/strapi'), '/strapi/uploads/thumbnail_a.avif');
  assert.equal(tileUrlFor(tile('/uploads/a.avif'), '/strapi'), '/strapi/uploads/a.avif');
  assert.equal(tileUrlFor(tile('/uploads/a.avif'), ''), '/uploads/a.avif');
});

test('a tile an upload provider stores elsewhere keeps its own address', () => {
  assert.equal(tileUrlFor(tile('https://cdn.example.com/a.avif'), '/strapi'), 'https://cdn.example.com/a.avif');
});

test('a game without a tile has none', () => {
  assert.equal(tileUrlFor(null, '/strapi'), null);
});
