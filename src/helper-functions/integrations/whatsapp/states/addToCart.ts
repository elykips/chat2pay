import type { StateHandler, CartItem } from '../types'
import { getMenuCached } from '../menuCache'

function parseSelection(input: string) {
  // formats: "1" or "1 x2" or "1x2"
  const cleaned = input.trim().toLowerCase()
  const m = cleaned.match(/^(\d+)\s*(?:x\s*(\d+))?$/) || cleaned.match(/^(\d+)x(\d+)$/)
  if (!m) return null
  const index = Number(m[1])
  const qty = m[2] ? Number(m[2]) : 1
  if (!Number.isFinite(index) || index < 1) return null
  if (!Number.isFinite(qty) || qty < 1 || qty > 20) return null
  return { index, qty }
}

export const addToCart: StateHandler = async ({ vendorId, message, context, db }) => {
  const text = String(message || '').trim()

  const upper = text.toUpperCase()
  if (upper === 'MENU') return { reply: `Opening menu…`, nextState: 'showMenu' }
  if (upper === 'CART') return { reply: `Opening cart…`, nextState: 'reviewCart' }
  if (upper === 'CANCEL') {
    return {
      reply: `✅ Cleared. Reply MENU to browse.`,
      nextState: 'showMenu',
      contextPatch: { cart: { items: [] } }
    }
  }

  const parsed = parseSelection(text)
  if (!parsed) {
    return {
      reply: `Reply with item number (e.g. 1) or "1 x2".\nOr reply CART to review.`,
      nextState: 'addToCart'
    }
  }

  const menu = await getMenuCached(db, vendorId)
  const item = menu[parsed.index - 1]
  if (!item) {
    return { reply: `That item number doesn’t exist. Try again.`, nextState: 'addToCart' }
  }

  const cart = context.cart?.items || []
  const existing = cart.find((c: CartItem) => c.item_id === item.id)
  let newItems: CartItem[]

  if (existing) {
    newItems = cart.map((c: CartItem) =>
      c.item_id === item.id ? { ...c, qty: c.qty + parsed.qty } : c
    )
  } else {
    newItems = [...cart, { item_id: item.id, name: item.name, price: Number(item.price), qty: parsed.qty }]
  }

  return {
    reply: `✅ Added: ${item.name} x${parsed.qty}\nReply another item number, or CART to review.`,
    nextState: 'addToCart',
    contextPatch: { cart: { items: newItems } }
  }
}
