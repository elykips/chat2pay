import { randomUUID } from 'crypto'
import type { DEFAULT_CURRENCY } from '../constants'

export async function createOrderAndPayment({ vendorId, phone, context, db, app }: any) {
  const amount = context.order?.amount
  const currency = context.order?.currency || 'KES'

  const orderId = randomUUID()
  const paymentId = randomUUID()

  await db('orders').insert({
    id: orderId,
    vendor_id: vendorId,
    customer_phone: phone,
    amount,
    currency,
    status: 'created',
    metadata: { cart: context.cart?.items || [] },
    created_at: new Date(),
    updated_at: new Date()
  })

  await db('payments').insert({
    id: paymentId,
    vendor_id: vendorId,
    order_id: orderId,
    amount,
    currency,
    method: 'mpesa_stk',
    provider: 'safaricom',
    status: 'initiated',
    metadata: {},
    created_at: new Date(),
    updated_at: new Date()
  })

  // Update session context immediately (engine will merge patch if you return it from state,
  // but sideEffect runs after state; so we write back directly).
  await db('whatsapp_sessions')
    .where({ vendor_id: vendorId, phone })
    .update({
      context: {
        ...context,
        order: { ...(context.order || {}), order_id: orderId, payment_id: paymentId },
        payment: { ...(context.payment || {}), status: 'pending' }
      },
      updated_at: new Date()
    })

  // Optional: kick STK immediately
  // If you want it automatic:
  // await app.service('payments').create(...) etc
}
