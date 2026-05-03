// Server-side proxy for the termin-wunsch widget on /auswertung.
// Forwards a payload tagged `type: 'termin_anfrage'` to the same GAS
// endpoint that already handles quiz-leads and praxis-anfragen, so
// downstream tooling stays unified. Writes to a new "Termin_Anfragen"
// tab in the spreadsheet.
//
// No email dispatch from this function yet. The founder reads the
// sheet and forwards manually until per-praxis email addresses ship.
//
// Required GAS handler (extend the existing doPost dispatch):
//   if (data.type === 'termin_anfrage') return appendTerminAnfrage(data)
//   function appendTerminAnfrage(data) {
//     const sheet = SpreadsheetApp.openById('<SHEET_ID>').getSheetByName('Termin_Anfragen')
//       || SpreadsheetApp.openById('<SHEET_ID>').insertSheet('Termin_Anfragen')
//     const a = data.answers || {}
//     const cp = data.computedProfile || {}
//     const slotsText = (data.slots || []).map(s => s.date + ' ' + s.zeit).join(' | ')
//     sheet.appendRow([new Date(), data.praxis.id, data.praxis.name, data.praxis.city,
//       data.lead.vorname, data.lead.email, data.lead.plz,
//       data.telefon || '', data.notiz || '', slotsText,
//       cp.typ, a.q1_lokalisation, a.q2_trigger, a.q3_groesse, a.q4_hauttyp,
//       (a.q6_versucht || []).join(', '), a.q7_vermeidung, a.q8_zeitziel,
//       data.consent_praxis, 'new'])
//     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
//       .setMimeType(ContentService.MimeType.JSON)
//   }

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

export const handler = async (event: {
  httpMethod: string
  body: string | null
}) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const sheetUrl = process.env.GOOGLE_SHEET_URL
  if (!sheetUrl) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'GOOGLE_SHEET_URL not configured' }) }
  }

  const body = event.body ?? '{}'
  let parsed: {
    type?: string
    consent_praxis?: boolean
    praxis?: { id?: number }
    slots?: Array<{ date?: string; zeit?: string }>
    lead?: { email?: string }
  }
  try { parsed = JSON.parse(body) } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }
  if (parsed.type !== 'termin_anfrage' || parsed.consent_praxis !== true || !parsed.praxis?.id || !parsed.lead?.email) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing required fields or consent' }) }
  }
  if (!Array.isArray(parsed.slots) || parsed.slots.length === 0) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'At least one slot required' }) }
  }
  if (parsed.slots.length > 5) {
    // Defence against pathological payloads. UI caps at 3.
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Too many slots' }) }
  }

  try {
    const res = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'follow',
    })
    const text = await res.text()
    if (!res.ok) {
      console.warn(`[termin-buchen] GAS returned ${res.status}:`, text.slice(0, 1000))
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed', gasStatus: res.status }) }
    }
    console.log(`[termin-buchen] GAS ok (${text.length} bytes)`)
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('[termin-buchen] fetch to GAS threw:', err)
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed' }) }
  }
}
