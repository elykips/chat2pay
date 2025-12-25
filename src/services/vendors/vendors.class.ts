import { KnexService } from '@feathersjs/knex'
import type { Application } from '@feathersjs/koa'

export class VendorsService extends KnexService {
  app!: Application

  async setup(app: Application) {
    this.app = app
  }
}
