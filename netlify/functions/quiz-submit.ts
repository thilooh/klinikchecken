// Server-side proxy from the methoden-quiz lead-capture step.
// Two responsibilities:
//   1. Forward the lead to the GAS sheet (primary - source of truth)
//   2. Send the user a transactional auswertung email via Brevo
//      (secondary - makes the Step 11 promise "Du bekommst dein
//      Orientierungsprofil auch per Mail" actually true)
//
// The email send is non-blocking-on-failure: if Brevo errors, we log
// and still return 200 to the client because the sheet write
// succeeded. The user already saw their auswertung on Step 12; the
// email is a re-engagement asset, not the deliverable.
//
// Env vars:
//   GOOGLE_SHEET_URL   - the GAS Web App /exec endpoint (existing)
//   BREVO_API_KEY      - from Brevo dashboard - SMTP & API tab
//   BREVO_SENDER_EMAIL - defaults to kontakt@besenreiser-check.de
//   BREVO_SENDER_NAME  - defaults to "Besenreiser-Check"
//
// Brevo setup the user needs to do once:
//   1. Create a Brevo account at brevo.com
//   2. Settings -> Senders & IPs: add the sender domain, follow the
//      DKIM/SPF DNS instructions Brevo gives. Without DKIM the mails
//      go straight to spam.
//   3. SMTP & API -> API Keys: create a v3 key, paste into Netlify
//      env as BREVO_API_KEY.

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

type ParsedBody = {
  type?: string
  lead?: {
    vorname?: string
    email?: string
    plz?: string
    consent_data?: boolean
    consent_marketing?: boolean
  }
  answers?: {
    q1_lokalisation?: string | null
    q7_vermeidung?: string | null
    q8_zeitziel?: string | null
  }
  computedProfile?: {
    typ?: string
    auspraegungScore?: number
    dringlichkeitScore?: number
  }
}

function auspraegungLabel(score: number): string {
  if (score <= 2) return 'Leicht ausgeprägt'
  if (score <= 4) return 'Mittel ausgeprägt'
  if (score <= 6) return 'Deutlich ausgeprägt'
  return 'Stark ausgeprägt'
}

function dringlichkeitLabel(score: number): string {
  if (score <= 2) return 'Niedrig - du hast Zeit'
  if (score <= 4) return 'Mittel'
  return 'Hoch - du willst zeitnah weiter'
}

// Mirrors the client-side intent classification in quizTracking.ts so
// we can tag the Brevo send for downstream segmentation.
function isQualifiedLead(answers: ParsedBody['answers']): boolean {
  const v = answers?.q7_vermeidung
  const z = answers?.q8_zeitziel
  return v === 'voellig_zu' || v === 'eher_zu' || z === 'diesen_sommer' || z === 'anlass'
}

type EmailPayload = {
  vorname: string
  email: string
  typ: string
  auspraegung: string
  dringlichkeit: string
  isFace: boolean
  qualified: boolean
}

function renderEmailHtml(p: EmailPayload): string {
  const ctaUrl = `https://besenreiser-check.de/methoden-quiz?utm_source=email&utm_medium=transactional&utm_campaign=quiz_auswertung`
  const methodenText = p.isFace
    ? 'Bei vergleichbaren Befunden im Gesicht kommen in der Dermatologie häufig Laser und feinste Verödung zum Einsatz. Beide arbeiten direkt an der Kapillarader, nicht auf der Hautoberfläche.'
    : 'Bei vergleichbaren Befunden an den Beinen kommen in der Phlebologie häufig Sklerotherapie und Laser zum Einsatz. Beide arbeiten direkt an der Ader, nicht in der Hautoberfläche, in der Cremes wirken.'
  const greeting = p.vorname ? `${p.vorname}, hier ist deine Quiz-Auswertung` : 'Hier ist deine Quiz-Auswertung'

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Deine Quiz-Auswertung</title></head>
<body style="margin:0; padding:0; background-color:#F4F4F4; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#0A1F44;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F4F4; padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#fff; border-radius:8px; overflow:hidden;">
<tr><td style="background-color:#003399; padding:18px 24px;"><div style="font-size:17px; font-weight:700; color:#fff; letter-spacing:0.02em;">Besenreiser-Check</div></td></tr>
<tr><td style="padding:28px 24px 8px;">
<h1 style="margin:0 0 12px; font-size:22px; font-weight:800; color:#0A1F44; line-height:1.3;">${greeting}</h1>
<p style="margin:0 0 20px; font-size:14px; color:#444; line-height:1.5;">Du hast 8 Fragen beantwortet. Auf Basis deiner Antworten haben wir dein Orientierungsprofil zusammengestellt.</p>
</td></tr>
<tr><td style="padding:0 24px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFBFE; border:1px solid #DDE3F5; border-radius:6px;">
<tr><td style="padding:16px 18px;">
<div style="font-size:11px; font-weight:700; color:#003399; letter-spacing:0.05em; margin-bottom:12px;">DEIN PROFIL</div>
<div style="margin-bottom:10px;"><div style="font-size:11px; color:#666; font-weight:600; margin-bottom:2px;">Typ</div><div style="font-size:16px; font-weight:700; color:#0A1F44;">${p.typ}</div></div>
<div style="margin-bottom:10px;"><div style="font-size:11px; color:#666; font-weight:600; margin-bottom:2px;">Ausprägung</div><div style="font-size:14px; color:#333;">${p.auspraegung}</div></div>
<div><div style="font-size:11px; color:#666; font-weight:600; margin-bottom:2px;">Behandlungswunsch</div><div style="font-size:14px; color:#333;">${p.dringlichkeit}</div></div>
</td></tr></table>
</td></tr>
<tr><td style="padding:0 24px 20px;">
<h2 style="margin:0 0 8px; font-size:15px; font-weight:700; color:#0A1F44;">In Frage kommende Methoden</h2>
<p style="margin:0; font-size:14px; color:#444; line-height:1.5;">${methodenText}</p>
</td></tr>
<tr><td style="padding:0 24px 24px;" align="center">
<a href="${ctaUrl}" style="display:inline-block; background-color:#003399; color:#fff; font-weight:700; font-size:15px; text-decoration:none; padding:14px 26px; border-radius:6px;">Praxen in deiner Nähe ansehen →</a>
</td></tr>
<tr><td style="padding:0 24px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFF8E1; border:1px solid #F5DD8C; border-radius:6px;">
<tr><td style="padding:12px 14px; font-size:13px; color:#444; line-height:1.5;"><strong>Tipp:</strong> Frag bei 2-3 Praxen gleichzeitig an. Antwortzeiten und Termine variieren - Praxen erwarten das.</td></tr>
</table>
</td></tr>
<tr><td style="padding:0 24px 24px;">
<p style="margin:0; font-size:12px; color:#666; line-height:1.5; font-style:italic;">Diese Auswertung ist eine Orientierungshilfe und keine ärztliche Diagnose. Eine konkrete Einschätzung erfolgt im Erstgespräch in der Praxis.</p>
</td></tr>
<tr><td style="padding:18px 24px; background-color:#FAFBFE; border-top:1px solid #DDE3F5;">
<p style="margin:0 0 6px; font-size:11px; color:#888; line-height:1.5;">Du bekommst diese Mail, weil du am Methoden-Quiz auf besenreiser-check.de teilgenommen hast.</p>
<p style="margin:0; font-size:11px; color:#888; line-height:1.5;"><a href="https://besenreiser-check.de/impressum" style="color:#003399; text-decoration:underline;">Impressum</a>&nbsp;·&nbsp;<a href="https://besenreiser-check.de/datenschutz" style="color:#003399; text-decoration:underline;">Datenschutz</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

function renderEmailText(p: EmailPayload): string {
  const ctaUrl = `https://besenreiser-check.de/methoden-quiz?utm_source=email&utm_medium=transactional&utm_campaign=quiz_auswertung`
  const methodenText = p.isFace
    ? 'Bei vergleichbaren Befunden im Gesicht kommen in der Dermatologie häufig Laser und feinste Verödung zum Einsatz. Beide arbeiten direkt an der Kapillarader.'
    : 'Bei vergleichbaren Befunden an den Beinen kommen in der Phlebologie häufig Sklerotherapie und Laser zum Einsatz. Beide arbeiten direkt an der Ader.'
  const greeting = p.vorname ? `${p.vorname}, hier ist deine Quiz-Auswertung` : 'Hier ist deine Quiz-Auswertung'
  return `${greeting}

Du hast 8 Fragen beantwortet. Auf Basis deiner Antworten haben wir dein Orientierungsprofil zusammengestellt.

DEIN PROFIL
Typ: ${p.typ}
Ausprägung: ${p.auspraegung}
Behandlungswunsch: ${p.dringlichkeit}

IN FRAGE KOMMENDE METHODEN
${methodenText}

Praxen in deiner Nähe ansehen: ${ctaUrl}

Tipp: Frag bei 2-3 Praxen gleichzeitig an. Antwortzeiten und Termine variieren - Praxen erwarten das.

---
Diese Auswertung ist eine Orientierungshilfe und keine ärztliche Diagnose. Eine konkrete Einschätzung erfolgt im Erstgespräch in der Praxis.

Du bekommst diese Mail, weil du am Methoden-Quiz auf besenreiser-check.de teilgenommen hast.
Impressum: https://besenreiser-check.de/impressum
Datenschutz: https://besenreiser-check.de/datenschutz
`
}

async function sendAuswertungMail(p: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return { ok: false, error: 'BREVO_API_KEY not configured' }
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'kontakt@besenreiser-check.de'
  const senderName = process.env.BREVO_SENDER_NAME || 'Besenreiser-Check'

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: p.email, name: p.vorname || undefined }],
        subject: p.vorname ? `${p.vorname}, hier ist deine Quiz-Auswertung` : 'Hier ist deine Quiz-Auswertung',
        htmlContent: renderEmailHtml(p),
        textContent: renderEmailText(p),
        tags: ['quiz_auswertung', p.qualified ? 'intent_qualified' : 'intent_low', p.isFace ? 'path_gesicht' : 'path_beine'],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return { ok: false, error: `Brevo ${res.status}: ${errText.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
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
  let parsed: ParsedBody
  try { parsed = JSON.parse(body) } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }
  if (parsed.type !== 'quiz_lead' || !parsed.lead?.email || parsed.lead.consent_data !== true) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing required fields or consent' }) }
  }

  // Primary path: write to GAS. The sheet write is the source of truth;
  // if it fails we surface 502 even if the email later succeeds.
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
  } catch (err) {
    console.error('[quiz-submit] fetch to GAS threw:', err)
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'sheet write failed' }) }
  }

  // Secondary: auswertung email. We log failures and continue - the
  // user already has their result on Step 12, so a failed mail is a
  // missed re-engagement, not a broken transaction.
  const cp = parsed.computedProfile
  if (cp?.typ && typeof cp.auspraegungScore === 'number' && typeof cp.dringlichkeitScore === 'number') {
    const emailRes = await sendAuswertungMail({
      vorname: parsed.lead.vorname?.trim() || '',
      email: parsed.lead.email,
      typ: cp.typ,
      auspraegung: auspraegungLabel(cp.auspraegungScore),
      dringlichkeit: dringlichkeitLabel(cp.dringlichkeitScore),
      isFace: parsed.answers?.q1_lokalisation === 'gesicht',
      qualified: isQualifiedLead(parsed.answers),
    })
    if (!emailRes.ok) {
      console.warn('[quiz-submit] auswertung email failed:', emailRes.error)
    } else {
      console.log('[quiz-submit] auswertung email queued')
    }
  } else {
    console.warn('[quiz-submit] computedProfile incomplete, skipping email')
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true }) }
}
