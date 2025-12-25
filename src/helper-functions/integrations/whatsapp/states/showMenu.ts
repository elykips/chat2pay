import type { StateHandler } from '../types'
import { getMenuCached } from '../menuCache'

export const showMenu: StateHandler = async ({ vendorId, message, context, db }) => {
  const text = String(message || '').trim().toUpperCase()

  if (text === 'HELP') {
    return {
      reply: `You can:\n- Reply MENU to browse\n- Reply CART to review\n- Reply CANCEL to clear cart`,
      nextState: 'showMenu'
    }
  }

  if (text === 'CANCEL') {
    return {
      reply: `✅ Cleared. Reply MENU to browse items.`,
      nextState: 'showMenu',
      contextPatch: { cart: { items: [] } }
    }
  }

  if (text === 'CART') {
    return { reply: `Opening your cart…`, nextState: 'reviewCart' }
  }

  const menu = await getMenuCached(db, vendorId)
  if (!menu.length) {
    return {
      reply: `No items available right now. Reply HELP for options.`,
      nextState: 'showMenu'
    }
  }

  const lines = menu.map((i: any, idx: number) => `${idx + 1}. ${i.name} - ${i.price}`)
  return {
    reply: `📋 Menu:\n${lines.join('\n')}\n\nReply with the item number (e.g. 1) or "1 x2" for quantity.`,
    nextState: 'addToCart',
    contextPatch: { menu_cache_key: `menu:${vendorId}` }
  }
}
