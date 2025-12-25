import type { StateHandler } from '../types'

export const paymentSuccess: StateHandler = async ({ context }) => {
  return {
    reply: `✅ Payment received! Your order is confirmed.\nReceipt: ${context.order?.payment_id || 'N/A'}`,
    nextState: 'completed',
    sideEffect: {
      type: 'notify_n8n',
      payload: { event: 'whatsapp.receipt', data: { ...context } }
    }
  }
}
