import axios from 'axios'
import { Buffer } from 'buffer'

type Env = 'sandbox' | 'production'

const baseUrl = (env: Env) =>
  env === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'

let cachedToken: { token: string; expMs: number } | null = null

export async function getDarajaToken(env: Env, consumerKey: string, consumerSecret: string) {
  const now = Date.now()
  if (cachedToken && cachedToken.expMs > now + 10_000) return cachedToken.token

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')
  const url = `${baseUrl(env)}/oauth/v1/generate?grant_type=client_credentials`

  const res = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` }
  })

  const token = res.data.access_token as string
  const expiresIn = Number(res.data.expires_in || 3599) // seconds (commonly ~3600)
  cachedToken = { token, expMs: now + expiresIn * 1000 }

  return token
}

export function stkPassword(shortcode: string, passkey: string, timestamp: string) {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

export function timestampNow() {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

export async function stkPush(env: Env, token: string, payload: any) {
  const url = `${baseUrl(env)}/mpesa/stkpush/v1/processrequest`
  return axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
}
