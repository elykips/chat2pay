import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  const has = await knex.schema.hasColumn('whatsapp_sessions', 'last_state_at')
  if (!has) {
    await knex.schema.alterTable('whatsapp_sessions', (t) => {
      t.timestamp('last_state_at').notNullable().defaultTo(knex.fn.now())
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  const has = await knex.schema.hasColumn('whatsapp_sessions', 'last_state_at')
  if (has) {
    await knex.schema.alterTable('whatsapp_sessions', (t) => {
      t.dropColumn('last_state_at')
    })
  }
}
