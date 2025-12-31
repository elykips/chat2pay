import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('onboarding_sessions', (table) => {
    table.uuid('id').primary();

    table.string('phone', 32).notNullable();

    table.string('state', 50).notNullable();

    table.jsonb('payload').notNullable().defaultTo(knex.raw(`'{}'::jsonb`));

    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .timestamp('updated_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    // 🔍 Indexes for fast lookup
    table.index(['phone'], 'onboarding_sessions_phone_idx');
    table.index(['state'], 'onboarding_sessions_state_idx');
    table.integer('attempts').notNullable().defaultTo(0);
    table.timestamp('last_state_at', { useTz: true }).defaultTo(knex.fn.now());

  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('onboarding_sessions');
}
