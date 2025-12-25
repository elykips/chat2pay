import type { Application } from '@feathersjs/koa'
import { BadRequest, Forbidden } from '@feathersjs/errors'

export const registerWhatsappInternal = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.path !== '/whatsapp/sessions/complete' || ctx.method !== 'POST') {
      return next()
    }

    const internalKey = ctx.headers['x-internal-key']
    if (internalKey !== process.env.INTERNAL_API_KEY) {
      throw new Forbidden('Unauthorized')
    }

    const { vendor_id, phone } = (ctx.request.body as Record<string, unknown>) || {}
    if (!vendor_id || !phone) {
      throw new BadRequest('vendor_id and phone required')
    }

    const router = app.get('dbRouter')
    const { db } = await router.tenantDbForVendor(vendor_id)

    await db('whatsapp_sessions')
      .where({ vendor_id, phone })
      .update({
        state: 'completed',
        completed_at: new Date(),
        updated_at: new Date()
      })

    ctx.body = { ok: true }
  })
}
