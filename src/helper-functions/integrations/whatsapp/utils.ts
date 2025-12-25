export async function getVendorFlowOverrides(db: any, vendorId: string) {
  const row = await db('vendor_flows')
    .where({ vendor_id: vendorId })
    .first()

  return row?.config || {}
}

export function normalize(msg: string) {
  return msg.trim().toLowerCase()
}
