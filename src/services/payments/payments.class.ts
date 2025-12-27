import { BadRequest } from '@feathersjs/errors'
import type { Params } from '@feathersjs/feathers'
import { emitEvent } from '../../helper-functions/events/events'
import { randomUUID } from 'crypto'
import { Application } from '@feathersjs/koa'
import { KnexService } from '@feathersjs/knex'

export class PaymentsService {
  
 app!: Application

  async setup(app: Application) {
    this.app = app
  }

  async create(data: any, params: Params) {
    const vendorId =
      params.headers?.['x-vendor-id'] ||
      data.vendor_id

      

    if (!vendorId) {
      throw new BadRequest('vendor_id is required')
    }

    if (!data.order_id || !data.amount) {
      throw new BadRequest('order_id and amount are required')
    }

    // 🔹 Resolve tenant DB
    const router = this.app.get('dbRouter')
    const { db } = await router.tenantDbForVendor(vendorId)

    // 🔹 Idempotency: avoid duplicate payment per order
    const existing = await db('payments')
      .where({ order_id: data.order_id })
      .whereIn('status', ['initiated', 'pending', 'success'])
      .first()

    if (existing) {
      return existing
    }

    const payment = {
      id: randomUUID(),
      vendor_id: vendorId,
      order_id: data.order_id,
      amount: data.amount,
      currency: data.currency || 'KES',
      method: data.method || 'mpesa_stk',
      provider: data.provider || 'safaricom',
      status: 'initiated',
      reference: null,
      metadata: {},
      created_at: new Date(),
      updated_at: new Date()
    }

    await db('payments').insert(payment)
    
    await emitEvent('payment.created', {
    vendor_id: vendorId,
    payment_id: payment.id,
    order_id: data.order_id,
    amount: data.amount,
    method: payment.method
  })

    return payment
  }

  async patch(id: string, data: any, params: any) {
  const vendorId =
    params.headers?.['x-vendor-id'] ||
    data.vendor_id

  if (!vendorId) {
    throw new Error('vendor_id required for patch')
  }

  const router = this.app.get('dbRouter')
  const { db } = await router.tenantDbForVendor(vendorId)

  await db('payments')
    .where({ id })
    .update({
      ...data,
      updated_at: new Date()
    })

  return db('payments').where({ id }).first()
}

async get(id: string, params: any) {
  const vendorId = params.headers?.['x-vendor-id']
  if (!vendorId) throw new Error('vendor_id required')

  const router = this.app.get('dbRouter')
  const { db } = await router.tenantDbForVendor(vendorId)

  const record = await db('payments').where({ id }).first()
  if (!record) {
    throw new Error('Payment not found')
  }

  return record
}

}
