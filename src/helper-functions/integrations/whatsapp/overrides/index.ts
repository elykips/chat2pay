import type { StateName, StateHandler } from '../types'

export type VendorOverrides = Partial<Record<StateName, StateHandler>>

const overrides: Record<string, VendorOverrides> = {}

export function registerVendorOverrides(vendorId: string, vendorOverrides: VendorOverrides) {
  overrides[vendorId] = vendorOverrides
}

export function resolveStateHandler(
  vendorId: string,
  state: StateName,
  defaultStates: Record<StateName, StateHandler>
): StateHandler {
  const vendor = overrides[vendorId]
  const overridden = vendor?.[state]
  return overridden ?? defaultStates[state]
}

export function getVendorOverrides(vendorId: string): VendorOverrides {
  return overrides[vendorId] || {}
}
