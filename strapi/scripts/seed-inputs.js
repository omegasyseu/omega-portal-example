'use strict';

const { parseArgs } = require('node:util');
const { ipsUrlFrom } = require('../src/brand-refresh-plan.ts');
const { StarterContentError } = require('../src/seed-files.ts');

// The Brand Themes in the Brand schema's theme enum (src/api/brand/content-types/brand/schema.json),
// StarterBrandInput in src/seed-data.ts and the portal's brand-themes.ts; change all four together.
const THEMES = ['DARK', 'LIGHT'];

/**
 * The seed's options, from its command-line flags and the IPS URL in the environment
 * (IPS_API, else the portal image's PORTAL_IPS_API, as for "Refresh from IPS").
 * Throws on anything missing or unknown, so a typo never seeds the wrong content.
 * @param {string[]} args
 * @param {Record<string, string | undefined>} env
 * @returns {{ theme: 'DARK' | 'LIGHT', ipsUrl: string, ifEmpty: boolean }}
 */
const readSeedOptions = (args, env) => {
  const { values } = parseArgs({
    args,
    options: {
      theme: { type: 'string', default: 'DARK' },
      'if-empty': { type: 'boolean', default: false },
    },
    strict: true,
  });
  if (!THEMES.includes(values.theme)) {
    throw new StarterContentError('Choose the Brand Theme with --theme=DARK or --theme=LIGHT (default DARK).');
  }
  return {
    theme: values.theme,
    ipsUrl: ipsUrlFrom(env),
    ifEmpty: values['if-empty'],
  };
};

/**
 * Whether to seed, given what Strapi already holds. A Strapi whose seed started and
 * never finished (`seedStartedAt` is set) holds part of a seed, so it's always refused.
 * An empty Strapi is seeded. One with any content is skipped with --if-empty (as
 * `pnpm dev:all` runs it) and refused otherwise, so the seed never overwrites edits.
 * @param {{ brands: number, games: number, collections: number, seedStartedAt?: string | null }} holds
 * @param {boolean} ifEmpty
 * @returns {boolean}
 */
const shouldSeed = ({ brands, games, collections, seedStartedAt }, ifEmpty) => {
  if (seedStartedAt) {
    throw new StarterContentError(
      `A seed started at ${seedStartedAt} and never finished, so Strapi holds only part of it (or that seed is still running). Delete all content (stop Strapi and delete \`strapi/data/\`, or \`docker compose down -v\` in Docker; either deletes every Brand, Game and upload) and seed again.`,
    );
  }
  if (brands === 0 && games === 0 && collections === 0) return true;
  if (ifEmpty) return false;
  throw new StarterContentError(
    `Strapi already has ${brands} Brands, ${games} Games and ${collections} Collections. The seed only fills an empty Strapi, so it never overwrites edits.`,
  );
};

module.exports = { readSeedOptions, shouldSeed };
