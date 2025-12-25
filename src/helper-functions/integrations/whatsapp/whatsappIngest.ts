import type { Application } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'
import { handleMessage } from './engine'

export const whatsappIngest = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.path !== '/whatsapp/ingest' || ctx.method !== 'POST') {
      return next()
    }

    const { vendor_id, phone, message } = (ctx.request.body as Record<string, any>) || {}
    if (!vendor_id || !phone || !message) {
      throw new BadRequest('vendor_id, phone, message required')
    }

    const router = app.get('dbRouter')
    const { db } = await router.tenantDbForVendor(vendor_id)

    const result = await handleMessage({
      vendorId: vendor_id,
      phone,
      message,
      db,
      app
    })

    ctx.body = { reply: result.reply }
  })
}
