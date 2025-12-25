import 'dotenv/config'
import type { Knex } from 'knex'

const { PLATFORM_DB_URL,OPS_DB_URL,DEDICATED_TENANT_DB_URL, SHARED_TENANT_DB_URL} = process.env


const config: { [key: string]: Knex.Config } = {
  platform: {
    client: 'pg',
    connection: PLATFORM_DB_URL,
    migrations: {
      directory: 'migrations/platform',
    },
    seeds: {
    directory: './seeds/platform'
  }
  },
  operations: {
    client: 'pg',
    connection: OPS_DB_URL,
    migrations: {
      directory: 'migrations/ops',
    }
  },
  sharedTenant: {
    client: 'pg',
    connection: SHARED_TENANT_DB_URL,
    migrations: {
      directory: 'migrations/tenants'
    }
  },
  dedicatedTenant: {
    client: 'pg',
    connection: DEDICATED_TENANT_DB_URL,
    migrations: {
       directory: 'migrations/tenants',
    }
  }
}

export default config

