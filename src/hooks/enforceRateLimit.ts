import { HookContext } from '@feathersjs/feathers';
import dayjs from 'dayjs';
import { platformDb } from '../db/platformOpsDb';

export const enforceRateLimit =
  (capabilityKey: string, maxPerDay: number) =>
  async (context: HookContext) => {
    const { vendor_id, customer_phone } = context.data;
    const today = dayjs().startOf('day').toDate();

    const res = await platformDb.query(
      `INSERT INTO capability_usage
       (vendor_id, customer_phone, capability_key, window_start, count)
       VALUES ($1,$2,$3,$4,1)
       ON CONFLICT (vendor_id, customer_phone, capability_key, window_start)
       DO UPDATE SET count = capability_usage.count + 1
       RETURNING count`,
      [vendor_id, customer_phone, capabilityKey, today]
    );

    if (res.rows[0].count > maxPerDay) {
      throw new Error('Rate limit exceeded');
    }

    return context;
  };
