import type { Application } from '@feathersjs/koa'
import { PaymentsService } from './payments.class'
import { paymentsHooks } from './payments.hooks'

export const payments = (app: Application) => {
  app.use(
    'payments',
    new PaymentsService(),
    { methods: ['get', 'create', 'patch'] }
  )

  app.service('payments').hooks(paymentsHooks)
}

