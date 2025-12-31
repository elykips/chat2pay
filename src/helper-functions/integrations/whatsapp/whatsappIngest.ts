// import type { Application } from '@feathersjs/koa'
// import { BadRequest } from '@feathersjs/errors'
// import { handleMessage } from './engine'
// import { runOnboardingState } from './interactiveOnboarding/engine'

// export const whatsappIngest = (app: Application) => {
//   app.use(async (ctx, next) => {
//     if (ctx.path !== '/whatsapp/ingest' || ctx.method !== 'POST') {
//       return next()
//     }

//     const { vendor_id, phone, message } = (ctx.request.body as Record<string, any>) || {}
//     if (!vendor_id || !phone || !message) {
//       throw new BadRequest('vendor_id, phone, message required')
//     }

//     const platformDb = app.get('platformDb')


//     // ─────────────────────────────
//     // 1️⃣ Check vendor onboarding status
//     // ─────────────────────────────
//     const vendor = await platformDb('vendors')
//       .where({ id: vendor_id })
//       .first()

//     const onboardingKeyword =
//       message?.text?.toUpperCase?.() === 'ONBOARD' ||
//       message?.interactive?.button_reply?.id === 'START_ONBOARDING'

//     const needsOnboarding =
//       !vendor || vendor.onboarding_complete !== true

//     // ─────────────────────────────
//     // 2️⃣ Route to ONBOARDING
//     // ─────────────────────────────
//     if (needsOnboarding || onboardingKeyword) {
//       const onboardingService = app.service('onboarding-sessions')

//       let session = await onboardingService.find({
//         query: { phone, vendor_id, $limit: 1 }
//       }).then((r: any) => r.data?.[0])

//       if (!session) {
//         session = await onboardingService.create({
//           vendor_id,
//           phone,
//           state: 'start',
//           payload: {}
//         })
//       }

//       const result = await runOnboardingState({
//         state: session.state,
//         payload: session.payload,
//         message,
//         phone
//       })

//       await onboardingService.patch(session.id, {
//         state: result.nextState,
//         payload: {
//           ...session.payload,
//           ...result.payloadPatch
//         }
//       })

//       // ✅ Finalize onboarding
//       if (result.ready && result.vendorPayload) {
//         await app.service('internal/vendors').create(result.vendorPayload)

//         await platformDb('vendors')
//           .where({ id: vendor_id })
//           .update({ onboarding_complete: true })
//       }

//       ctx.body = { reply: result.reply }
//       return
//     }

//     // ─────────────────────────────
//     // 3️⃣ Route to ORDERING (unchanged)
//     // ──

//     const router = app.get('dbRouter')
//     const { db } = await router.tenantDbForVendor(vendor_id)


//     const result = await handleMessage({
//       vendorId: vendor_id,
//       phone,
//       message,
//       db,
//       app
//     })

//     ctx.body = { reply: result.reply }
//   })
// }


import type { Application } from '@feathersjs/koa'
import { BadRequest } from '@feathersjs/errors'
import { handleMessage } from './engine'
import { runOnboardingState } from './interactiveOnboarding/engine'

export const whatsappIngest = (app: Application) => {
  app.use(async (ctx, next) => {
    if (ctx.path !== '/whatsapp/ingest' || ctx.method !== 'POST') {
      return next()
    }

    const { vendor_id, phone, message } = (ctx.request.body as Record<string, any>) || {}

    // ✅ Minimal validation (works for both flows)
    if (!phone || !message) {
      throw new BadRequest('phone and message required')
    }

    const platformDb = app.get('platformDb')

    // ─────────────────────────────
    // 1️⃣ ONBOARDING PATH (NO vendor_id)
    // ─────────────────────────────
    const onboardingKeyword =
      message?.text?.toUpperCase?.() === 'ONBOARD' ||
      message?.interactive?.button_reply?.id === 'START_ONBOARDING'

    let vendor = null

    if (vendor_id) {
      vendor = await platformDb('vendors')
        .where({ id: vendor_id })
        .first()
    }

    const needsOnboarding =
      !vendor_id ||
      !vendor ||
      vendor.onboarding_complete !== true ||
      onboardingKeyword

    if (needsOnboarding) {
      const onboardingService = app.service('onboarding-sessions')

      let session = await onboardingService.find({
        query: { phone, $limit: 1 }
      }).then((r: any) => r.data?.[0])

      if (!session) {
        session = await onboardingService.create({
          phone,
          state: 'start',
          payload: {}
        })
      }

      const result = await runOnboardingState({
        state: session.state,
        payload: session.payload,
        message,
        phone
      })

      await onboardingService.patch(session.id, {
        state: result.nextState,
        payload: {
          ...session.payload,
          ...result.payloadPatch
        }
      })

      // ✅ Finalize onboarding
      if (result.ready && result.vendorPayload) {
        const createdVendor = await app
          .service('internal/vendors')
          .create(result.vendorPayload)

        await platformDb('vendors')
          .where({ id: createdVendor.id })
          .update({ onboarding_complete: true })
      }

      ctx.body = { reply: result.reply }
      return
    }

    // ─────────────────────────────
    // 2️⃣ ORDERING PATH (vendor_id REQUIRED)
    // ─────────────────────────────
    if (!vendor_id) {
      throw new BadRequest('vendor_id required for ordering')
    }

    const router = app.get('dbRouter')
    const { db } = await router.tenantDbForVendor(vendor_id)

    const result = await handleMessage({
      vendorId: vendor_id,
      phone,
      message,
      db,
      app
    })

    ctx.body = { reply: result.reply }
  })
}
