// The UIDs Strapi knows this project's content types and components by, in one place.
// The seed (scripts/seed.js) requires this file as it is, so it may only hold plain
// constants. The schemas' own relation targets (src/**/schema.json and the component
// JSON files) can't import it and name the same UIDs; change them together.

export const BRAND_UID = 'api::brand.brand';
export const GAME_UID = 'api::game.game';
export const COLLECTION_UID = 'api::collection.collection';
export const PAYMENT_METHOD_UID = 'api::payment-method.payment-method';

// A Brand's repeatable components: one lobby banner, one Collection it shows with its games,
// its settings for one Payment Method, and one Legal Page.
export const BANNER_UID = 'brand.banner';
export const BRAND_COLLECTION_UID = 'brand.brand-collection';
export const BRAND_PAYMENT_METHOD_UID = 'brand.brand-payment-method';
export const LEGAL_PAGE_UID = 'brand.legal-page';
