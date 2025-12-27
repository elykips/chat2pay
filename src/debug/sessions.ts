import type { Application } from '@feathersjs/koa'
import { BadRequest, Forbidden, NotFound } from '@feathersjs/errors'

export const debugSession = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.path !== '/debug/session' || ctx.method !== 'GET') {
      return next()
    }

    // 🔐 Internal-only
    if (ctx.headers['x-internal-key'] !== process.env.INTERNAL_API_KEY) {
      throw new Forbidden('Unauthorized')
    }

    const vendorId = ctx.query.vendor_id as string
    const phone = ctx.query.phone as string

    if (!vendorId || !phone) {
      throw new BadRequest('vendor_id and phone are required')
    }

    // 🔁 Resolve tenant DB
    const router = app.get('dbRouter')
    const { db } = await router.tenantDbForVendor(vendorId)

    const session = await db('whatsapp_sessions')
      .where({ vendor_id: vendorId, phone })
      .first()

    if (!session) {
      throw new NotFound('WhatsApp session not found')
    }

    ctx.body = {
      vendor_id: vendorId,
      phone,
      session
    }
  })
}
