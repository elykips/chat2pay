import type { Application } from '@feathersjs/koa'
import { BadRequest, Forbidden, NotFound, Conflict } from '@feathersjs/errors'
import { getDarajaToken, stkPassword, timestampNow, stkPush } from './../../helper-functions/integrations/mpesa/daraja'
import { emitEvent } from '../../helper-functions/events'

console.log('🔥 payments.stk.ts FILE LOADED')

async function resolveSecret(ref: string) {
  if (ref.startsWith('plain:')) return ref.replace('plain:', '')
  throw new Error(`Unsupported secret ref: ${ref}`)
}

export const registerPaymentsStk = (app: Application) => {
  console.log('🔥 registerPaymentsStk CALLED')

  app.use(async (ctx, next) => {
    if (ctx.method !== 'POST') return next()

    const match = ctx.path.match(/^\/payments\/([^/]+)\/initiate-stk$/)
    if (!match) return next()

    console.log('🔥 STK ROUTE HIT:', ctx.path)

    // ─────────────────────────────
    // 1. Auth
    // ─────────────────────────────
    const internalKey = ctx.headers['x-internal-key']
    if (internalKey !== process.env.INTERNAL_API_KEY) {
      throw new Forbidden('Unauthorized')
    }

    const paymentId = match[1]
    const vendorId =
      (ctx.headers['x-vendor-id'] as string) ||
      (ctx.query.vendor_id as string)

    if (!vendorId) throw new BadRequest('x-vendor-id required')

    // ─────────────────────────────
    // 2. Resolve tenant DB
    // ─────────────────────────────
    const router = app.get('dbRouter')
    const { db, isolation } = await router.tenantDbForVendor(vendorId)

    // console.log('🧭 STK DB:', isolation, await db.raw('select current_database()'))

    // ─────────────────────────────
    // 3. Load payment + order
    // ─────────────────────────────
    console.log('🔥 Loading payment:', paymentId)
    const payment = await db('payments').where({ order_id: paymentId }).first()
    if (!payment) throw new NotFound('Payment not found')

    if (payment.status === 'success') {
      throw new Conflict('Payment already completed')
    }

    const order = await db('orders').where({ id: payment.order_id }).first()
    if (!order) throw new NotFound('Order not found')

    // ─────────────────────────────
    // 4. Vendor MPESA profile (platform DB)
    // ─────────────────────────────
    const platformDb = app.get('platformDb')
    const profile = await platformDb('vendor_payment_profiles')
      .where({ vendor_id: vendorId, provider: 'safaricom', enabled: true })
      .first()

    if (!profile) {
      throw new BadRequest('Vendor MPESA profile missing')
    }

    // ─────────────────────────────
    // 5. MPESA credentials
    // ─────────────────────────────
    const env = (process.env.DARAJA_ENV as 'sandbox' | 'production') || 'sandbox'
    const consumerKey = process.env.DARAJA_CONSUMER_KEY!
    const consumerSecret = process.env.DARAJA_CONSUMER_SECRET!

    if (!consumerKey || !consumerSecret) {
      throw new BadRequest('Missing DARAJA credentials')
    }

    const shortcode = profile.business_shortcode
    const passkey = await resolveSecret(profile.passkey_secret_ref)
    const partyB = profile.party_b || shortcode

    const timestamp = timestampNow()
    const password = stkPassword(shortcode, passkey, timestamp)
    const token = await getDarajaToken(env, consumerKey, consumerSecret)

    // ─────────────────────────────
    // 6. Callback URL
    // ─────────────────────────────
    const baseCallback = process.env.PUBLIC_BASE_URL
    const callbackSecret = process.env.MPESA_CALLBACK_SECRET

    if (!baseCallback || !callbackSecret) {
      throw new BadRequest('Missing callback configuration')
    }

    const callbackUrl =
      `${baseCallback}/mpesa/callback` +
      `?payment_id=${paymentId}` +
      `&vendor_id=${vendorId}` +
      `&s=${callbackSecret}`

    // ─────────────────────────────
    // 7. STK request
    // ─────────────────────────────
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: payment.amount,
      PartyA: order.customer_phone,
      PartyB: partyB,
      PhoneNumber: order.customer_phone,
      CallBackURL: callbackUrl,
      AccountReference: order.id,
      TransactionDesc: `Order ${order.id}`
    }

    const res = await stkPush(env, token, payload)

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResponseCode,
      ResponseDescription,
      CustomerMessage
    } = res.data

    // ─────────────────────────────
    // 8. Persist STK metadata
    // ─────────────────────────────
    await db('payments')
      .where({ id: paymentId })
      .update({
        status: 'pending',
        merchant_request_id: MerchantRequestID,
        checkout_request_id: CheckoutRequestID,
        metadata: {
          ...(payment.metadata || {}),
          stk: {
            ResponseCode,
            ResponseDescription,
            CustomerMessage,
            callbackUrl
          }
        },
        updated_at: new Date()
      })

    // ─────────────────────────────
    // 9. Emit event
    // ─────────────────────────────
    await emitEvent('payment.initiated', {
      payment_id: paymentId,
      vendor_id: vendorId,
      order_id: payment.order_id,
      checkout_request_id: CheckoutRequestID
    })

    ctx.body = {
      ok: true,
      MerchantRequestID,
      CheckoutRequestID,
      CustomerMessage
    }
  })
}
