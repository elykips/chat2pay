import type { Knex } from 'knex'

export async function up(knex: Knex) {
  await knex.schema.createTable('vendor_payment_profiles', (t) => {
    t.uuid('vendor_id')
      .primary()
      .references('id')
      .inTable('vendors')
      .onDelete('CASCADE')

    t.string('provider', 50).notNullable() // safaricom
    t.string('business_shortcode', 20).notNullable()
    t.string('passkey_secret_ref', 255).notNullable()

    t.boolean('enabled').notNullable().defaultTo(true)

    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now())
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex) {
  await knex.schema.dropTableIfExists('vendor_payment_profiles')
}
