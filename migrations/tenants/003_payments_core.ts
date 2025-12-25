import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payments', (t) => {
    t.uuid('id').primary()
    t.uuid('vendor_id').notNullable()
    t.uuid('order_id').notNullable()

    t.integer('amount').notNullable()
    t.string('currency', 10).notNullable().defaultTo('KES')

    t.string('method').notNullable()
    t.string('provider').notNullable()
    t.string('status').notNullable()

    t.string('reference')
    t.jsonb('metadata').notNullable().defaultTo('{}')

    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payments')
}
