import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('vendor_tenants', (t) => {
    t.uuid('vendor_id')
      .primary()
      .references('id')
      .inTable('vendors')
      .onDelete('cascade')

    t.text('database_url').notNullable()
    t.boolean('enabled').notNullable().defaultTo(true)

    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vendor_tenants')
}
