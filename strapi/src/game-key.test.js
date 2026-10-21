'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { gameKey } = require('./game-key.ts');

test("a Game's key is its provider and game ID, as the portal builds it", () => {
  assert.equal(gameKey('EVOLUTION', 'lightning-roulette'), 'EVOLUTION:lightning-roulette');
});
