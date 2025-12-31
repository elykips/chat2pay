import { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { Application } from '@feathersjs/koa';
import { randomUUID } from 'crypto';

export class OnboardingSessionsService extends KnexService {
  app!: Application;

  async setup(app: Application) {
    this.app = app;
  }

  // 🔁 Resume or create session by phone
//   async find(params: any) {
//     const phone = params?.query?.phone;
//     if (!phone) return super.find(params);

//     const existing = await this.Model('onboarding_sessions')
//       .where({ phone })
//       .orderBy('created_at', 'desc')
//       .first();

//     return existing ? [existing] : [];
//   }

  // 🆕 Start onboarding
  async create(data: any) {
    if (!data.phone) {
      throw new Error('phone is required to start onboarding');
    }

    return super.create({
      id: randomUUID(),
      phone: data.phone,
      state: 'start',
      payload: {},
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  // 🔄 Advance onboarding
//   async patch(id: string, data: any) {
//     const patch: any = {
//       updated_at: new Date(),
//     };

//     if (data.state) patch.state = data.state;
//     if (data.payload) {
//       patch.payload = this.app
//         .get('knex')
//         ?.raw('payload || ?', [JSON.stringify(data.payload)]) || data.payload;
//     }

//     return super.patch(id, patch);
//   }


async upsertByPhone(
    vendorId: string,
    phone: string,
    patch: { state?: string; payload?: any },
    params?: Params
  ) {
    // Use tenant db if resolveTenantDb hook set it, otherwise fall back to service Model
    const db = (params as any)?.knex ?? (this as any).Model

    const table = 'onboarding_sessions'

    const existing = await db(table)
      .where({ vendor_id: vendorId, phone })
      .first()

    const now = new Date()

    if (!existing) {
      const row = {
        id: randomUUID(),
        vendor_id: vendorId,
        phone,
        state: patch.state ?? 'start',
        payload: patch.payload ?? {},
        created_at: now,
        updated_at: now
      }

      await db(table).insert(row)
      return row
    }

    // Merge payloads safely
    const nextPayload = {
      ...(existing.payload ?? {}),
      ...(patch.payload ?? {})
    }

    await db(table)
      .where({ id: existing.id })
      .update({
        state: patch.state ?? existing.state,
        payload: nextPayload,
        updated_at: now
      })

    return {
      ...existing,
      state: patch.state ?? existing.state,
      payload: nextPayload,
      updated_at: now
    }
  }

}
