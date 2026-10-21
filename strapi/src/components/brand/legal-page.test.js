'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const brand = require('../../api/brand/content-types/brand/schema.json');
const legalPage = require('./legal-page.json');

// The portal links to these five Legal Pages by slug (/legal/<page>), so the enum is part of
// its contract.
test("a Brand lists its Legal Pages, one per page the portal links to", () => {
  assert.deepEqual(brand.attributes.legalPages, {
    type: 'component',
    component: 'brand.legal-page',
    repeatable: true,
  });
  assert.deepEqual(legalPage.attributes.page.enum, [
    'gaming-rules',
    'player-protection',
    'terms',
    'privacy',
    'complaints',
  ]);
});

test('a Legal Page has a title, a rich-text body and an optional last-updated date', () => {
  const { page, title, body, updatedOn } = legalPage.attributes;
  assert.equal(page.required, true);
  assert.equal(title.type, 'string');
  assert.equal(title.required, true);
  assert.equal(body.type, 'blocks');
  assert.equal(updatedOn.type, 'date');
  assert.notEqual(updatedOn.required, true);
});
