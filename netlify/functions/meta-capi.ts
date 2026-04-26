import { createHash } from 'crypto'

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

type RequestBody = {
  eventName: string
  eventId: string
  pageUrl: string
  userAgent: string
  fbp?: string
  fbc?: string
  email?: string
  phone?: string
  customData?: Record<string, unknown>
}

export const handler = async (event: {
  httpMethod: string
  body: string | null
  headers: Record<string, string>
}) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const token = process.env.META_CAPI_TOKEN
  const pixelId = process.env.META_PIXEL_ID
  if (!token || !pixelId) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'CAPI not configured' }) }
  }

  let body: RequestBody
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { eventName, eventId, pageUrl, userAgent, fbp, fbc, email, phone, customData } = body

  if (!eventName || !eventId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'eventName and eventId required' }) }
  }

  const ipAddress =
    event.headers['x-nf-client-connection-ip'] ??
    event.headers['x-forwarded-for']?.split(',')[0]?.trim()

  const userData: Record<string, unknown> = {}
  if (email) userData['em'] = [sha256(email.trim().toLowerCase())]
  if (phone) userData['ph'] = [sha256(phone.replace(/\D/g, ''))]
  if (ipAddress) userData['client_ip_address'] = ipAddress
  if (userAgent) userData['client_user_agent'] = userAgent
  if (fbp) userData['fbp'] = fbp
  if (fbc) userData['fbc'] = fbc

  const capiEvent = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: pageUrl,
    action_source: 'website',
    user_data: userData,
    ...(customData ? { custom_data: customData } : {}),
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [capiEvent] }),
      }
    )
    const data = await res.json() as { events_received?: number; error?: unknown }
    if (!res.ok) {
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Meta API error', detail: data }) }
    }
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, events_received: data.events_received }) }
  } catch {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'fetch failed' }) }
  }
}
