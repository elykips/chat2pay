import type { SideEffect } from '../types'
import { createOrderAndPayment } from './createOrderAndPayment'
import { initiateStk } from './initiateStk'
import { notifyN8n } from './notifyN8n'

export async function runSideEffect(effect: SideEffect, args: any) {
  if (!effect || effect.type === 'none') return

  switch (effect.type) {
    case 'create_order_and_payment':
      return createOrderAndPayment(args)
    case 'initiate_stk':
      return initiateStk(args)
    case 'notify_n8n':
      return notifyN8n(args, effect.payload)
    default:
      return
  }
}
