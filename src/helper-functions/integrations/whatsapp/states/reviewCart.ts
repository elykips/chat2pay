import type { StateHandler } from '../types'

export const reviewCart: StateHandler = async ({ message, context }) => {
  const upper = String(message || '').trim().toUpperCase()

  const items = context.cart?.items || []
  if (!items.length) {
    return {
      reply: `Your cart is empty. Reply MENU to browse.`,
      nextState: 'showMenu'
    }
  }

  if (upper === 'CANCEL') {
    return {
      reply: `✅ Cleared. Reply MENU to browse.`,
      nextState: 'showMenu',
      contextPatch: { cart: { items: [] } }
    }
  }

  if (upper === 'CHECKOUT') {
    return { reply: `Great — confirming your order…`, nextState: 'confirmOrder' }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const lines = items.map(i => `- ${i.name} x${i.qty} = ${i.price * i.qty}`)

  return {
    reply: `🛒 Your cart:\n${lines.join('\n')}\n\nTotal: ${total}\n\nReply CHECKOUT to pay, MENU to add more, or CANCEL to clear.`,
    nextState: 'reviewCart',
    contextPatch: { order: { ...(context.order || {}), amount: total } }
  }
}
