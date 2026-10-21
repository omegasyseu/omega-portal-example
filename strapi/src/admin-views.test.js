'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  BANNER_LABELS,
  BRAND_PAYMENT_METHOD_LABELS,
  IMAGE_HINTS,
  LEGAL_PAGE_LABELS,
  withDescription,
  withGameTitles,
  withLabels,
  withoutLobbyEditorFields,
} = require('./admin-views.ts');
const { BRAND_UID, GAME_UID } = require('./uids.ts');

test("an image field's description tells editors the size to upload", () => {
  const view = withDescription('tile', IMAGE_HINTS.tile)({
    settings: {},
    layouts: {},
    metadatas: { tile: { edit: { label: 'tile', description: '', visible: true }, list: { label: 'tile' } } },
  });
  assert.equal(view.metadatas.tile.edit.description, IMAGE_HINTS.tile);
  assert.equal(view.metadatas.tile.edit.label, 'tile');
  assert.equal(view.metadatas.tile.edit.visible, true);
  assert.deepEqual(view.metadatas.tile.list, { label: 'tile' });
});

test('setting a description leaves other fields and the given view alone', () => {
  const given = () => ({ settings: {}, layouts: {}, metadatas: { title: { edit: { description: 'kept' } }, logo: {} } });
  const original = given();
  const view = withDescription('logo', IMAGE_HINTS.logo)(original);
  assert.equal(view.metadatas.logo.edit.description, IMAGE_HINTS.logo);
  assert.deepEqual(view.metadatas.title, given().metadatas.title);
  assert.deepEqual(original, given());
});

test('a Legal Page names its fields in words editors use, keeping the rest of each field', () => {
  const given = () => ({
    settings: {},
    layouts: {},
    metadatas: {
      page: { edit: { label: 'page', visible: true }, list: { label: 'page' } },
      body: { edit: { label: 'body', description: 'kept' } },
      updatedOn: {},
    },
  });
  const original = given();
  const view = withLabels(LEGAL_PAGE_LABELS)(original);
  assert.equal(view.metadatas.page.edit.label, 'Page');
  assert.equal(view.metadatas.body.edit.label, 'Text');
  assert.equal(view.metadatas.body.edit.description, 'kept');
  assert.equal(view.metadatas.updatedOn.edit.label, 'Last updated');
  assert.equal(view.metadatas.page.edit.visible, true);
  assert.deepEqual(view.metadatas.page.list, { label: 'page' });
  assert.deepEqual(original, given());
});

test("each component's labels name exactly its fields, so a renamed field can't keep a stale label", () => {
  const fields = (file) => Object.keys(require(`./components/brand/${file}.json`).attributes).sort();
  assert.deepEqual(Object.keys(LEGAL_PAGE_LABELS).sort(), fields('legal-page'));
  assert.deepEqual(Object.keys(BANNER_LABELS).sort(), fields('banner'));
  assert.deepEqual(Object.keys(BRAND_PAYMENT_METHOD_LABELS).sort(), fields('brand-payment-method'));
});

test('each image hint gives the ratio or size the portal shows it at', () => {
  assert.match(IMAGE_HINTS.tile, /3:4/);
  assert.match(IMAGE_HINTS.tile, /960×1280 px/);
  assert.match(IMAGE_HINTS.logo, /34 px tall/);
  assert.match(IMAGE_HINTS.logo, /transparent/);
  assert.match(IMAGE_HINTS.bannerImage, /2:1/);
  assert.match(IMAGE_HINTS.bannerImage, /1536×768 px/);
  assert.match(IMAGE_HINTS.bannerImage, /right third/);
  assert.match(IMAGE_HINTS.paymentMethodLogo, /white/);
  assert.match(IMAGE_HINTS.paymentMethodLogo, /76×32 px/);
});

// The admin's stored view settings for a type, as the content manager keeps them.
const gameView = () => ({
  uid: GAME_UID,
  settings: { searchable: true, pageSize: 10, mainField: 'key', defaultSortBy: 'key', defaultSortOrder: 'ASC' },
  metadatas: { title: { edit: { label: 'title' } } },
  layouts: { list: ['id', 'key', 'provider', 'gameId'] },
});

const brandView = () => ({
  uid: BRAND_UID,
  settings: { mainField: 'name' },
  metadatas: {
    name: { edit: { label: 'name' } },
    lobby: { edit: { label: 'lobby', visible: true, mainField: 'key' }, list: { label: 'lobby' } },
    collections: { edit: { label: 'collections', visible: true }, list: { label: 'collections' } },
  },
  layouts: {
    list: ['id', 'name'],
    edit: [
      [{ name: 'brandId', size: 4 }, { name: 'name', size: 6 }],
      [{ name: 'banners', size: 12 }],
      [{ name: 'lobby', size: 6 }],
      [{ name: 'collections', size: 12 }],
    ],
  },
});

test('a Game is titled, found and sorted by its title', () => {
  const view = withGameTitles(gameView());
  assert.equal(view.settings.mainField, 'title');
  assert.equal(view.settings.defaultSortBy, 'title');
});

test('keeps the rest of the Game view as the editor left it', () => {
  const view = withGameTitles(gameView());
  assert.equal(view.settings.pageSize, 10);
  assert.deepEqual(view.layouts, gameView().layouts);
  assert.deepEqual(view.metadatas, gameView().metadatas);
});

test("a Brand's form leaves out the lobby and its Collections, which the Lobby editor edits instead", () => {
  const view = withoutLobbyEditorFields(brandView());
  assert.deepEqual(view.layouts.edit, [
    [{ name: 'brandId', size: 4 }, { name: 'name', size: 6 }],
    [{ name: 'banners', size: 12 }],
  ]);
  assert.equal(view.metadatas.lobby.edit.visible, false);
  assert.equal(view.metadatas.collections.edit.visible, false);
});

test('a lobby sharing a row keeps the row and its other fields', () => {
  const view = withoutLobbyEditorFields({
    ...brandView(),
    layouts: { list: [], edit: [[{ name: 'name', size: 6 }, { name: 'lobby', size: 6 }]] },
  });
  assert.deepEqual(view.layouts.edit, [[{ name: 'name', size: 6 }]]);
});

test('keeps the rest of the Brand view as the editor left it', () => {
  const view = withoutLobbyEditorFields(brandView());
  assert.equal(view.metadatas.lobby.edit.label, 'lobby');
  assert.deepEqual(view.metadatas.lobby.list, brandView().metadatas.lobby.list);
  assert.equal(view.metadatas.collections.edit.label, 'collections');
  assert.deepEqual(view.metadatas.name, brandView().metadatas.name);
  assert.deepEqual(view.layouts.list, brandView().layouts.list);
  assert.deepEqual(view.settings, brandView().settings);
});

test('never changes the view it is given', () => {
  const game = gameView();
  const brand = brandView();
  withGameTitles(game);
  withoutLobbyEditorFields(brand);
  assert.deepEqual(game, gameView());
  assert.deepEqual(brand, brandView());
});
