// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '@feathersjs/koa'
import { catalog } from './catalog/catalog'
import { orders } from './orders/orders'
import { vendors } from './vendors/vendors'
import { payments } from './payments/payments'
import { debugSession } from '../debug/sessions'

export const services = (app: Application) => {
  // All services will be registered here
    app.configure(vendors)
    app.configure(orders)
    app.configure(payments)
    app.configure(catalog)
    app.configure(debugSession)
}
