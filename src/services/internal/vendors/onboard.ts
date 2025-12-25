import type { Application } from '@feathersjs/koa'
import { BadRequest, Forbidden } from '@feathersjs/errors'
import knex from 'knex'
import crypto from 'crypto'
import format from 'pg-format'

type IsolationLevel = 'shared' | 'dedicated'

function requireInternalKey(ctx: any) {
  const key = ctx.headers['x-internal-key']
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    throw new Forbidden('Unauthorized')
  }
}

function randomId(len = 6) {
  return crypto.randomBytes(len).toString('hex')
}

/**
 * Run tenant migrations on a tenant DB
 */
async function runTenantMigrations(databaseUrl: string) {
  const db = knex({
    client: 'pg',
    connection: databaseUrl,
    migrations: {
      directory: `${process.cwd()}/migrations/tenants`
    }
  })

  try {
    await db.migrate.latest()
  } finally {
    await db.destroy()
  }
}

/**
 * Provision a dedicated database + role
 */
async function provisionDedicatedDb(dbName: string) {
  const adminUrl = process.env.PROVISIONING_DB_URL
  if (!adminUrl) throw new BadRequest('Missing PROVISIONING_DB_URL')

  const admin = knex({
    client: 'pg',
    connection: adminUrl
  })

  const user = `t_${dbName}`.slice(0, 60)
  const pass = crypto.randomBytes(18).toString('base64url')

  try {
    
    const sql = format(`
    DO $do$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = %L) THEN
        EXECUTE 'CREATE ROLE %I LOGIN PASSWORD '%L'';
      END IF;
    END
    $do$;
    `, user, user, pass)

    await admin.raw(sql)
 
    await admin.raw(`CREATE DATABASE ??`, [dbName]).catch(() => {})

    await admin.raw(`GRANT CONNECT ON DATABASE ?? TO ??`, [dbName, user])


    // Connect as admin to the newly created tenant DB
    const adminTenant = knex({
      client: 'pg',
      connection: `${adminUrl.substring(0, adminUrl.lastIndexOf('/'))}/${dbName}`
    })

    try {
      // Allow tenant role to use public schema
      await adminTenant.raw(`GRANT USAGE ON SCHEMA public TO "${user}"`)
      await adminTenant.raw(`GRANT CREATE ON SCHEMA public TO "${user}"`)

      // Allow table access
      await adminTenant.raw(`
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON ALL TABLES IN SCHEMA public
        TO "${user}"
      `)

      // Ensure future tables are accessible
      await adminTenant.raw(`
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON TABLES TO "${user}"
      `)

      // Sequences (important for serial / identity)
      await adminTenant.raw(`
        ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT USAGE, SELECT, UPDATE
        ON SEQUENCES TO "${user}"
      `)
    } finally {
      await adminTenant.destroy()
    }


    const tenantUrl =
      `postgres://${encodeURIComponent(user)}:${encodeURIComponent(pass)}` +
      `@${process.env.TENANT_DB_HOST || 'localhost'}:${process.env.TENANT_DB_PORT || 5432}/${dbName}`

    return { databaseUrl: tenantUrl, dbName, user }
  } finally {
    await admin.destroy()
  }
}

/**
 * Vendor onboarding endpoint
 */
export const registerVendorOnboarding = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.path !== '/internal/vendors/onboard' || ctx.method !== 'POST') {
      return next()
    }

    requireInternalKey(ctx)

    const body = ctx.request.body as any

    const name = String(body.name || '').trim()
    const country = String(body.country || '').trim()
    const isolation: IsolationLevel = body.isolation_level
    const capabilities: string[] = body.capabilities || []
    const mpesa = body.mpesa

    if (!name) throw new BadRequest('name required')
    if (!country) throw new BadRequest('country required')
    if (!['shared', 'dedicated'].includes(isolation)) {
      throw new BadRequest('isolation_level must be shared|dedicated')
    }

    if (!mpesa?.business_shortcode || !mpesa?.passkey_secret_ref) {
      throw new BadRequest('mpesa.business_shortcode and passkey_secret_ref required')
    }

    const platformDb = app.get('platformDb')

    /**
     * 1️⃣ Create vendor
     */
    const [vendor] = await platformDb('vendors')
      .insert({
        name,
        country,
        db_target: 'tenant',
        isolation_level: isolation
      })
      .returning('*')

    const vendorId = vendor.id

    /**
     * 2️⃣ Capabilities (NO id field!)
     */
    if (capabilities.length) {
      await platformDb('vendor_capabilities').insert(
        capabilities.map((cap) => ({
          vendor_id: vendorId,
          capability_key: cap,
          enabled: true
        }))
      )
    }

    /**
     * 3️⃣ Vendor payment profile
     */
    await platformDb('vendor_payment_profiles').insert({
      vendor_id: vendorId,
      provider: 'safaricom',
      business_shortcode: mpesa.business_shortcode,
      passkey_secret_ref: mpesa.passkey_secret_ref,
      enabled: true
    })

    /**
     * 4️⃣ SHARED TENANT — DONE
     */
    if (isolation === 'shared') {
      ctx.body = {
        vendor_id: vendorId,
        isolation_level: 'shared',
        db_target: 'tenant'
      }
      return
    }

    /**
     * 5️⃣ DEDICATED TENANT PROVISIONING
     */
    // const dbName = body.db?.db_name || `tenant_${vendorId.slice(0, 8)}_${randomId(4)}`
    
    const generateDatabaseName = async () => {
      return body.db?.db_name || body.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')   // replace non-alphanumerics with _
      .replace(/^_+|_+$/g, '')       // trim leading/trailing underscores
      .slice(0, 60);                 // keep it safe for Postgres identifiers
    }

    const dbName = await generateDatabaseName();


    const { databaseUrl } = await provisionDedicatedDb(dbName)

    /**
     * Insert tenant as PROVISIONING
     */
    await platformDb('vendor_tenants').insert({
      vendor_id: vendorId,
      database_url: databaseUrl,
      enabled: false,
      status: 'provisioning'
    })

    /**
     * Run migrations + mark READY
     */
    try {
      await runTenantMigrations(databaseUrl)

      await platformDb('vendor_tenants')
        .where({ vendor_id: vendorId })
        .update({
          enabled: true,
          status: 'ready',
          updated_at: new Date()
        })
    } catch (err: any) {
      await platformDb('vendor_tenants')
        .where({ vendor_id: vendorId })
        .update({
          enabled: false,
          status: 'failed',
          last_error: String(err),
          updated_at: new Date()
        })

      throw err
    }

    ctx.body = {
      vendor_id: vendorId,
      isolation_level: 'dedicated',
      db_target: 'tenant',
      database: dbName
    }
  })
}
