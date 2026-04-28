// Server-side proxy from the methoden-quiz lead-capture step to the
// Google Apps Script that writes into the team's Sheet. Mirrors
// netlify/functions/lead-write.ts - the only delta is that the
// payload carries `type: 'quiz_lead'` so the GAS dispatch can route
// it to a different sheet/tab than the inquiry-modal leads.
//
// Required GAS handler (extend your existing doPost):
//   function doPost(e) {
//     const data = JSON.parse(e.postData.contents)
//     if (data.type === 'quiz_lead') return appendQuizLead(data)
//     if (data.type === 'praxis_anfrage') return appendPraxisAnfrage(data)
//     return appendInquiry(data) // existing behaviour
//   }
//   function appendQuizLead(data) {
//     const sheet = SpreadsheetApp.openById('<SHEET_ID>').getSheetByName('Quiz_Leads')
//       || SpreadsheetApp.openById('<SHEET_ID>').insertSheet('Quiz_Leads')
//     const a = data.answers || {}
//     const cp = data.computedProfile || {}
//     sheet.appendRow([new Date(), data.lead.vorname, data.lead.email, data.lead.plz,
//       a.q1_lokalisation, a.q2_trigger, a.q3_groesse, a.q4_hauttyp, a.q5_recognition,
//       (a.q6_versucht || []).join(', '), a.q7_vermeidung, a.q8_zeitziel,
//       cp.typ, cp.auspraegungScore, cp.dringlichkeitScore,
//       data.lead.consent_data, data.lead.consent_marketing, 'new'])
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
  let parsed: { type?: string; lead?: { email?: string; consent_data?: boolean } }
  try { parsed = JSON.parse(body) } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }
  if (parsed.type !== 'quiz_lead' || !parsed.lead?.email || parsed.lead.consent_data !== true) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing required fields or consent' }) }
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
      console.warn(`[quiz-submit] GAS returned ${res.status}:`, text.slice(0, 1000))
      return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed', gasStatus: res.status }) }
    }
    console.log(`[quiz-submit] GAS ok (${text.length} bytes)`)
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
  } catch (err) {
    console.error('[quiz-submit] fetch to GAS threw:', err)
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed' }) }
  }
}
