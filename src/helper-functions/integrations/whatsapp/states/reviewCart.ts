import type { StateHandler } from '../types'

function money(n: number) {
  return `KES ${n}`
}

export const reviewCart: StateHandler = async ({ message, context }) => {
  // ─────────────────────────────
  // Normalize incoming input
  // ─────────────────────────────
  const text =
    String((message as any)?.text || '').trim().toUpperCase()

  const buttonId =
    (message as any)?.interactive?.button_reply?.id ||
    null

  const action = buttonId || text

  // ─────────────────────────────
  // Ensure cart exists
  // ─────────────────────────────
  const items = context.cart?.items || []

  if (!items.length) {
    return {
      reply: {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: `🛒 Your cart is empty.\nTap *Browse Menu* to add items.`
          },
          action: {
            buttons: [
              {
                type: 'reply',
                reply: { id: 'CART_ADD_MORE', title: 'Browse Menu' }
              }
            ]
          }
        }
      },
      nextState: 'showMenu'
    }
  }

  // ─────────────────────────────
  // Handle actions
  // ─────────────────────────────
  if (action === 'CART_CANCEL' || action === 'CANCEL') {
    return {
      reply: `✅ Cart cleared. Reply MENU to browse.`,
      nextState: 'showMenu',
      contextPatch: { cart: { items: [] } }
    }
  }

  if (
    action === 'CART_ADD_MORE' ||
    action === 'MENU' ||
    action === 'ADD MORE'
  ) {
    return {
      reply: `👍 Sure — here’s the menu.`,
      nextState: 'showMenu'
    }
  }

  if (action === 'CART_CHECKOUT' || action === 'CHECKOUT') {
    return {
      reply: `✅ Great.\nConfirming your order…`,
      nextState: 'confirmOrder'
    }
  }

  // ─────────────────────────────
  // Render cart summary + buttons
  // ─────────────────────────────
  const total = items.reduce(
    (sum: number, i: any) => sum + i.price * i.qty,
    0
  )

  const lines = items.map(
    (i: any, idx: number) =>
      `${idx + 1}. ${i.name} x${i.qty} = ${money(i.price * i.qty)}`
  )

  return {
    reply: {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text:
            `🛒 *Your Cart*\n` +
            `${lines.join('\n')}\n\n` +
            `*Total:* ${money(total)}\n\n` +
            `What would you like to do?`
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: { id: 'CART_CHECKOUT', title: 'Checkout' }
            },
            {
              type: 'reply',
              reply: { id: 'CART_ADD_MORE', title: 'Add more' }
            },
            {
              type: 'reply',
              reply: { id: 'CART_CANCEL', title: 'Cancel' }
            }
          ]
        }
      }
    },
    nextState: 'reviewCart',
    contextPatch: {
      order: {
        ...(context.order || {}),
        amount: total
      }
    }
  }
}