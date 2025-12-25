import { CatalogService } from './catalog.class'
import { authenticateInternal } from '../../hooks/authenticateInternal'
import { enforceCapability } from '../../hooks/enforceCapability'
import type { Application } from '@feathersjs/koa'
import { resolveTenantDb } from '../../hooks/resolveTenantDb'
import { invalidateMenu } from '../../helper-functions/integrations/whatsapp/menuCache'

export const catalog = (app: Application) => {
  app.use(
    'catalog',
    new CatalogService({
      Model: app.get('platformDb'),
      name: 'catalog_items',
      paginate: app.get('paginate')
    }),
    { methods: ['find'] }
  )

  app.service('catalog').hooks({
    before: {
      all: [
        authenticateInternal, 
        resolveTenantDb,
        enforceCapability('commerce.catalog')
      ]
    },
    after: {
      create: [
        async (ctx) => {
          invalidateMenu((ctx.params as any)?.vendor_id)
          return ctx
        }
      ],
      patch: [
        async (ctx) => {
          invalidateMenu((ctx.params as any)?.vendor_id)
          return ctx
        }
      ],
      remove: [
        async (ctx) => {
          invalidateMenu((ctx.params as any)?.vendor_id)
          return ctx
        }
      ]
    }

  })
}
