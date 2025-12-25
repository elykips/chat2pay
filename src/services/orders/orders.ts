import type { Application } from '@feathersjs/koa'
import { OrdersService } from './orders.class'
import { authenticateInternal } from '../../hooks/authenticateInternal'
import { enforceCapability } from '../../hooks/enforceCapability'
import { resolveTenantDb } from '../../hooks/resolveTenantDb'
import { createPaymentAfterOrder } from './orders.hooks'

export const orders = (app: Application) => {
  app.use('orders', new OrdersService())

  app.service('orders').hooks({
    before: {
      all: [
        authenticateInternal,
        resolveTenantDb,
        enforceCapability('commerce.orders')
      ]
    },
    after: {
      create: [createPaymentAfterOrder]
    }
  })
}
