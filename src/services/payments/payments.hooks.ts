import { authenticateInternal } from '../../hooks/authenticateInternal'
import { resolveTenantDb } from '../../hooks/resolveTenantDb'
import { enforceCapability } from '../../hooks/enforceCapability'
import { enforceRateLimit } from '../../hooks/enforceRateLimit'
import { emitEvent } from '../../helper-functions/events'

/**
 * After payment patch: reconcile payment result → update order status if needed.
 * Works for both shared + dedicated tenant DB because resolveTenantDb already routed Model.
 */
export const reconcilePaymentAfterPatch = async (context: any) => {
  if (context.method !== 'patch') return context

  const payment = context.result
  if (!payment) return context

  // Only act on terminal statuses
  if (!['success', 'failed'].includes(payment.status)) {
    return context
  }

  // If success, mark order as paid (in same tenant DB)
  if (payment.status === 'success' && payment.order_id) {
    // Use same tenant Model (already routed by resolveTenantDb)
    const db = context.service.Model

    await db('orders')
      .where({ id: payment.order_id })
      .update({ status: 'paid', updated_at: new Date() })
  }

  // Emit event (n8n listener)
  await emitEvent('payment.completed', {
    vendor_id: payment.vendor_id,
    payment_id: payment.id,
    order_id: payment.order_id,
    status: payment.status,
    mpesa_receipt: payment.mpesa_receipt || null,
    result_code: payment.result_code ?? null,
    result_desc: payment.result_desc ?? null
  })

  return context
}

export const paymentsHooks = {
  before: {
    all: [
      (ctx: any) => {
      if (ctx.params?.internal) return ctx
      return authenticateInternal(ctx)
    },
      // authenticateInternal,
      resolveTenantDb // ✅ replaces resolveVendor
    ],
    create: [
      enforceCapability('payments.mpesa_stk'),
      enforceRateLimit('payments.mpesa_stk', 30)
    ],
    patch: [
      enforceCapability('payments.mpesa_stk')
    ]
  },
  after: {
    patch: [reconcilePaymentAfterPatch]
  }
}
