import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('catalog_items', (t) => {
    t.uuid('id').primary()
    t.uuid('vendor_id').notNullable()

    t.string('name').notNullable()
    t.integer('price').notNullable()
    t.string('currency', 10).notNullable().defaultTo('KES')
    t.boolean('active').notNullable().defaultTo(true)

    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('catalog_items')
}
