import type { Schema, Struct } from '@strapi/strapi';

export interface BrandBanner extends Struct.ComponentSchema {
  collectionName: 'components_brand_banners';
  info: {
    description: "A lobby banner. The link is a portal path such as /leaderboard, or a known dialog: dialog:jackpot. The portal checks the same rule (PORTAL_PATH in the portal's src/providers/brand-content/brand-content.ts); change both together.";
    displayName: 'Banner';
  };
  attributes: {
    buttonText: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BrandBrandCollection extends Struct.ComponentSchema {
  collectionName: 'components_brand_brand_collections';
  info: {
    description: "One Collection a Brand shows, with the games it holds for this Brand, in order. They must be games from the Brand's lobby (src/brand-collections.ts). Edited in the Lobby editor.";
    displayName: 'Brand Collection';
  };
  attributes: {
    collection: Schema.Attribute.Relation<
      'oneToOne',
      'api::collection.collection'
    >;
    games: Schema.Attribute.Relation<'oneToMany', 'api::game.game'>;
  };
}

export interface BrandBrandPaymentMethod extends Struct.ComponentSchema {
  collectionName: 'components_brand_brand_payment_methods';
  info: {
    description: "How a Brand shows one Payment Method: for deposits, for withdrawals, and under its own name and logo when set (otherwise the method's). One entry per method (src/brand-payment-methods.ts). The portal shows a method only when IPS offers it too.";
    displayName: 'Brand Payment Method';
  };
  attributes: {
    deposit: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
    paymentMethod: Schema.Attribute.Relation<
      'oneToOne',
      'api::payment-method.payment-method'
    >;
    withdrawal: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface BrandLegalPage extends Struct.ComponentSchema {
  collectionName: 'components_brand_legal_pages';
  info: {
    description: 'One of a Brand\'s five Legal Pages, shown on the portal at /legal/<page>. The page names are also LEGAL_PAGES in the portal\'s src/components/legal/legal-page-model.ts and in strapi/src/seed-data.ts; change all three together. updatedOn shows as "Last updated" when set.';
    displayName: 'Legal Page';
  };
  attributes: {
    body: Schema.Attribute.Blocks & Schema.Attribute.Required;
    page: Schema.Attribute.Enumeration<
      ['gaming-rules', 'player-protection', 'terms', 'privacy', 'complaints']
    > &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    updatedOn: Schema.Attribute.Date;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'brand.banner': BrandBanner;
      'brand.brand-collection': BrandBrandCollection;
      'brand.brand-payment-method': BrandBrandPaymentMethod;
      'brand.legal-page': BrandLegalPage;
    }
  }
}
