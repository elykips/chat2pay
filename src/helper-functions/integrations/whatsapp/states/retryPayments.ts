const MAX_RETRIES = 3
const MIN_INTERVAL_MS = 60 * 1000

export default async function retryPayment({ context, db, vendorId, phone }: any) {
  const payment = context.payment

  if (!payment) {
    return {
      ui: { type: 'text', body: '❌ No payment found for this order.' },
      nextState: 'completed'
    }
  }

  if (payment.retries >= MAX_RETRIES) {
    return {
      ui: {
        type: 'text',
        body: '🚫 You have reached the maximum number of payment attempts.'
      },
      nextState: 'completed'
    }
  }

  const now = Date.now()
  const last = new Date(payment.last_attempt_at || 0).getTime()

  if (now - last < MIN_INTERVAL_MS) {
    return {
      ui: {
        type: 'text',
        body: '⏳ Please wait a minute before retrying payment.'
      },
      nextState: 'paymentFailed'
    }
  }

  // Update retry counters
  return {
    ui: {
      type: 'text',
      body: '📲 Retrying payment request...'
    },
    nextState: 'paymentPending',
    contextPatch: {
      payment: {
        ...payment,
        retries: payment.retries + 1,
        last_attempt_at: new Date().toISOString()
      }
    },
    sideEffect: {
      type: 'RETRY_STK',
      payment_id: payment.payment_id
    }
  }
}
