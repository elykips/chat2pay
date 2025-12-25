import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('capabilities', (t) => {
    t.uuid('id').primary()
    t.string('capability_key').unique().notNullable()
    t.string('name').notNullable()
    t.jsonb('dependencies').notNullable().defaultTo('[]')
    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('capabilities')
}
