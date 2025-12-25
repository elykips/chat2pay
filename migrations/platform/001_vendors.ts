import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('vendors', (t) => {
    t.uuid('id').primary()
    t.string('name').notNullable()
    t.string('country', 2).notNullable()

    t.enum('isolation_level', ['shared', 'dedicated']).notNullable()
    t.enum('db_target', ['platform', 'tenant']).notNullable()

    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('vendors')
}
