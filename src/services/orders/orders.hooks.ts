import { HookContext } from '@feathersjs/feathers'
import { randomUUID } from 'crypto'

export const createPaymentAfterOrder = async (context: HookContext) => {
  const { result, app, params } = context

  // 🔑 Normalize result (array vs object)
  const order = Array.isArray(result) ? result[0] : result

  if (!order?.id) {
    throw new Error('Order ID missing after create')
  }

  const vendorId = params.vendor_id

  const payment = {
    id: randomUUID(),
    vendor_id: vendorId,
    order_id: order.id,              // ✅ FIX
    amount: order.amount,
    currency: order.currency || 'KES',
    method: 'mpesa_stk',
    provider: 'safaricom',
    status: 'initiated',
    reference: null,
    metadata: {},
    created_at: new Date(),
    updated_at: new Date()
  }

  console.log('Creating payment after order:', payment )

  // IMPORTANT: reuse same tenant DB via params.knex
  await params.knex('payments').insert(payment)

  return context
}
