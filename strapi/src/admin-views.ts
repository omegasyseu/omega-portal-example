import type { Core } from '@strapi/strapi';
import {
  BANNER_UID,
  BRAND_PAYMENT_METHOD_UID,
  BRAND_UID,
  GAME_UID,
  LEGAL_PAGE_UID,
  PAYMENT_METHOD_UID,
} from './uids.ts';

/**
 * Shown under each image field, so editors upload the size the portal shows it at.
 * From docs/game-tile-images.md, docs/banner-images.md and the portal's logo sizes. A
 * Payment Method's logo sits on a white tile, 76×32 px inside its padding, where players
 * pick how to pay.
 */
export const IMAGE_HINTS = {
  tile: '3:4 portrait, 960×1280 px recommended, AVIF. Keep the game title between 60% and 75% of the height.',
  logo: 'Wide logo on a transparent background, PNG or AVIF, about 660×102 px. Shown up to 34 px tall and 220 px wide, in both themes.',
  bannerImage:
    '2:1 landscape, 1536×768 px recommended, AVIF. Subject in the right third; keep the left 60% quiet for the title and button.',
  paymentMethodLogo:
    'Wide logo drawn for a white background, PNG or AVIF, about 228×96 px. Shown on a white tile, up to 76×32 px.',
} as const;

/** One field's place in the admin's edit form. */
type EditField = { name: string } & Record<string, unknown>;

/** The admin's stored view settings for one type: only the parts changed here. */
type AdminView = {
  settings: Record<string, unknown>;
  metadatas: Record<string, { edit?: Record<string, unknown> } & Record<string, unknown>>;
  layouts: { edit?: EditField[][] } & Record<string, unknown>;
} & Record<string, unknown>;

/**
 * A Game is listed, found and sorted by its title. Strapi would otherwise show its
 * key ("PROVIDER:gameId"), which editors can't search by name.
 */
export const withGameTitles = (view: AdminView): AdminView => ({
  ...view,
  settings: { ...view.settings, mainField: 'title', defaultSortBy: 'title' },
});

// The Brand fields only the Lobby editor edits.
const LOBBY_EDITOR_FIELDS = ['lobby', 'collections'];

const hiddenOnForm = (metadatas: AdminView['metadatas'], field: string): AdminView['metadatas'] => ({
  ...metadatas,
  [field]: { ...metadatas[field], edit: { ...metadatas[field]?.edit, visible: false } },
});

/**
 * A Brand's form leaves out its lobby and its Collections: editors build both in the
 * Lobby editor (src/admin/app.tsx) instead. The fields are taken off the form, so saving
 * or publishing the form leaves them as they are, and hidden, so "Configure the view"
 * doesn't offer them back.
 */
export const withoutLobbyEditorFields = (view: AdminView): AdminView => ({
  ...view,
  layouts: {
    ...view.layouts,
    edit: (view.layouts.edit ?? [])
      .map((row) => row.filter((field) => !LOBBY_EDITOR_FIELDS.includes(field.name)))
      .filter((row) => row.length > 0),
  },
  metadatas: LOBBY_EDITOR_FIELDS.reduce(hiddenOnForm, view.metadatas),
});

/** Sets the help text shown under one field on the edit form. */
export const withDescription =
  (field: string, description: string) =>
  (view: AdminView): AdminView => ({
    ...view,
    metadatas: {
      ...view.metadatas,
      [field]: { ...view.metadatas[field], edit: { ...view.metadatas[field]?.edit, description } },
    },
  });

/** Sets the label shown above each named field on the edit form. */
export const withLabels =
  (labels: Record<string, string>) =>
  (view: AdminView): AdminView => ({
    ...view,
    metadatas: Object.entries(labels).reduce(
      (metadatas, [field, label]) => ({
        ...metadatas,
        [field]: { ...metadatas[field], edit: { ...metadatas[field]?.edit, label } },
      }),
      view.metadatas,
    ),
  });

// A Legal Page's fields, as editors call them.
export const LEGAL_PAGE_LABELS = {
  page: 'Page',
  title: 'Title',
  body: 'Text',
  updatedOn: 'Last updated',
};

// A Banner's fields, as editors call them.
export const BANNER_LABELS = {
  image: 'Image',
  title: 'Title',
  buttonText: 'Button text',
  link: 'Link',
};

// A Brand Payment Method's fields, as editors call them.
export const BRAND_PAYMENT_METHOD_LABELS = {
  paymentMethod: 'Payment Method',
  deposit: 'Show for deposits',
  withdrawal: 'Show for withdrawals',
  name: 'Name on this Brand',
  logo: 'Logo on this Brand',
};

const pipe =
  (...changes: Array<(view: AdminView) => AdminView>) =>
  (view: AdminView): AdminView =>
    changes.reduce((changed, change) => change(changed), view);

/** The content manager's content-types and components services: both store views alike. */
type ViewService = {
  findConfiguration: (model: unknown) => Promise<AdminView>;
  updateConfiguration: (model: unknown, view: AdminView) => Promise<unknown>;
  findContentType: (uid: string) => unknown;
  findComponent: (uid: string) => unknown;
};

// Strapi types plugin services loosely, so name the calls used here.
const viewService = (strapi: Core.Strapi, name: 'content-types' | 'components'): ViewService =>
  strapi.plugin('content-manager').service(name) as unknown as ViewService;

const applyView = async (
  service: ViewService,
  model: unknown,
  change: (view: AdminView) => AdminView,
): Promise<void> => {
  const view = await service.findConfiguration(model);
  await service.updateConfiguration(model, change(view));
};

/**
 * Applies the views above on every start, so every environment's admin shows Games by
 * title, leaves the lobby and Collections off the Brand form, and tells editors the size of every image, including both Payment Method logos (the default and a Brand's own), and labels the Brand's banners, Payment Methods and Legal Pages and their fields in editors' words. It
 * runs after the content manager has synced its stored views.
 */
export const applyAdminViews = async (strapi: Core.Strapi): Promise<void> => {
  const contentTypes = viewService(strapi, 'content-types');
  const components = viewService(strapi, 'components');
  await applyView(
    contentTypes,
    contentTypes.findContentType(GAME_UID),
    pipe(withGameTitles, withDescription('tile', IMAGE_HINTS.tile)),
  );
  await applyView(
    contentTypes,
    contentTypes.findContentType(BRAND_UID),
    pipe(
      withoutLobbyEditorFields,
      withDescription('logo', IMAGE_HINTS.logo),
      withLabels({ banners: 'Banners', paymentMethods: 'Payment Methods', legalPages: 'Legal Pages' }),
      withDescription('banners', 'The lobby banners, in the order they show.'),
      withDescription(
        'paymentMethods',
        'Which Payment Methods this Brand shows for deposits and withdrawals, and under what name and logo.',
      ),
      withDescription(
        'legalPages',
        "The pages every visitor can open from the footer. Each holds this Brand's own text.",
      ),
    ),
  );
  await applyView(
    components,
    components.findComponent(LEGAL_PAGE_UID),
    pipe(
      withLabels(LEGAL_PAGE_LABELS),
      withDescription(
        'updatedOn',
        'Shown as "Last updated" on the page. Leave empty to show no date.',
      ),
    ),
  );
  await applyView(
    components,
    components.findComponent(BANNER_UID),
    pipe(
      withLabels(BANNER_LABELS),
      withDescription('image', IMAGE_HINTS.bannerImage),
      withDescription('link', 'A portal page such as /leaderboard, or dialog:jackpot to open the jackpot. A banner into a feature switched off under Feature visibility is not shown.'),
    ),
  );
  await applyView(
    contentTypes,
    contentTypes.findContentType(PAYMENT_METHOD_UID),
    withDescription('logo', IMAGE_HINTS.paymentMethodLogo),
  );
  await applyView(
    components,
    components.findComponent(BRAND_PAYMENT_METHOD_UID),
    pipe(
      withLabels(BRAND_PAYMENT_METHOD_LABELS),
      withDescription('name', "Leave empty to show the Payment Method's own name."),
      withDescription('logo', `${IMAGE_HINTS.paymentMethodLogo} Leave empty to show its own logo.`),
    ),
  );
};
