import type { Application } from '@feathersjs/koa'
import { VendorsService } from './vendors.class'

export const vendors = (app: Application) => {
  const platformDb = app.get('platformDb')

  if (!platformDb) {
    throw new Error('platformDb is not configured')
  }


  app.get('platformDb').raw('select current_database(), current_schema()')
  .then((r:any) => console.log('Vendors DB:', r.rows))


  app.use('vendors', new VendorsService({
  Model: app.get('platformDb'),
  name: 'vendors',
  paginate: app.get('paginate')
}), {
  methods: ['find', 'get', 'patch']
})

}
