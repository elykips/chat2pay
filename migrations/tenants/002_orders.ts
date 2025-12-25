import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (t) => {
    t.uuid('id').primary()
    t.uuid('vendor_id').notNullable()
    t.string('customer_phone').notNullable()

    t.integer('amount').notNullable()
    t.string('currency', 10).notNullable().defaultTo('KES')

    t.string('status').notNullable()
    t.jsonb('metadata').notNullable().defaultTo('{}')

    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orders')
}
