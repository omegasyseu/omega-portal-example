'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { StarterContentError } = require('./seed-files.ts');
const { brandCollections, brandPaymentMethods, readSeedData, starterBrand } = require('./seed-data.ts');

const SEED_DIR = path.join(__dirname, '..', 'seed');

test("each created Collection holds its category's created Games in lobby order, and one with none is left off", () => {
  const games = [
    { documentId: 'aztec-fire', category: 'slots' },
    { documentId: 'kambi', category: 'sportsbook' },
    { documentId: 'hit-the-gold', category: 'slots' },
  ];
  const collections = [
    { documentId: 'sports', category: 'sportsbook' },
    { documentId: 'slots', category: 'slots' },
    { documentId: 'live', category: 'live' },
  ];
  assert.deepEqual(brandCollections(collections, games), [
    { collection: 'sports', games: ['kambi'] },
    { collection: 'slots', games: ['aztec-fire', 'hit-the-gold'] },
  ]);
});

test('a seeded Brand shows every starter Payment Method for deposits and withdrawals, with no overrides', () => {
  const starters = [{ code: 'OMEGA_BANK' }, { code: 'EVOUCHER' }];
  const methods = [
    { code: 'EVOUCHER', documentId: 'e-voucher' },
    { code: 'NETELLER', documentId: 'neteller' },
    { code: 'OMEGA_BANK', documentId: 'omega-bank' },
  ];
  assert.deepEqual(brandPaymentMethods(starters, methods), [
    { paymentMethod: 'omega-bank', deposit: true, withdrawal: true },
    { paymentMethod: 'e-voucher', deposit: true, withdrawal: true },
  ]);
});

test('refuses to seed Brands when a starter Payment Method is missing from Strapi', () => {
  assert.throws(
    () => brandPaymentMethods([{ code: 'OMEGA_BANK', name: 'OMEGA Bank' }], []),
    /Strapi has no Payment Method OMEGA_BANK/,
  );
});

const SEED = {
  games: [
    { provider: 'THREEOAKS', gameId: 'aztec_fire', category: 'slots' },
    { provider: 'KAMBI', gameId: 'KAMBI_GAME_ID', category: 'sportsbook' },
    { provider: 'THREEOAKS', gameId: 'hit_the_gold', category: 'slots' },
  ],
  collections: [
    { slug: 'slots', category: 'slots' },
    { slug: 'sports', category: 'sportsbook' },
  ],
  paymentMethods: [{ code: 'OMEGA_BANK' }, { code: 'EVOUCHER' }],
  legalPages: [],
};
test("a starter Brand has the seed's content: its theme, every seed game in seed order, both Collections and every starter Payment Method", () => {
  const held = {
    games: [
      { key: 'THREEOAKS:hit_the_gold', documentId: 'hit-the-gold' },
      { key: 'KAMBI:KAMBI_GAME_ID', documentId: 'kambi' },
      { key: 'THREEOAKS:aztec_fire', documentId: 'aztec-fire' },
      { key: 'EDITOR:added_later', documentId: 'added-later' },
    ],
    collections: [
      { slug: 'sports', documentId: 'sports' },
      { slug: 'slots', documentId: 'slots' },
    ],
    paymentMethods: [
      { code: 'EVOUCHER', documentId: 'e-voucher' },
      { code: 'OMEGA_BANK', documentId: 'omega-bank' },
    ],
  };
  const brand = starterBrand({ brandId: 12, name: 'Lucky Star' }, { theme: 'DARK', seed: SEED, held });
  assert.deepEqual(brand, {
    brandId: 12,
    name: 'Lucky Star',
    theme: 'DARK',
    lobby: ['aztec-fire', 'kambi', 'hit-the-gold'],
    collections: [
      { collection: 'slots', games: ['aztec-fire', 'hit-the-gold'] },
      { collection: 'sports', games: ['kambi'] },
    ],
    paymentMethods: [
      { paymentMethod: 'omega-bank', deposit: true, withdrawal: true },
      { paymentMethod: 'e-voucher', deposit: true, withdrawal: true },
    ],
    legalPages: [],
  });
});

test('a starter Brand leaves out the seed games and Collections an editor has since deleted', () => {
  const held = {
    games: [{ key: 'THREEOAKS:aztec_fire', documentId: 'aztec-fire' }],
    collections: [{ slug: 'slots', documentId: 'slots' }],
    paymentMethods: [
      { code: 'OMEGA_BANK', documentId: 'omega-bank' },
      { code: 'EVOUCHER', documentId: 'e-voucher' },
    ],
  };
  const brand = starterBrand({ brandId: 12, name: 'Lucky Star' }, { theme: 'DARK', seed: SEED, held });
  assert.deepEqual(brand.lobby, ['aztec-fire']);
  assert.deepEqual(brand.collections, [{ collection: 'slots', games: ['aztec-fire'] }]);
});

test("the seed's games are today's OMEGA lobby, in order, with their tile files", () => {
  const { games } = readSeedData(SEED_DIR, { theme: 'DARK' });
  assert.equal(games.length, 42);
  assert.deepEqual(games[0], {
    title: 'Aztec Fire',
    provider: 'THREEOAKS',
    gameId: 'aztec_fire',
    category: 'slots',
    tile: path.join(SEED_DIR, 'tiles', 'aztec_fire.avif'),
  });
  assert.deepEqual(games.at(-1), {
    title: 'OMEGA_SB',
    provider: 'OMEGA_SB',
    gameId: 'OMEGA_SB_GAME_ID',
    category: 'sportsbook',
    tile: path.join(SEED_DIR, 'tiles', 'defaults', 'sportsbook.avif'),
  });
});

test("the Slots and Sports Collections hold each Game Category's games, ordered as the categories first appear", () => {
  const { collections } = readSeedData(SEED_DIR, { theme: 'DARK' });
  assert.deepEqual(collections, [
    { name: 'Slots', slug: 'slots', icon: 'dice', category: 'slots' },
    { name: 'Sports', slug: 'sports', icon: 'dice', category: 'sportsbook' },
  ]);
});

test('a list that starts with a sportsbook puts Sports first, and still has Slots, last, with no games for it', (t) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  const game = { title: 'KAMBI', provider: 'KAMBI', gameId: 'KAMBI_GAME_ID', category: 'sportsbook', tile: 'kambi.avif' };
  fs.mkdirSync(path.join(seedDir, 'tiles'));
  fs.writeFileSync(path.join(seedDir, 'tiles', 'kambi.avif'), '');
  fs.writeFileSync(path.join(seedDir, 'games.json'), JSON.stringify([game]));
  fs.writeFileSync(path.join(seedDir, 'brand.json'), JSON.stringify({ logos: { DARK: 'logo.png' }, banners: [] }));
  fs.writeFileSync(path.join(seedDir, 'logo.png'), '');
  fs.writeFileSync(path.join(seedDir, 'payment-methods.json'), '[]');
  fs.cpSync(path.join(SEED_DIR, 'legal'), path.join(seedDir, 'legal'), { recursive: true });

  assert.deepEqual(readSeedData(seedDir, { theme: 'DARK' }).collections, [
    { name: 'Sports', slug: 'sports', icon: 'dice', category: 'sportsbook' },
    { name: 'Slots', slug: 'slots', icon: 'dice', category: 'slots' },
  ]);
});

test("today's three lobby banners, in order", () => {
  const { banners } = readSeedData(SEED_DIR, { theme: 'DARK' });
  assert.deepEqual(banners, [
    {
      title: 'Can you rank first on the leaderboard?',
      buttonText: 'Try now',
      link: '/leaderboard',
      image: path.join(SEED_DIR, 'banners', 'leaderboard.avif'),
    },
    {
      title: 'Could you win the jackpot?',
      buttonText: 'Learn more',
      link: 'dialog:jackpot',
      image: path.join(SEED_DIR, 'banners', 'jackpot.avif'),
    },
    {
      title: 'See the rewards waiting for you',
      buttonText: 'View promotions',
      link: '/bonus',
      image: path.join(SEED_DIR, 'banners', 'rewards.avif'),
    },
  ]);
});

test('refuses seed data that names an image file that is missing', (t) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  const game = { title: 'Aztec Fire', provider: 'THREEOAKS', gameId: 'aztec_fire', category: 'slots', tile: 'aztec_fire.avif' };
  fs.writeFileSync(path.join(seedDir, 'games.json'), JSON.stringify([game]));
  fs.writeFileSync(path.join(seedDir, 'brand.json'), JSON.stringify({ logos: { DARK: 'logo.png' }, banners: [] }));
  fs.writeFileSync(path.join(seedDir, 'logo.png'), '');

  assert.throws(
    () => readSeedData(seedDir, { theme: 'DARK' }),
    new RegExp(`Seed image missing: ${path.join(seedDir, 'tiles', 'aztec_fire.avif')}`),
  );
});

test('the seed content includes the four starter Payment Methods', () => {
  assert.deepEqual(
    readSeedData(SEED_DIR, { theme: 'DARK' }).paymentMethods.map((method) => method.code),
    ['OMEGA_BANK', 'EVOUCHER', 'PAYMENTIQ_ALL', 'COINSPAID_V2'],
  );
});

test('refuses a seed file that is not JSON, naming it, without a stack', (t) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  fs.writeFileSync(path.join(seedDir, 'games.json'), '[{ "title": ');

  assert.throws(
    () => readSeedData(seedDir, { theme: 'DARK' }),
    (error) => error instanceof StarterContentError && error.message.includes(path.join(seedDir, 'games.json')),
  );
});

test('refuses a seed file that is not the expected shape, naming it, without a stack', (t) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  fs.writeFileSync(path.join(seedDir, 'games.json'), '[]');
  fs.writeFileSync(path.join(seedDir, 'brand.json'), JSON.stringify({ logos: { DARK: 'logo.png' } }));

  assert.throws(
    () => readSeedData(seedDir, { theme: 'DARK' }),
    (error) =>
      error instanceof StarterContentError && error.message.includes(path.join(seedDir, 'brand.json')) && /banners/.test(error.message),
  );
});

test("refuses a brand.json without a logo for the chosen Brand Theme", (t) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  fs.writeFileSync(path.join(seedDir, 'games.json'), '[]');
  fs.writeFileSync(path.join(seedDir, 'brand.json'), JSON.stringify({ logos: { DARK: 'logo.png' }, banners: [] }));

  assert.throws(
    () => readSeedData(seedDir, { theme: 'LIGHT' }),
    (error) => error instanceof StarterContentError && /no LIGHT logo/.test(error.message),
  );
});

test('the Dark Theme gets the OMEGA Systems logo, the Light Theme the Kambi logo', () => {
  assert.equal(readSeedData(SEED_DIR, { theme: 'DARK' }).logo, path.join(SEED_DIR, 'logos', 'omega-systems.png'));
  assert.equal(readSeedData(SEED_DIR, { theme: 'LIGHT' }).logo, path.join(SEED_DIR, 'logos', 'kambi.png'));
});

test("a starter Brand has all five Legal Pages from the seed, in the Brand's name, with no placeholder left", () => {
  const seed = readSeedData(SEED_DIR, { theme: 'DARK' });
  const held = {
    games: [],
    collections: [],
    paymentMethods: seed.paymentMethods.map(({ code }) => ({ code, documentId: code })),
  };
  const { legalPages } = starterBrand({ brandId: 12, name: 'Lucky Star' }, { theme: 'DARK', seed, held });

  assert.deepEqual(
    legalPages.map(({ page, title }) => ({ page, title })),
    [
      { page: 'gaming-rules', title: 'Gaming Rules' },
      { page: 'player-protection', title: 'Player Protection Information' },
      { page: 'terms', title: 'Terms and Conditions' },
      { page: 'privacy', title: 'Privacy Policy' },
      { page: 'complaints', title: 'Complaints and Contact' },
    ],
  );
  for (const { page, body } of legalPages) {
    const text = JSON.stringify(body);
    assert.match(text, /Lucky Star/, page);
    assert.doesNotMatch(text, /XXXXXX|\{\{brand\}\}/, page);
  }
  assert.deepEqual(legalPages[0].body[0], {
    type: 'paragraph',
    children: [
      { type: 'text', text: 'These rules apply to every game offered by Lucky Star. They sit alongside our ' },
      { type: 'link', url: '/legal/terms', children: [{ type: 'text', text: 'Terms and Conditions' }] },
      { type: 'text', text: ". Where a game's own rules differ from these, the game's own rules apply to that game." },
    ],
  });
});

test("a Brand name with markdown in it is shown as written, not read as markdown", () => {
  const seed = readSeedData(SEED_DIR, { theme: 'DARK' });
  const held = {
    games: [],
    collections: [],
    paymentMethods: seed.paymentMethods.map(({ code }) => ({ code, documentId: code })),
  };
  const name = 'Star **VIP** [x](y)';
  const { legalPages } = starterBrand({ brandId: 12, name }, { theme: 'DARK', seed, held });

  assert.deepEqual(legalPages[0].body[0].children[0], {
    type: 'text',
    text: 'These rules apply to every game offered by Star **VIP** [x](y). They sit alongside our ',
  });
});

test("refuses a Legal Page seed file that doesn't start with its title, naming it", (t) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  fs.cpSync(SEED_DIR, seedDir, { recursive: true });
  const file = path.join(seedDir, 'legal', 'terms.md');
  fs.writeFileSync(file, 'Terms and Conditions\n\nNo title line.\n');

  assert.throws(
    () => readSeedData(seedDir, { theme: 'DARK' }),
    (error) => error instanceof StarterContentError && error.message.includes(file) && /"# " title/.test(error.message),
  );
});

test('refuses a seed folder with a Legal Page missing, naming its file', (t) => {
  const seedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seed-'));
  t.after(() => fs.rmSync(seedDir, { recursive: true }));
  fs.cpSync(SEED_DIR, seedDir, { recursive: true });
  fs.rmSync(path.join(seedDir, 'legal', 'privacy.md'));

  assert.throws(
    () => readSeedData(seedDir, { theme: 'DARK' }),
    (error) => error instanceof StarterContentError && error.message.includes(path.join(seedDir, 'legal', 'privacy.md')),
  );
});
