import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('whatsapp_sessions', (t) => {
    t.uuid('id').primary()
    t.uuid('vendor_id').notNullable().index()
    t.string('phone', 30).notNullable()
    t.string('state', 50).notNullable()
    t.jsonb('context').notNullable().defaultTo('{}')

    t.timestamp('completed_at')
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())

    t.unique(['vendor_id', 'phone'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('whatsapp_sessions')
}
