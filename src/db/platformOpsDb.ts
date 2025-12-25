import { Pool } from 'pg';

export const platformDb = new Pool({
  host: process.env.PLATFORM_DB_HOST,
  database: process.env.PLATFORM_DB_NAME,
  user: process.env.PLATFORM_DB_USER,
  password: process.env.PLATFORM_DB_PASSWORD
});

export const opsDb = new Pool({
  host: process.env.OPS_DB_HOST,
  database: process.env.OPS_DB_NAME,
  user: process.env.OPS_DB_USER,
  password: process.env.OPS_DB_PASSWORD
});


export async function getVendor(vendorId: string) {
  const res = await platformDb.query(
    `SELECT vendor_id, status, data_mode
     FROM vendors
     WHERE vendor_id = $1`,
    [vendorId]
  );
  return res.rows[0];
}

export async function getVendorCapabilities(vendorId: string) {
  const res = await platformDb.query(
    `SELECT vc.capability_key, vc.config, c.dependencies
     FROM vendor_capabilities vc
     JOIN capabilities c ON vc.capability_key = c.capability_key
     WHERE vc.vendor_id = $1 AND vc.enabled = true`,
    [vendorId]
  );

  const map: Record<string, any> = {};
  for (const row of res.rows) {
    map[row.capability_key] = {
      config: row.config,
      dependencies: row.dependencies
    };
  }
  return map;
}
