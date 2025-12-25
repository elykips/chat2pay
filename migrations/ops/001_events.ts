import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('events', (t) => {
    t.uuid('id').primary()
    t.string('type').notNullable()
    t.jsonb('payload').notNullable()
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('events')
}
