import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('vendor_tenants', (table) => {
    table.text('last_error').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('vendor_tenants', (table) => {
    table.dropColumn('last_error');
  });
}
