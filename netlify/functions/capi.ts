import crypto from 'crypto'

type AnyEvent = {
  httpMethod: string
  headers: Record<string, string | undefined>
  body: string | null
}

const CORS = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }

function sha256(value: string) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export const handler = async (event: AnyEvent) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, body: '', headers: CORS }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed', headers: CORS }

  const pixelId = process.env.META_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  const testCode = process.env.META_CAPI_TEST_CODE // set in Netlify env while testing

  if (!pixelId || !accessToken) {
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ skipped: 'CAPI not configured' }) }
  }

  let body: {
    eventName: string
    eventId: string
    userData?: { fbc?: string; fbp?: string; pageUrl?: string; email?: string; phone?: string }
    customData?: Record<string, unknown>
  }
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { eventName, eventId, userData = {}, customData } = body

  const clientIp = (event.headers['x-forwarded-for'] || '').split(',')[0].trim()
  const userAgent = event.headers['user-agent'] || ''

  const userDataPayload: Record<string, unknown> = {
    client_ip_address: clientIp || undefined,
    client_user_agent: userAgent || undefined,
    fbc: userData.fbc || undefined,
    fbp: userData.fbp || undefined,
  }
  if (userData.email) userDataPayload.em = [sha256(userData.email)]
  if (userData.phone) userDataPayload.ph = [sha256(userData.phone.replace(/\D/g, ''))]

  const payload: Record<string, unknown> = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: userData.pageUrl,
      user_data: userDataPayload,
      ...(customData ? { custom_data: customData } : {}),
    }],
  }
  if (testCode) payload.test_event_code = testCode

  try {
    const res = await fetch(
      `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    )
    const result = await res.json()
    return { statusCode: res.ok ? 200 : 422, headers: CORS, body: JSON.stringify(result) }
  } catch (e: unknown) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(e) }) }
  }
}
