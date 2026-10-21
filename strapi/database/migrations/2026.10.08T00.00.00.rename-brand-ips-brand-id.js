'use strict';

/**
 * The Brand's `ipsBrandId` field is now `brandId`. Strapi would drop the old column and
 * add an empty one, losing every Brand's ID, so this renames the column in place first.
 * Draft and published Brands share the table, so both keep their IDs.
 *
 * Strapi runs each migration once, before it syncs the schema. A new, empty database
 * has no brands table yet, so there is nothing to rename.
 */
module.exports = {
  async up(knex) {
    if (await knex.schema.hasColumn('brands', 'ips_brand_id')) {
      await knex.schema.alterTable('brands', (table) => table.renameColumn('ips_brand_id', 'brand_id'));
    }
  },
};
