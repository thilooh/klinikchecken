// Server-side proxy from frontend to the Google Apps Script that
// writes leads into the team's Google Sheet. Three reasons we need it:
//
// 1. The browser previously POSTed directly to GAS in `mode: 'no-cors'`,
//    so the response was opaque - we couldn't tell whether the request
//    landed. Result: 10 leads in Meta, 0 in the sheet, no signal why.
// 2. With this proxy the frontend gets a real status back; failures
//    are logged to Sentry so the team finds out instead of guessing.
// 3. The GAS endpoint URL stays out of the public bundle, removing the
//    spam-target side of having a write endpoint indexed in JS.
//
// The function only forwards the JSON body - no transformation.

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export const handler = async (event: {
  httpMethod: string
  body: string | null
}) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const sheetUrl = process.env.GOOGLE_SHEET_URL
  if (!sheetUrl) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'GOOGLE_SHEET_URL not configured' }) }
  }

  const body = event.body ?? '{}'
  try { JSON.parse(body) } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  try {
    const res = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      // GAS Web Apps respond with a 302 to script.googleusercontent.com
      // on the first POST. fetch follows it by default; explicit for clarity.
      redirect: 'follow',
    })
    const text = await res.text()
    // Log full GAS response server-side only - it can contain the GAS
    // URL on error pages, which is exactly what we moved off the client.
    if (!res.ok) {
      console.warn(`[lead-write] GAS returned ${res.status}:`, text.slice(0, 1000))
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed', gasStatus: res.status }) }
    }
    console.log(`[lead-write] GAS ok (${text.length} bytes)`)
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('[lead-write] fetch to GAS threw:', err)
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed' }) }
  }
}
