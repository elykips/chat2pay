import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('whatsapp_sessions', (table) => {
    table.integer('attempts').notNullable().defaultTo(0)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('whatsapp_sessions', (table) => {
    table.dropColumn('attempts')
  })
}