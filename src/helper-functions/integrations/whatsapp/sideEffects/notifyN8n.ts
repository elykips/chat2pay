export async function notifyN8n({ vendorId, phone }: any, payload: any) {
  const url = process.env.N8N_WEBHOOK_URL
  if (!url) return

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendor_id: vendorId,
      phone,
      ...payload
    })
  })
}
