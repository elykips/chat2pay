import type { StateHandler } from '../types'
import { DEFAULT_CURRENCY } from '../constants'

const MAX_PAYMENT_RETRIES = 3

function money(amount: number) {
  return `${amount} ${DEFAULT_CURRENCY}`
}

export const confirmOrder: StateHandler = async ({ message, context }) => {
  const items = context.cart?.items || []
  if (!items.length) {
    return {
      reply: `Your cart is empty. Reply MENU to browse.`,
      nextState: 'showMenu'
    }
  }

  const amount =
    context.order?.amount ??
    items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const retries = context.payment?.retries ?? 0

  const buttonId =
    (message as any)?.interactive?.button_reply?.id

  const text =
    String((message as any)?.text || '').trim().toUpperCase()

  const action = buttonId || text

  // ─────────────────────────────
  // CANCEL
  // ─────────────────────────────
  if (action === 'ORDER_CANCEL' || action === 'CANCEL') {
    return {
      reply: `❌ Order cancelled. Reply MENU to start again.`,
      nextState: 'showMenu',
      contextPatch: {
        cart: { items: [] },
        order: undefined,
        payment: undefined
      }
    }
  }

  // ─────────────────────────────
  // BACK TO CART
  // ─────────────────────────────
  if (action === 'ORDER_BACK') {
    return {
      reply: `🛒 Returning to your cart…`,
      nextState: 'reviewCart'
    }
  }

  // ─────────────────────────────
  // CONFIRM → CREATE ORDER + PAYMENT
  // ─────────────────────────────
  if (action === 'ORDER_CONFIRM' || action === 'CONFIRM') {
    if (retries >= MAX_PAYMENT_RETRIES) {
      return {
        reply:
          `❌ Payment failed too many times.\n\n` +
          `Please try again later or contact support.`,
        nextState: 'paymentFailed'
      }
    }

    return {
      reply:
        `📲 Payment request sent.\n` +
        `Please complete the M-Pesa prompt on your phone.`,
      nextState: 'paymentPending',
      contextPatch: {
        order: {
          ...(context.order || {}),
          amount,
          currency: DEFAULT_CURRENCY
        },
        payment: {
          ...(context.payment || {}),
          method: 'mpesa_stk',
          status: 'initiated',
          retries: retries + 1
        }
      },
      sideEffect: {
        type: 'create_order_and_payment'
      }
    }
  }

  // ─────────────────────────────
  // SHOW CONFIRMATION UI
  // ─────────────────────────────
  const lines = items.map(
    (i, idx) =>
      `${idx + 1}. ${i.name} x${i.qty} = ${money(i.price * i.qty)}`
  )

  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text:
            `🧾 *Confirm Your Order*\n\n` +
            `${lines.join('\n')}\n\n` +
            `*Total:* ${money(amount)}\n\n` +
            `Proceed to payment?`
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: { id: 'ORDER_CONFIRM', title: 'Pay Now' }
            },
            {
              type: 'reply',
              reply: { id: 'ORDER_BACK', title: 'Back to Cart' }
            },
            {
              type: 'reply',
              reply: { id: 'ORDER_CANCEL', title: 'Cancel' }
            }
          ]
        }
      }
    },
    nextState: 'confirmOrder'
  }
}
