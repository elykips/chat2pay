import knex, { Knex } from 'knex'
import type { Application } from '@feathersjs/koa'

type DbResolution = {
  db: Knex
  isolation: 'shared' | 'dedicated'
}

const tenantKnexCache = new Map<string, Knex>()

function getOrCreateTenantKnex(databaseUrl: string): Knex {
  if (tenantKnexCache.has(databaseUrl)) {
    return tenantKnexCache.get(databaseUrl)!
  }

  const db = knex({
    client: 'pg',
    connection: databaseUrl,
    pool: { min: 1, max: 5 }
  })

  tenantKnexCache.set(databaseUrl, db)
  return db
}

export function DbRouter(app: Application) {
  const platformDb = app.get('platformDb')

  const SHARED_TENANT_DB_URL_ENV = process.env.SHARED_TENANT_DB_URL
  if (!SHARED_TENANT_DB_URL_ENV) {
    throw new Error('SHARED_TENANT_DB_URL is not set')
  }

  async function tenantDbForVendor(vendorId: string): Promise<DbResolution> {
    if (!vendorId) {
      throw new Error('vendor_id is required')
    }

    const vendor = await platformDb('vendors')
      .where({ id: vendorId })
      .first()

    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found`)
    }

    // ─────────────────────────────
    // SHARED TENANT (SME)
    // ─────────────────────────────
    const SHARED_TENANT_DB_URL: string = SHARED_TENANT_DB_URL_ENV as string
    if (vendor.isolation_level === 'shared') {
      return {
        db: getOrCreateTenantKnex(SHARED_TENANT_DB_URL),
        isolation: 'shared'
      }
    }

    // ─────────────────────────────
    // DEDICATED TENANT (ENTERPRISE)
    // ─────────────────────────────
    if (vendor.isolation_level === 'dedicated') {
      const tenant = await platformDb('vendor_tenants')
        .where({
          vendor_id: vendorId,
          enabled: true,
          status: 'ready'
        })
        .first()

      if (!tenant) {
        throw new Error(`Dedicated DB not ready for vendor ${vendorId}`)
      }

      return {
        db: getOrCreateTenantKnex(tenant.database_url),
        isolation: 'dedicated'
      }
    }

    throw new Error(`Invalid isolation_level '${vendor.isolation_level}'`)
  }

  return {
    tenantDbForVendor
  }
}
