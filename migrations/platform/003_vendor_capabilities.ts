import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('vendor_capabilities', (t) => {
    t.uuid('vendor_id')
      .references('id')
      .inTable('vendors')
      .onDelete('cascade')

    t.string('capability_key').notNullable()
    t.boolean('enabled').notNullable().defaultTo(true)

    t.primary(['vendor_id', 'capability_key'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vendor_capabilities')
}
