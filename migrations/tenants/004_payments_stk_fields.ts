import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('payments', (t) => {
    t.string('merchant_request_id')
    t.string('checkout_request_id')
    t.string('mpesa_receipt')
    t.integer('result_code')
    t.string('result_desc')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('payments', (t) => {
    t.dropColumns(
      'merchant_request_id',
      'checkout_request_id',
      'mpesa_receipt',
      'result_code',
      'result_desc'
    )
  })
}
