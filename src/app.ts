// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers, Service } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application } from '@feathersjs/koa'
import { logError } from './hooks/log-error'
import { postgresql } from './postgresql'
import { services } from './services/index'
import { channels } from './channels'
import { registerVendorOnboarding } from './services/internal/vendors/onboard'
import { registerMpesaCallback } from './services/payments/mpesa.callback'
import { registerPaymentsStk } from './services/payments/payments.stk'
import { ServiceTypes } from './declarations'
import { DbRouter } from './db/router'
import { whatsappIngest } from './helper-functions/integrations/whatsapp/whatsappIngest'
import { registerWhatsappInternal } from './helper-functions/integrations/whatsapp/whatsappInternalSessions'

const app: Application<ServiceTypes> = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors())
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(postgresql)

const router = DbRouter(app)
app.set('dbRouter', router)

// ─────────────────────────────
// 3 Middleware
// ─────────────────────────────
registerVendorOnboarding(app)
registerMpesaCallback(app)
registerPaymentsStk(app)
whatsappIngest(app)
registerWhatsappInternal(app)


// ─────────────────────────────
// 4 Services
// ─────────────────────────────
app.configure(services)

app.use(async (ctx, next) => {
  if (ctx.path !== '/debug/db') return next()

  const vendorId = ctx.query.vendor_id as string

  if (!vendorId) {
    ctx.status = 400
    ctx.body = { error: 'vendor_id is required' }
    return
  }

  const router = app.get('dbRouter')
  const { db, isolation } = await router.tenantDbForVendor(vendorId)

  const result = await db.raw(
    'select current_database() as db, current_schema() as schema'
  )

  ctx.body = {
    vendor_id: vendorId,
    isolation,
    ...result.rows[0]
  }
})

app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
