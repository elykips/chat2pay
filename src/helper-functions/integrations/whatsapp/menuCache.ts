// src/helper-functions/integrations/whatsapp/menuCache.ts

type CacheEntry = {
  at: number
  data: any[]
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 60_000 // 1 min (increase in prod)

function keyForVendor(vendorId: string) {
  return `menu:${vendorId}`
}

export async function getMenuCached(db: any, vendorId: string) {
  const key = keyForVendor(vendorId)
  const hit = cache.get(key)

  if (hit && Date.now() - hit.at < TTL_MS) {
    return hit.data
  }

  const items = await db('catalog_items')
    .where({ vendor_id: vendorId, active: true })
    .select('id', 'name', 'price')
    .orderBy('name', 'asc')

  cache.set(key, { at: Date.now(), data: items })
  return items
}

/**
 * 🔥 MUST be called when catalog changes
 * (create / patch / remove)
 */
export function invalidateMenu(vendorId: string) {
  const key = keyForVendor(vendorId)
  cache.delete(key)
}

/**
 * Optional: for admin/debug use
 */
export function clearAllMenus() {
  cache.clear()
}
