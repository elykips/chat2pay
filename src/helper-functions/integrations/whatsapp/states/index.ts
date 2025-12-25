import type { StateName, StateHandler } from '../types'

import { start } from './start'
import { showMenu } from './showMenu'
import { addToCart } from './addToCart'
import { reviewCart } from './reviewCart'
import { confirmOrder } from './confirmOrder'
import { paymentPending } from './paymentPending'
import { paymentSuccess } from './paymentSuccess'
import { paymentFailed } from './paymentFailed'

export const states: Record<StateName, StateHandler> = {
  start,
  showMenu,
  addToCart,
  reviewCart,
  confirmOrder,
  paymentPending,
  paymentSuccess,
  paymentFailed,
  completed: async () => ({
    reply: '✅ This order is already completed. Reply MENU to start a new one.',
    nextState: 'showMenu'
  })
}
