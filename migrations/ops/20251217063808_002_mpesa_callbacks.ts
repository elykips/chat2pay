import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('mpesa_callbacks', (t) => {
    t.uuid('id').primary()

    t.uuid('vendor_id').notNullable()
    t.uuid('payment_id').notNullable()

    t.string('checkout_request_id', 100).notNullable()
    t.string('merchant_request_id', 100)

    t.integer('result_code').notNullable()
    t.string('result_desc').notNullable()
    t.string('mpesa_receipt', 60)
    t.integer('amount')
    t.string('phone', 20)

    t.jsonb('raw_body').notNullable()

    t.timestamp('received_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
    t.timestamp('processed_at', { useTz: true })
    t.string('process_status', 20).notNullable().defaultTo('received') // received|processed|skipped|failed
    t.text('process_error')

    // Idempotency: Safaricom may retry; we process once per checkout_request_id
    t.unique(['checkout_request_id'])
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('mpesa_callbacks')
}
