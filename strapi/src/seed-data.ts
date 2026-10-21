import path from 'node:path';
import { z } from 'zod';
import { gameKey } from './game-key.ts';
import { markdownBlocks } from './markdown-blocks.ts';
import { readSeedFile, readSeedText, StarterContentError, seedImageAt } from './seed-files.ts';
import { switchedOnSettings } from './starter-payment-methods-plan.ts';
import { readStarterPaymentMethods } from './starter-payment-methods.ts';

const text = z.string().min(1);

/**
 * Strapi's store entry the seed sets when it starts writing and clears once it has created
 * everything, so a seed that stopped part-way is never mistaken for a finished one, and
 * "Refresh from IPS" never runs beside one.
 */
export const SEED_STARTED = { type: 'api', name: 'seed', key: 'started-at' } as const;

// seed/games.json: the seed's games, in lobby order, each tile a path under seed/tiles.
const GAMES_FILE = z.array(z.object({ title: text, provider: text, gameId: text, category: text, tile: text }));

// seed/brand.json: a logo per Brand Theme and the lobby banners, as paths in the seed folder.
const BRAND_FILE = z.object({
  logos: z.record(z.string(), text),
  banners: z.array(z.object({ title: text, buttonText: text, link: text, image: text })),
});

/** A Collection the seed creates, with the Game Category whose games it holds. */
export type SeedCollection = { name: string; slug: string; icon: string; category: string };

// The Collections the seed gives every Brand, one per Game Category, so the portal's menu
// and tabs look as they did when they were built from categories.
const CATEGORY_COLLECTIONS: SeedCollection[] = [
  { name: 'Slots', slug: 'slots', icon: 'dice', category: 'slots' },
  { name: 'Sports', slug: 'sports', icon: 'dice', category: 'sportsbook' },
];

// Both Collections, ordered as each category first appears in the seed's games, which is
// how the portal ordered its category tabs. One with none of the seed's games goes last.
const collectionsFor = (games: Array<{ category: string }>) => {
  const order = games.map((game) => game.category);
  const position = ({ category }: SeedCollection) => (order.includes(category) ? order.indexOf(category) : order.length);
  return [...CATEGORY_COLLECTIONS].sort((a, b) => position(a) - position(b));
};

// The Legal Pages every Brand starts with, each read from seed/legal/<page>.md. The same
// slugs, in this order, are the Legal Page component's page enumeration
// (src/components/brand/legal-page.json) and the portal's LEGAL_PAGES
// (src/components/legal/legal-page-model.ts); change all three together.
const LEGAL_PAGES = ['gaming-rules', 'player-protection', 'terms', 'privacy', 'complaints'] as const;
type LegalPageName = (typeof LEGAL_PAGES)[number];

// A seed Legal Page: its first line's `# ` heading is its title, the rest its markdown body.
const seedLegalPage = (file: string, page: LegalPageName) => {
  const [first, ...rest] = readSeedText(file).split('\n');
  if (!first.startsWith('# ')) {
    throw new StarterContentError(`Seed file ${file} doesn't start with a "# " title.`);
  }
  return { page, title: first.slice(2).trim(), markdown: rest.join('\n') };
};

/**
 * All the seed content for the chosen Brand Theme: the games, banners and logo, the
 * Collections to fill from the games' categories, the starter Payment Methods and the Legal
 * Pages' markdown. Every image is an absolute path that exists. A missing or broken seed
 * file is a StarterContentError.
 */
export const readSeedData = (seedDir: string, { theme }: { theme: string }) => {
  const games = readSeedFile(path.join(seedDir, 'games.json'), GAMES_FILE);
  const brandFile = path.join(seedDir, 'brand.json');
  const brand = readSeedFile(brandFile, BRAND_FILE);
  if (!brand.logos[theme]) {
    throw new StarterContentError(`Seed file ${brandFile} has no ${theme} logo.`);
  }
  return {
    games: games.map((game) => ({ ...game, tile: seedImageAt(seedDir, 'tiles', game.tile) })),
    banners: brand.banners.map((banner) => ({ ...banner, image: seedImageAt(seedDir, banner.image) })),
    logo: seedImageAt(seedDir, brand.logos[theme]),
    collections: collectionsFor(games),
    paymentMethods: readStarterPaymentMethods(seedDir),
    legalPages: LEGAL_PAGES.map((page) => seedLegalPage(path.join(seedDir, 'legal', `${page}.md`), page)),
  };
};

export type SeedData = ReturnType<typeof readSeedData>;

type Created = { documentId: string; category: string };

/**
 * A Brand's entries for the created Collections: each holds the created Games of its
 * category, in lobby order. A Collection with none of the seed's games is left off.
 * @param games the lobby, in order
 */
export const brandCollections = (collections: Created[], games: Created[]) =>
  collections.flatMap(({ documentId, category }) => {
    const inCategory = games.filter((game) => game.category === category).map((game) => game.documentId);
    return inCategory.length > 0 ? [{ collection: documentId, games: inCategory }] : [];
  });

/**
 * What a starter Brand is made from: the seed's content and what Strapi holds of it. Its
 * logo and banners are added once every Brand has been built, so a seed or Strapi that
 * can't make one uploads nothing.
 */
export type StarterBrandInput = {
  theme: 'DARK' | 'LIGHT';
  seed: {
    games: Array<{ provider: string; gameId: string; category: string }>;
    collections: Array<{ slug: string; category: string }>;
    paymentMethods: Array<{ code: string }>;
    legalPages: Array<{ page: LegalPageName; title: string; markdown: string }>;
  };
  held: {
    games: Array<{ key?: string | null; documentId: string }>;
    collections: Array<{ slug?: string | null; documentId: string }>;
    paymentMethods: Array<{ code?: string | null; documentId: string }>;
  };
};

/**
 * A Brand with the seed's starter content but its logo and banners: the theme, a lobby of
 * every seed game in the seed's order, the seed's Collections filled as the seed fills them,
 * every starter Payment Method switched on, and the seed's Legal Pages in the Brand's name.
 * The seed and "Refresh from IPS" both build Brands with it. Seed games and Collections
 * Strapi no longer holds are left out; a missing starter Payment Method is a
 * StarterContentError, as for the seed.
 */
export const starterBrand = (
  brand: { brandId: number; name: string },
  { theme, seed, held }: StarterBrandInput,
) => {
  const games = seed.games.flatMap(({ provider, gameId, category }) => {
    const game = held.games.find(({ key }) => key === gameKey(provider, gameId));
    return game ? [{ documentId: game.documentId, category }] : [];
  });
  const collections = seed.collections.flatMap(({ slug, category }) => {
    const collection = held.collections.find((candidate) => candidate.slug === slug);
    return collection ? [{ documentId: collection.documentId, category }] : [];
  });
  return {
    ...brand,
    theme,
    lobby: games.map((game) => game.documentId),
    collections: brandCollections(collections, games),
    paymentMethods: brandPaymentMethods(seed.paymentMethods, held.paymentMethods),
    legalPages: starterLegalPages(seed.legalPages, brand.name),
  };
};

/**
 * The seed's Legal Pages in this Brand name, as Brand Legal Page components. Starter Brands
 * get them, and "Refresh from IPS" gives them to Brands that have none. The name goes into
 * the text after the markdown is read, so a name is never read as markdown.
 */
export const starterLegalPages = (legalPages: StarterBrandInput['seed']['legalPages'], name: string) => {
  const inBrandName = (text: string) => text.split('{{brand}}').join(name);
  const inBrandNameNode = <Node extends object>(node: Node): Node => {
    if ('text' in node && typeof node.text === 'string') return { ...node, text: inBrandName(node.text) };
    if ('children' in node && Array.isArray(node.children)) {
      return { ...node, children: node.children.map(inBrandNameNode) };
    }
    return node;
  };
  return legalPages.map(({ page, title, markdown }) => ({
    page,
    title: inBrandName(title),
    body: markdownBlocks(markdown).map(inBrandNameNode),
  }));
};

/**
 * A Brand's Payment Method settings: each starter Payment Method, in the starters' order,
 * switched on for deposits and withdrawals, with no name or logo of the Brand's own.
 * @param methods every Payment Method in Strapi
 */
export const brandPaymentMethods = (
  starters: Array<{ code: string }>,
  methods: Array<{ code?: string | null; documentId: string }>,
) =>
  switchedOnSettings(
    starters.map(({ code }) => {
      const method = methods.find((candidate) => candidate.code === code);
      if (!method) {
        throw new StarterContentError(`Strapi has no Payment Method ${code}, so the Brands can't show it.`);
      }
      return method.documentId;
    }),
  );
