import type { ServiceAddons } from '@feathersjs/feathers'
import type { CatalogService } from './services/catalog/catalog.class'
import type { OrdersService } from './services/orders/orders.class'
import type { PaymentsService } from './services/payments/payments.class'
import { Knex } from 'knex'
import { DbRouter } from './db/router'
import { VendorsService } from './services/vendors/vendors.class'

export interface ServiceTypes {
  catalog: CatalogService & ServiceAddons<any>
  orders: OrdersService & ServiceAddons<any>
  payments: PaymentsService & ServiceAddons<any>
  vendors: VendorsService & ServiceAddons<any>
}

declare module './declarations' {
  interface ApplicationConfiguration {
    get(name: 'platformDb'): Knex
    get(name: 'opsDb'): Knex
    get(name: 'dbRouter'): ReturnType<typeof DbRouter>

    set(name: 'platformDb', value: Knex): this
    set(name: 'opsDb', value: Knex): this
    set(name: 'dbRouter', value: ReturnType<typeof DbRouter>): this
  }
}

