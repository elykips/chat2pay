import type { StateHandler } from '../types'
import { DEFAULT_CURRENCY } from '../constants'

export const confirmOrder: StateHandler = async ({ context }) => {
  const items = context.cart?.items || []
  if (!items.length) {
    return { reply: `Your cart is empty. Reply MENU to browse.`, nextState: 'showMenu' }
  }

  const amount = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return {
    reply: `Confirming your order of ${amount} ${DEFAULT_CURRENCY}…`,
    nextState: 'paymentPending',
    contextPatch: {
      order: {
        ...(context.order || {}),
        amount,
        currency: DEFAULT_CURRENCY
      },
      payment: { ...(context.payment || {}), method: 'mpesa_stk', status: 'initiated', retries: 0 }
    },
    sideEffect: { type: 'create_order_and_payment' }
  }
}
