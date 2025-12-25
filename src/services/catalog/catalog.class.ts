import { KnexService } from '@feathersjs/knex'
import type { Application } from '@feathersjs/koa'

export class CatalogService extends KnexService {
  app!: Application

  async setup(app: Application) {
    this.app = app
  }

  async find(params: any){
     console.log('CatalogService find called with vendor_id:', params.query)
    const query = params?.query || {}
    const { vendor_id } = query
   
    if (!vendor_id) {
      throw new Error('vendor_id is required')
    }

    const db = this.app.get('platformDb')

    return db('catalog_items')
      .where({ vendor_id, active: true })
      .orderBy('created_at', 'desc')
  }
}
