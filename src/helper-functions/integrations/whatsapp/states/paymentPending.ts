import type { StateHandler } from '../types'
import { PAYMENT_RETRY_LIMIT } from '../constants'

export const paymentPending: StateHandler = async ({ message, context }) => {
  const upper = String(message || '').trim().toUpperCase()

  if (upper === 'STATUS') {
    const status = context.payment?.status || 'pending'
    return { reply: `Payment status: ${status}. Reply STATUS again to refresh.`, nextState: 'paymentPending' }
  }

  if (upper === 'RETRY') {
    const retries = context.payment?.retries || 0
    if (retries >= PAYMENT_RETRY_LIMIT) {
      return {
        reply: `You’ve reached the retry limit. Reply HELP for support.`,
        nextState: 'paymentFailed'
      }
    }
    return {
      reply: `Retrying payment request…`,
      nextState: 'paymentPending',
      contextPatch: { payment: { ...(context.payment || {}), retries: retries + 1 } },
      sideEffect: { type: 'initiate_stk' }
    }
  }

  return {
    reply: `⏳ Waiting for payment confirmation…\nReply STATUS to check, or RETRY to re-send prompt.`,
    nextState: 'paymentPending'
  }
}
