import type { ClientApplication } from '../../client'

export interface CatalogItem {
  item_id: string
  name: string
  price: number
  currency: string
}

export const catalogClient = (client: ClientApplication) => {
  client.use('catalog', client.service('catalog'))
}
