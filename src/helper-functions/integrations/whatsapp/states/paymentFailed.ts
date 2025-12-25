import type { StateHandler } from '../types'

export const paymentFailed: StateHandler = async ({ context }) => {
  const reason = context.payment?.last_error ? `\nReason: ${context.payment.last_error}` : ''
  return {
    reply: `❌ Payment failed.${reason}\nReply RETRY to try again, or HELP for support.`,
    nextState: 'paymentPending'
  }
}
