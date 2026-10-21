'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  addCollection,
  brandUpdate,
  gamesLeavingCollections,
  hasUnsavedSelectionChanges,
  moveCollection,
  removeCollection,
  withCollectionGames,
  withLobby,
} = require('./lobby-selection.ts');

// A Brand whose lobby lists games a to d, with Slots (s) holding b and a, and Featured (f) holding a.
const selection = () => ({
  lobby: ['a', 'b', 'c', 'd'],
  collections: [
    { collectionId: 's', games: ['b', 'a'] },
    { collectionId: 'f', games: ['a'] },
  ],
});

test('a Collection added to the Brand goes at the end, holding no games yet', () => {
  assert.deepEqual(addCollection(selection(), 'n').collections, [
    { collectionId: 's', games: ['b', 'a'] },
    { collectionId: 'f', games: ['a'] },
    { collectionId: 'n', games: [] },
  ]);
});

test('adding a Collection the Brand already shows changes nothing', () => {
  assert.deepEqual(addCollection(selection(), 'f'), selection());
});

test('removing a Collection from the Brand keeps the others in order', () => {
  assert.deepEqual(removeCollection(selection(), 's').collections, [{ collectionId: 'f', games: ['a'] }]);
});

test("moving a Collection changes the order the Brand's menu and tabs show them in", () => {
  assert.deepEqual(
    moveCollection(selection(), 1, 0).collections.map((collection) => collection.collectionId),
    ['f', 's'],
  );
  assert.deepEqual(moveCollection(selection(), 1, 2), selection());
});

test("picking and ordering a Collection's games leaves the other Collections and the lobby alone", () => {
  const picked = withCollectionGames(selection(), 'f', ['c', 'a']);
  assert.deepEqual(picked, {
    lobby: ['a', 'b', 'c', 'd'],
    collections: [
      { collectionId: 's', games: ['b', 'a'] },
      { collectionId: 'f', games: ['c', 'a'] },
    ],
  });
});

test('a game taken out of the lobby leaves every Collection that held it', () => {
  assert.deepEqual(withLobby(selection(), ['b', 'c', 'd']), {
    lobby: ['b', 'c', 'd'],
    collections: [
      { collectionId: 's', games: ['b'] },
      { collectionId: 'f', games: [] },
    ],
  });
});

test('reordering the lobby leaves the order of the games in each Collection alone', () => {
  assert.deepEqual(withLobby(selection(), ['d', 'c', 'b', 'a']).collections, selection().collections);
});

test('before saving, lists each game leaving the lobby with the saved Collections it leaves', () => {
  const saved = selection();
  const current = withLobby(saved, ['b', 'c', 'd']);
  assert.deepEqual(gamesLeavingCollections(saved, current), [{ documentId: 'a', collectionIds: ['s', 'f'] }]);
});

test('a game leaving the lobby that no Collection held, or one ticked again, is not listed', () => {
  const saved = selection();
  assert.deepEqual(gamesLeavingCollections(saved, withLobby(saved, ['a', 'b', 'c'])), []);
  const tickedAgain = withLobby(withLobby(saved, ['b', 'c', 'd']), ['b', 'c', 'd', 'a']);
  assert.deepEqual(gamesLeavingCollections(saved, tickedAgain), []);
});

test('the selection has unsaved changes when the lobby, the Collections, their order or their games differ', () => {
  const saved = selection();
  assert.equal(hasUnsavedSelectionChanges(saved, selection()), false);
  assert.equal(hasUnsavedSelectionChanges(saved, withLobby(saved, ['d', 'c', 'b', 'a'])), true);
  assert.equal(hasUnsavedSelectionChanges(saved, moveCollection(saved, 0, 1)), true);
  assert.equal(hasUnsavedSelectionChanges(saved, withCollectionGames(saved, 's', ['a', 'b'])), true);
  assert.equal(hasUnsavedSelectionChanges(saved, removeCollection(saved, 'f')), true);
  assert.equal(hasUnsavedSelectionChanges(saved, removeCollection(addCollection(saved, 'n'), 'n')), false);
});

test('saving sends the lobby and every Collection with its games, each as a whole ordered list', () => {
  assert.deepEqual(brandUpdate(selection()), {
    lobby: { set: [{ documentId: 'a' }, { documentId: 'b' }, { documentId: 'c' }, { documentId: 'd' }] },
    collections: [
      { collection: { set: [{ documentId: 's' }] }, games: { set: [{ documentId: 'b' }, { documentId: 'a' }] } },
      { collection: { set: [{ documentId: 'f' }] }, games: { set: [{ documentId: 'a' }] } },
    ],
  });
});

test('none of these change the selection they are given', () => {
  const given = selection();
  addCollection(given, 'n');
  removeCollection(given, 's');
  moveCollection(given, 0, 1);
  withCollectionGames(given, 's', []);
  withLobby(given, []);
  assert.deepEqual(given, selection());
});
