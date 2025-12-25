import { Params } from '@feathersjs/feathers'
import type { Application } from '@feathersjs/koa'
import {randomUUID} from 'crypto'

export class OrdersService {
  app!: Application

  async setup(app: Application) {
    this.app = app
  }

  async create(data: any, params: any) {
    const knex = params.knex
    if (!knex) throw new Error('Tenant DB not resolved')

    const vendorId = params.vendor_id
    if (!vendorId) throw new Error('vendor_id missing')

    // 🛡 robust body parsing
    const body =
      typeof data === 'object' && Object.keys(data).length === 1
        ? JSON.parse(Object.keys(data)[0])
        : data

    const { customer_phone, amount } = body
    if (!customer_phone || !amount) {
      throw new Error('customer_phone and amount required')
    }

  

    const order = {
      id: randomUUID(),
      vendor_id: vendorId,
      customer_phone,
      amount,
      currency: 'KES',
      status: 'created',
      metadata: {},
      created_at: new Date(),
      updated_at: new Date()
    }

    const results = await params.knex('orders').insert(order).returning('*')

    return results
  }
}
