'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const brand = require('./schema.json');
const { FEATURE_VISIBILITY, FEATURE_VISIBILITY_FIELD, switchedOn } = require('../../../../feature-visibility.ts');

test('a Brand keeps its Feature visibility in one field the admin shows as a panel of switches', () => {
  assert.deepEqual(brand.attributes.featureVisibility, {
    type: 'customField',
    customField: `global::${FEATURE_VISIBILITY_FIELD.name}`,
  });
  assert.equal(FEATURE_VISIBILITY_FIELD.type, 'json');
  for (const old of ['showJackpot', 'showChallenge', 'showLevelUp', 'showQuest', 'showLeaderboard']) {
    assert.equal(brand.attributes[old], undefined, old);
  }
});

test('the panel has a switch per Engage Feature, under the keys the portal reads', () => {
  assert.deepEqual(
    FEATURE_VISIBILITY.map(({ key, label }) => [key, label]),
    [
      ['jackpot', 'Jackpot'],
      ['challenge', 'Challenge'],
      ['levelUp', 'Level Up'],
      ['quest', 'Quest'],
      ['leaderboard', 'Leaderboard'],
    ],
  );
});

test('a switch is on unless the Brand saved it off', () => {
  assert.equal(switchedOn(null, 'jackpot'), true);
  assert.equal(switchedOn({}, 'jackpot'), true);
  assert.equal(switchedOn({ jackpot: null }, 'jackpot'), true);
  assert.equal(switchedOn({ jackpot: false }, 'jackpot'), false);
  assert.equal(switchedOn({ jackpot: false }, 'quest'), true);
});
