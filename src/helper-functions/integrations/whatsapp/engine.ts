import crypto from 'crypto'
import type { StateName, SessionContext } from './types'
import { states } from './states'
import { resolveStateHandler } from './overrides'
import { runSideEffect } from './sideEffects'
import { SESSION_TIMEOUT_MINUTES } from './constants'

function isTimedOut(lastAt: Date) {
  const mins = (Date.now() - new Date(lastAt).getTime()) / 60000
  return mins > SESSION_TIMEOUT_MINUTES
}

export async function handleMessage({ vendorId, phone, message, db, app }: any) {
  let session = await db('whatsapp_sessions')
    .where({ vendor_id: vendorId, phone })
    .first()

  if (!session) {
    session = {
      id: crypto.randomUUID(),
      vendor_id: vendorId,
      phone,
      state: 'start',
      context: {},
      // attempts: {},
      last_state_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }
    await db('whatsapp_sessions').insert(session)
  }

  // timeout resets
  if (session.last_state_at && isTimedOut(session.last_state_at)) {
    await db('whatsapp_sessions')
      .where({ id: session.id })
      .update({
        state: 'start',
        context: {},
        attempts: {},
        last_state_at: new Date(),
        updated_at: new Date()
      })

    session.state = 'start'
    session.context = {}
    session.attempts = {}
  }

  const stateName = session.state as StateName
  const handler = resolveStateHandler(vendorId, stateName, states)

  const result = await handler({
    vendorId,
    phone,
    message,
    context: (session.context || {}) as SessionContext,
    db,
    app
  })

  const nextState = result.nextState ?? stateName
  const mergedContext = { ...(session.context || {}), ...(result.contextPatch || {}) }

  await db('whatsapp_sessions')
    .where({ id: session.id })
    .update({
      state: nextState,
      context: mergedContext,
      last_state_at: new Date(),
      updated_at: new Date()
    })

  // Run side effect AFTER saving state (safe + idempotent friendly)
  if (result.sideEffect) {
    await runSideEffect(result.sideEffect, {
      vendorId,
      phone,
      message,
      context: mergedContext,
      db,
      app
    })
  }

  return result
}
