import type { ClientApplication } from '../../client'

export interface Order {
  order_id: string
  vendor_id: string
  customer_phone: string
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED'
  total?: number
}

export interface OrderData {
  vendor_id: string
  customer_phone: string
}

export interface OrderPatch {
  action: 'confirm' | 'mark_paid' | 'cancel'
}

export const ordersClient = (client: ClientApplication) => {
  client.use('orders', client.service('orders'))
}
