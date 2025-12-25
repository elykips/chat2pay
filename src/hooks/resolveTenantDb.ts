import type { HookContext } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'

export const resolveTenantDb = async (context: HookContext) => {
  const { app } = context

  // Always work on context.params directly
  const params = context.params ?? (context.params = {})

  const vendorId =
    params.vendor_id ||
    params.headers?.['x-vendor-id'] ||
    params.headers?.['X-Vendor-Id'] ||
    params.query?.vendor_id

  if (!vendorId) {
    throw new BadRequest('x-vendor-id header required')
  }

  const router = app.get('dbRouter')
  if (!router || typeof router.tenantDbForVendor !== 'function') {
    throw new Error('DB Router not initialized correctly')
  }

  const { db, isolation } = await router.tenantDbForVendor(vendorId)

  const info = await db.raw(`
  select
    current_database() as db,
    current_user as user,
    current_schema() as schema,
    current_setting('search_path') as search_path
`)
console.log('🔍 TENANT DB INFO', info.rows[0])


const dbName = await db.raw('select current_database() as db')
const schema = await db.raw('select current_schema() as schema')

console.log('🧭 DB ROUTER RESOLUTION', {
  vendorId,
  isolation,
  database: dbName.rows[0].db,
  schema: schema.rows[0].schema
})

  // 🔑 CRITICAL: this is what KnexService actually reads
  context.params.knex = db

  // 🔑 propagate context
  context.params.vendor_id = vendorId
  context.params.db_isolation = isolation

  return context
}
