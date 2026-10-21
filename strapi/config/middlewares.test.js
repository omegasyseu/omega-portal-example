'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { default: middlewares, portalOriginWarning } = require('./middlewares.ts');

const corsOrigins = (vars) => {
  const env = (key) => vars[key];
  return middlewares({ env }).find((entry) => entry.name === 'strapi::cors').config.origin;
};

test('lets browsers call the API from PORTAL_ORIGIN, as local development needs', () => {
  assert.deepEqual(corsOrigins({ PORTAL_ORIGIN: 'http://localhost:3000' }), ['http://localhost:3000']);
});

test('allows no other origin without PORTAL_ORIGIN, since the image serves the portal and Strapi from one origin', () => {
  assert.deepEqual(corsOrigins({}), []);
});

test('warns at start without PORTAL_ORIGIN outside the image, as local development needs it', () => {
  assert.match(
    portalOriginWarning({ NODE_ENV: 'development' }),
    /browsers can't call the API from any other origin; local development needs PORTAL_ORIGIN/,
  );
});

test('no warning with PORTAL_ORIGIN, or in the image, which runs in production without it on purpose', () => {
  assert.equal(portalOriginWarning({ NODE_ENV: 'development', PORTAL_ORIGIN: 'http://localhost:3000' }), null);
  assert.equal(portalOriginWarning({ NODE_ENV: 'production' }), null);
});
