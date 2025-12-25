import type { ClientApplication } from '../../client'
import type { Vendor, VendorData, VendorPatch, VendorQuery } from './vendors.schema'

export type {
  Vendor,
  VendorData,
  VendorPatch,
  VendorQuery
}

/**
 * Registers the vendors service on the client
 */
export const vendorsClient = (client: ClientApplication) => {
  client.use('vendors', client.service('vendors'))
}
