'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { expectShape, RESPONSES, withFields } = require('./lobby-responses.ts');

const game = {
  documentId: 'a',
  title: 'Aztec Fire',
  provider: 'THREEOAKS',
  gameId: 'aztec_fire',
  category: 'slots',
  status: 'draft',
  tile: { url: '/uploads/aztec.avif', formats: { thumbnail: { url: '/uploads/thumb_aztec.avif' } } },
  locale: null,
};

test('a page of games in the shape the editor reads is read as it is', () => {
  const page = { results: [game, { ...game, documentId: 'b', tile: null }], pagination: { pageCount: 1, total: 2 } };
  const read = expectShape(RESPONSES.gamesPage, page, 'the catalogue');
  assert.equal(read.results.length, 2);
  assert.equal(read.results[0].tile.formats.thumbnail.url, '/uploads/thumb_aztec.avif');
  assert.equal(read.results[1].tile, null);
});

test('a draft saved without its required fields is read, then left out until they are filled in', () => {
  const draft = { ...game, documentId: 'b', provider: null, gameId: null, category: null, tile: null };
  const page = { results: [game, draft], pagination: { pageCount: 1 } };
  const { results } = expectShape(RESPONSES.gamesPage, page, 'the catalogue');
  assert.deepEqual(
    withFields(results, ['title', 'provider', 'gameId', 'category']).map((read) => read.documentId),
    ['a'],
  );
});

test('a page without its page count fails, naming what was being read', () => {
  assert.throws(
    () => expectShape(RESPONSES.gamesPage, { results: [game] }, 'the catalogue'),
    /the catalogue.*unexpected shape[\s\S]*pagination/,
  );
});

test('a game with a status the editor does not know fails', () => {
  const page = { results: [{ ...game, status: 'archived' }], pagination: { pageCount: 1 } };
  assert.throws(() => expectShape(RESPONSES.gamesPage, page, 'the catalogue'), /status/);
});

test("a Brand's saved Collections are read by their component entry IDs", () => {
  const brand = { data: { status: 'modified', collections: [{ id: 4 }, { id: 7 }], name: 'Omega Wins' } };
  assert.deepEqual(expectShape(RESPONSES.brand, brand, 'the Brand').data.collections, [{ id: 4 }, { id: 7 }]);
});

test('a Brand answer without its document fails instead of saving blind', () => {
  assert.throws(() => expectShape(RESPONSES.brand, { error: 'nope' }, 'the Brand'), /the Brand/);
});
