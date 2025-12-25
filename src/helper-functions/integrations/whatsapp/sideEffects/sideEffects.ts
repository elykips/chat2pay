import axios from 'axios'
import type { Application } from '@feathersjs/koa'

type SideEffect =
  | {
      type: 'INITIATE_STK'
      payment_id: string
    }
  | {
      type: 'RETRY_STK'
      payment_id: string
    }
  | {
      type: 'SEND_WHATSAPP'
      phone: string
      payload: any
    }
  | {
      type: 'COMPLETE_SESSION'
      vendor_id: string
      phone: string
    }

export async function runSideEffect(
  effect: SideEffect,
  {
    app,
    vendorId
  }: {
    app: Application
    vendorId: string
  }
) {
  if (!effect) return

  const INTERNAL_KEY = process.env.INTERNAL_API_KEY
  const BASE_URL = process.env.INTERNAL_BASE_URL || 'http://localhost:3030'

  if (!INTERNAL_KEY) {
    throw new Error('INTERNAL_API_KEY missing')
  }

  switch (effect.type) {
    /**
     * ─────────────────────────────
     * M-PESA STK INIT
     * ─────────────────────────────
     */
    case 'INITIATE_STK':
    case 'RETRY_STK': {
      await axios.post(
        `${BASE_URL}/payments/${effect.payment_id}/initiate-stk`,
        {},
        {
          headers: {
            'x-internal-key': INTERNAL_KEY,
            'x-vendor-id': vendorId
          }
        }
      )
      break
    }

    /**
     * ─────────────────────────────
     * SEND WHATSAPP MESSAGE
     * (text, buttons, lists)
     * ─────────────────────────────
     */
    case 'SEND_WHATSAPP': {
      /**
       * This is intentionally abstract.
       * In prod, this can:
       *  - call Meta WhatsApp Cloud API
       *  - enqueue n8n workflow
       *  - send to simulator
       */
      console.log('[WHATSAPP SEND]', {
        to: effect.phone,
        payload: effect.payload
      })
      break
    }

    /**
     * ─────────────────────────────
     * COMPLETE SESSION
     * (called after payment success)
     * ─────────────────────────────
     */
    case 'COMPLETE_SESSION': {
      const router = app.get('dbRouter')
      const { db } = await router.tenantDbForVendor(effect.vendor_id)

      await db('whatsapp_sessions')
        .where({
          vendor_id: effect.vendor_id,
          phone: effect.phone
        })
        .update({
          state: 'completed',
          completed_at: new Date(),
          updated_at: new Date()
        })

      break
    }

    default:
      console.warn('[SIDE EFFECT] Unknown effect', effect)
  }
}
