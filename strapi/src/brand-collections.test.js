'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { collectionGamesOutsideLobby } = require('./brand-collections.ts');

const game = (documentId, title) => ({ documentId, title });
const aztecFire = game('a', 'Aztec Fire');
const hitTheGold = game('b', 'Hit the Gold');
const kambi = game('c', 'KAMBI');

test("a Brand whose Collections hold only games from its lobby is fine", () => {
  const brand = {
    lobby: [aztecFire, hitTheGold, kambi],
    collections: [
      { collection: { name: 'Slots' }, games: [hitTheGold, aztecFire] },
      { collection: { name: 'Sports' }, games: [kambi] },
    ],
  };
  assert.deepEqual(collectionGamesOutsideLobby(brand), []);
});

test("names each Collection that holds games the lobby doesn't list, with those games", () => {
  const brand = {
    lobby: [aztecFire],
    collections: [
      { collection: { name: 'Slots' }, games: [aztecFire, hitTheGold] },
      { collection: { name: 'Sports' }, games: [kambi] },
    ],
  };
  assert.deepEqual(collectionGamesOutsideLobby(brand), [
    { collection: 'Slots', games: ['Hit the Gold'] },
    { collection: 'Sports', games: ['KAMBI'] },
  ]);
});

test('a Brand with no lobby or no Collections is fine', () => {
  assert.deepEqual(collectionGamesOutsideLobby({ lobby: [], collections: [] }), []);
  assert.deepEqual(collectionGamesOutsideLobby({}), []);
});

test('an entry whose Collection was deleted is still checked, under a placeholder name', () => {
  const brand = { lobby: [], collections: [{ collection: null, games: [kambi] }] };
  assert.deepEqual(collectionGamesOutsideLobby(brand), [{ collection: 'A deleted Collection', games: ['KAMBI'] }]);
});
