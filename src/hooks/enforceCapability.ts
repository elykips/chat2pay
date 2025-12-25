import type { HookContext } from '@feathersjs/feathers'

export const enforceCapability =
  (capabilityKey: string) =>
  async (context: HookContext) => {
    const { params, data, app } = context

    // 🔒 Resolve vendor_id safely from ALL possible locations
    const vendorId =
      params?.query?.vendor_id ||
      data?.vendor_id ||
      params?.route?.vendor_id ||
      params?.headers?.['x-vendor-id']

    if (!vendorId) {
      throw new Error('vendor_id is required for capability enforcement')
    }

    const platformDb = app.get('platformDb')

    // 🔍 Check vendor capability
    const capability = await platformDb('vendor_capabilities')
      .where({
        vendor_id: vendorId,
        capability_key: capabilityKey,
        enabled: true
      })
      .first()

    if (!capability) {
      throw new Error(
        `Vendor ${vendorId} does not have capability ${capabilityKey}`
      )
    }

    // Make vendor_id available downstream
    context.params.vendor_id = vendorId

    return context
  }
