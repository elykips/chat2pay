export async function initiateStk({ vendorId, context, app }: any) {
  const paymentId = context.order?.payment_id
  if (!paymentId) return

  // You can call your internal STK endpoint, OR call the stk module directly.
  // For now: call your existing endpoint path:
  // POST /payments/:id/initiate-stk with x-vendor-id + x-internal-key

  const internalKey = process.env.INTERNAL_API_KEY
  const base = process.env.PUBLIC_BASE_URL || 'http://localhost:3030'

  // If Daraja is down, keep this safe:
  if (process.env.DISABLE_STK === '1') return

  // Use fetch to avoid axios coupling
  await fetch(`${base}/payments/${paymentId}/initiate-stk`, {
    method: 'POST',
    headers: {
      'x-vendor-id': vendorId,
      'x-internal-key': internalKey || ''
    }
  })
}
