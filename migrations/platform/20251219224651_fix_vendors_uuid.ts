import type { Knex } from 'knex'

export async function up(knex: Knex) {
  await knex.raw(`CREATE EXTENSION IF NOT EXISTS pgcrypto`)
  await knex.raw(`
    ALTER TABLE vendors
    ALTER COLUMN id SET DEFAULT gen_random_uuid()
  `)
}

export async function down(knex: Knex) {
  await knex.raw(`
    ALTER TABLE vendors
    ALTER COLUMN id DROP DEFAULT
  `)
}
