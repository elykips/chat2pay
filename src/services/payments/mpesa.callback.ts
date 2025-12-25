import type { Application } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'
import { emitEvent } from '../../helper-functions/events'

export const registerMpesaCallback = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.path !== '/mpesa/callback' || ctx.method !== 'POST') {
      return next()
    }

    // ─────────────────────────────
    // 1. Verify callback secret
    // ─────────────────────────────
    const secret = ctx.query.s as string
    if (secret !== process.env.MPESA_CALLBACK_SECRET) {
      ctx.status = 403
      ctx.body = { message: 'Invalid callback secret' }
      return
    }

    const paymentId = ctx.query.payment_id as string
    const vendorId = ctx.query.vendor_id as string

    if (!paymentId || !vendorId) {
      throw new BadRequest('Missing payment_id or vendor_id')
    }

    // ─────────────────────────────
    // 2. Resolve tenant DB
    // ─────────────────────────────
    const router = app.get('dbRouter')
    const { db } = await router.tenantDbForVendor(vendorId)

    // ─────────────────────────────
    // 3. Safely parse callback body (TS FIX)
    // ─────────────────────────────
    const rawBody = ctx.request.body

    if (!rawBody || typeof rawBody !== 'object') {
      throw new BadRequest('Invalid callback body')
    }

    const body = rawBody as {
      Body?: {
        stkCallback?: {
          ResultCode: number
          ResultDesc: string
          CheckoutRequestID?: string
          CallbackMetadata?: {
            Item?: { Name: string; Value: any }[]
          }
        }
      }
    }

    const callback = body.Body?.stkCallback
    if (!callback) {
      throw new BadRequest('Missing stkCallback payload')
    }

    const {
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = callback

    // ─────────────────────────────
    // 4. Idempotency check
    // ─────────────────────────────
    const payment = await db('payments')
      .where({ id: paymentId })
      .first()

    if (!payment) {
      throw new BadRequest('Payment not found')
    }

    if (payment.status === 'success' || payment.status === 'failed') {
      ctx.body = { ok: true }
      return
    }

    // ─────────────────────────────
    // 5. Extract receipt
    // ─────────────────────────────
    const receiptItem = CallbackMetadata?.Item?.find(
      (i) => i.Name === 'MpesaReceiptNumber'
    )

    const mpesaReceipt = receiptItem?.Value || null

    // ─────────────────────────────
    // 6. Update payment
    // ─────────────────────────────
    const paymentStatus = ResultCode === 0 ? 'success' : 'failed'

    await db('payments')
      .where({ id: paymentId })
      .update({
        status: paymentStatus,
        mpesa_receipt: mpesaReceipt,
        result_code: ResultCode,
        result_desc: ResultDesc,
        updated_at: new Date()
      })

    // ─────────────────────────────
    // 7. Update order (success only)
    // ─────────────────────────────
    if (paymentStatus === 'success') {
      await db('orders')
        .where({ id: payment.order_id })
        .update({
          status: 'paid',
          updated_at: new Date()
        })
    }

    // ─────────────────────────────
    // 8. Emit domain event
    // ─────────────────────────────
    await emitEvent('payment.completed', {
      payment_id: paymentId,
      vendor_id: vendorId,
      status: paymentStatus,
      mpesa_receipt: mpesaReceipt
    })

    // 8️⃣ Advance WhatsApp session
    await db('whatsapp_sessions')
      .where({
        vendor_id: vendorId,
        phone: payment.customer_phone,
        state: 'paymentPending'
      })
      .update({
        state: paymentStatus === 'success'
          ? 'paymentSuccess'
          : 'paymentFailed',
        updated_at: new Date()
      })

      await emitEvent('whatsapp.state.changed', {
  vendor_id: vendorId,
  phone: payment.customer_phone,
  state: paymentStatus === 'success'
    ? 'paymentSuccess'
    : 'paymentFailed'
})



    // ─────────────────────────────
    // 9. Respond FAST (Safaricom requirement)
    // ─────────────────────────────
    ctx.body = { ok: true }
  })
}


