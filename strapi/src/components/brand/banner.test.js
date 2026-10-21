'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const banner = require('./banner.json');

// The banner link rule Strapi checks on save. The portal checks the same rule before it
// shows a banner (PORTAL_PATH in src/providers/brand-content/brand-content.ts), so a link
// Strapi accepts is never silently dropped by the portal.
const link = new RegExp(banner.attributes.link.regex);

test('accepts a portal path or the jackpot dialog', () => {
  for (const value of ['/leaderboard', '/bonus?tab=new', '/', 'dialog:jackpot']) {
    assert.ok(link.test(value), value);
  }
});

test('refuses a link that leaves the portal', () => {
  for (const value of ['https://elsewhere.example.com', '//elsewhere.example.com', '/\\elsewhere.example.com']) {
    assert.ok(!link.test(value), value);
  }
});

test('refuses whitespace, a bare word and an unknown dialog', () => {
  for (const value of ['/leader board', '/leaderboard ', '/\tleaderboard', 'leaderboard', '', 'dialog:cashback']) {
    assert.ok(!link.test(value), JSON.stringify(value));
  }
});
