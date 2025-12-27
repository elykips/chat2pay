import axios from 'axios'

const N8N_WEBHOOK_URL = process.env.N8N_EVENTS_WEBHOOK!

export async function emitEvent(
  type: string,
  payload: Record<string, any>
) {
  if (!N8N_WEBHOOK_URL) return

  await axios.post(N8N_WEBHOOK_URL, {
    type,
    payload,
    timestamp: new Date().toISOString()
  }).catch(err => {
    console.error('[N8N EMIT ERROR]', err.message)
  })
}
