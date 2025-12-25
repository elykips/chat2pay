import type { ClientApplication } from '../../client'

export interface Payment {
  payment_intent_id: string
  status: 'INITIATED' | 'PENDING' | 'SUCCESS' | 'FAILED'
  mpesa_receipt?: string
}

export interface PaymentData {
  vendor_id: string
  amount: number
  customer_phone: string
  reference_id: string
}

export interface PaymentPatch {
  checkout_request_id?: string
  merchant_request_id?: string
  status?: 'SUCCESS' | 'FAILED'
  mpesa_receipt?: string
}

export const paymentsClient = (client: ClientApplication) => {
  client.use('payments', client.service('payments'))
}
