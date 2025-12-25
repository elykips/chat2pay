import 'dotenv/config'
import knex, { Knex } from 'knex'
import type { Application } from '@feathersjs/koa'

export const postgresql = (app: Application) => {
  const platformConfig = app.get('platformDbConfig')
  const opsConfig = app.get('opsDbConfig')

  const PLATFORM_DB_URL = process.env.PLATFORM_DB_URL
  const OPS_DB_URL = process.env.OPS_DB_URL

  if (!PLATFORM_DB_URL) {
    throw new Error('PLATFORM_DB_URL is not set')
  }

  if (!OPS_DB_URL) {
    throw new Error('OPS_DB_URL is not set')
  }

  if (!platformConfig || !opsConfig) {
    throw new Error('Database configs missing from Feathers configuration')
  }

  // ─────────────────────────────
  // Platform DB (Control Plane)
  // ─────────────────────────────
  const platformDb: Knex = knex({
    client: 'pg',
    ...platformConfig,
    connection: PLATFORM_DB_URL,
    searchPath: ['public']
  })

  // ─────────────────────────────
  // Ops DB (Billing / Events)
  // ─────────────────────────────
  const opsDb: Knex = knex({
    client: 'pg',
    ...opsConfig,
    connection: OPS_DB_URL,
    searchPath: ['public']
  })

  app.set('platformDb', platformDb)
  app.set('opsDb', opsDb)

  // ✅ Correct logging
  console.log('✅ Platform DB connected:', PLATFORM_DB_URL)
  console.log('✅ Ops DB connected:', OPS_DB_URL)
}

