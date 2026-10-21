import path from 'path';
import type { Core } from '@strapi/strapi';
import { beginTransactionsImmediately } from '../src/sqlite-transactions.ts';

// SQLite in data/, next to the uploads (data/public/uploads), so one volume holds all content.
const config: Core.Config.Database = {
  connection: {
    client: 'sqlite',
    connection: {
      filename: path.join(__dirname, '..', '..', 'data', 'strapi.db'),
    },
    useNullAsDefault: true,
    // The seed runs its own Strapi on this file while the server runs; see sqlite-transactions.ts.
    pool: { afterCreate: beginTransactionsImmediately },
  },
};

export default config;
