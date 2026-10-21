'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  categoriesOf,
  clearGames,
  filterGames,
  gameCount,
  hasListChanged,
  lobbyUpdate,
  moveInList,
  selectGames,
  toggleGame,
} = require('./lobby-selection.ts');

const game = (documentId, title, provider, gameId, category) => ({ documentId, title, provider, gameId, category });

const catalogue = [
  game('a', 'Aztec Fire', 'THREEOAKS', 'aztec_fire', 'slots'),
  game('b', 'Sweet Bonanza 1000', 'PRAGMATIC', 'vs20fruitsw', 'slots'),
  game('c', 'Kambi', 'KAMBI', 'sportsbook', 'sportsbook'),
  game('d', 'The Dog House', 'PRAGMATIC', 'vs20doghouse', 'slots'),
];

const titles = (games) => games.map((g) => g.title);

test('the category filter offers each category the catalogue uses, once, in alphabetical order', () => {
  assert.deepEqual(categoriesOf(catalogue), ['slots', 'sportsbook']);
  assert.deepEqual(categoriesOf([game('x', 'Live Roulette', 'EVO', 'roulette', 'live'), ...catalogue]), [
    'live',
    'slots',
    'sportsbook',
  ]);
  assert.deepEqual(categoriesOf([]), []);
});

test('with no category and no search, every game is shown', () => {
  assert.deepEqual(titles(filterGames(catalogue, { category: null, search: '' })), [
    'Aztec Fire',
    'Sweet Bonanza 1000',
    'Kambi',
    'The Dog House',
  ]);
});

test('a category shows only its games', () => {
  assert.deepEqual(titles(filterGames(catalogue, { category: 'sportsbook', search: '' })), ['Kambi']);
});

test('the search matches a title, provider or game ID, ignoring case and spaces around it', () => {
  const search = (text) => titles(filterGames(catalogue, { category: null, search: text }));
  assert.deepEqual(search('dog'), ['The Dog House']);
  assert.deepEqual(search('  pragmatic '), ['Sweet Bonanza 1000', 'The Dog House']);
  assert.deepEqual(search('AZTEC_FIRE'), ['Aztec Fire']);
  assert.deepEqual(search('kambi:sports'), ['Kambi']);
  assert.deepEqual(search('roulette'), []);
});

test('the search and category apply together', () => {
  assert.deepEqual(titles(filterGames(catalogue, { category: 'sportsbook', search: 'pragmatic' })), []);
  assert.deepEqual(titles(filterGames(catalogue, { category: 'slots', search: 'pragmatic' })), [
    'Sweet Bonanza 1000',
    'The Dog House',
  ]);
});

test('ticking a game adds it at the end of the lobby', () => {
  assert.deepEqual(toggleGame(['d', 'a'], 'c'), ['d', 'a', 'c']);
  assert.deepEqual(toggleGame([], 'b'), ['b']);
});

test('unticking a game removes it and keeps the rest in order', () => {
  assert.deepEqual(toggleGame(['d', 'a', 'c'], 'a'), ['d', 'c']);
});

test('toggling never changes the lobby it is given', () => {
  const lobby = ['d', 'a'];
  toggleGame(lobby, 'c');
  toggleGame(lobby, 'a');
  assert.deepEqual(lobby, ['d', 'a']);
});

test('"Select all" adds the filtered games not yet in the lobby at the end, in catalogue order', () => {
  const slots = filterGames(catalogue, { category: 'slots', search: '' });
  assert.deepEqual(selectGames(['c', 'd'], slots), ['c', 'd', 'a', 'b']);
});

test('"Select all" with every filtered game already in the lobby changes nothing', () => {
  const slots = filterGames(catalogue, { category: 'slots', search: '' });
  assert.deepEqual(selectGames(['d', 'b', 'a'], slots), ['d', 'b', 'a']);
});

test('"Clear" removes only the filtered games and keeps the rest in order', () => {
  const pragmatic = filterGames(catalogue, { category: null, search: 'pragmatic' });
  assert.deepEqual(clearGames(['d', 'c', 'b', 'a'], pragmatic), ['c', 'a']);
});

test('"Select all" and "Clear" never change the lobby they are given', () => {
  const lobby = ['d'];
  selectGames(lobby, catalogue);
  clearGames(lobby, catalogue);
  assert.deepEqual(lobby, ['d']);
});

test('moving a game puts it at the new position and shifts the games between', () => {
  assert.deepEqual(moveInList(['a', 'b', 'c', 'd'], 0, 2), ['b', 'c', 'a', 'd']);
  assert.deepEqual(moveInList(['a', 'b', 'c', 'd'], 3, 0), ['d', 'a', 'b', 'c']);
  assert.deepEqual(moveInList(['a', 'b', 'c', 'd'], 1, 1), ['a', 'b', 'c', 'd']);
});

test('a move past either end of the lobby changes nothing', () => {
  assert.deepEqual(moveInList(['a', 'b'], 0, -1), ['a', 'b']);
  assert.deepEqual(moveInList(['a', 'b'], 1, 2), ['a', 'b']);
});

test('moving never changes the lobby it is given', () => {
  const lobby = ['a', 'b', 'c'];
  moveInList(lobby, 0, 2);
  assert.deepEqual(lobby, ['a', 'b', 'c']);
});

test('saving sends only the lobby, as the whole ordered list of games', () => {
  const lobby = moveInList(toggleGame(toggleGame(['a', 'b'], 'c'), 'a'), 1, 0);
  assert.deepEqual(lobbyUpdate(lobby), {
    lobby: { set: [{ documentId: 'c' }, { documentId: 'b' }] },
  });
});

test('an empty lobby saves as an empty list', () => {
  assert.deepEqual(lobbyUpdate([]), { lobby: { set: [] } });
});

test('a count of games reads "1 game", and "games" for any other number', () => {
  assert.equal(gameCount(1), '1 game');
  assert.equal(gameCount(0), '0 games');
  assert.equal(gameCount(42), '42 games');
});

test('a lobby has unsaved changes when its games or their order differ from the saved one', () => {
  assert.equal(hasListChanged(['a', 'b'], ['a', 'b']), false);
  assert.equal(hasListChanged(['a', 'b'], ['b', 'a']), true);
  assert.equal(hasListChanged(['a', 'b'], ['a']), true);
  assert.equal(hasListChanged(['a', 'b'], toggleGame(toggleGame(['a', 'b'], 'c'), 'c')), false);
});
