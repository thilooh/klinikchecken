// Server-side proxy for the per-practice contact request submitted
// from the methoden-quiz result page. Forwards a payload tagged
// `type: 'praxis_anfrage'` to the team's GAS, which appends to the
// Praxis_Anfragen sheet. Real e-mail dispatch (to the practice + a
// confirmation to the user) ships in a later phase - for now the
// row in the sheet is the source of truth.
//
// Required GAS handler (extend your existing doPost dispatch):
//   if (data.type === 'praxis_anfrage') return appendPraxisAnfrage(data)
//   function appendPraxisAnfrage(data) {
//     const sheet = SpreadsheetApp.openById('<SHEET_ID>').getSheetByName('Praxis_Anfragen')
//       || SpreadsheetApp.openById('<SHEET_ID>').insertSheet('Praxis_Anfragen')
//     const a = data.answers || {}
//     const cp = data.computedProfile || {}
//     sheet.appendRow([new Date(), data.praxis.id, data.praxis.name,
//       data.lead.vorname, data.lead.email, data.lead.plz,
//       data.telefon || '', data.kontaktart, data.nachricht || '',
//       cp.typ, a.q1_lokalisation, a.q2_trigger, a.q3_groesse, a.q4_hauttyp,
//       a.q5_recognition, (a.q6_versucht || []).join(', '),
//       a.q7_vermeidung, a.q8_zeitziel, data.consent_praxis, 'new'])
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
  let parsed: { type?: string; consent_praxis?: boolean; praxis?: { id?: number; tier?: string } }
  try { parsed = JSON.parse(body) } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }
  if (parsed.type !== 'praxis_anfrage' || parsed.consent_praxis !== true || !parsed.praxis?.id) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing required fields or consent' }) }
  }
  // TODO: once real premium contracts exist, reject `basic` here for
  // defence-in-depth (the brief calls for tier-gating). Currently every
  // clinic is tier='basic' so a 403 would block every quiz inquiry.

  try {
    const res = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'follow',
    })
    const text = await res.text()
    if (!res.ok) {
      console.warn(`[praxis-anfrage] GAS returned ${res.status}:`, text.slice(0, 1000))
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed', gasStatus: res.status }) }
    }
    console.log(`[praxis-anfrage] GAS ok (${text.length} bytes)`)
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('[praxis-anfrage] fetch to GAS threw:', err)
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed' }) }
  }
}
