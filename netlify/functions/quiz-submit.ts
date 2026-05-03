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
// Email template = V2 from the Objection-Map SOP (Cluster A-E synthesis):
// pivot is pulled into the body (0.46mm/0.02mm), Sklero+Laser broken out
// individually with use-case, three Cluster-C objections (verpflichtung
// /kosten/termin) answered upfront. Branched for Beine vs Gesicht so the
// face path doesn't claim numeric depth math that doesn't apply.
//
// Env vars:
//   GOOGLE_SHEET_URL   - the GAS Web App /exec endpoint (existing)
//   BREVO_API_KEY      - from Brevo dashboard - SMTP & API tab (v3 key)
//   BREVO_SENDER_EMAIL - defaults to kontakt@besenreiser-check.de
//   BREVO_SENDER_NAME  - defaults to "Besenreiser-Check"

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

// Used in the inline-profile sentence "{typ} {wo}, {auspraegungLower},
// {dringlichkeitShort}." — strips the "Niedrig - " / "Hoch - " prefix
// when present so the sentence reads naturally.
function dringlichkeitShort(score: number): string {
  const label = dringlichkeitLabel(score)
  return label.includes(' - ') ? label.split(' - ')[1].toLowerCase() : label.toLowerCase()
}

// Mirrors the client-side intent classification in quizTracking.ts so
// we can tag the Brevo send for downstream segmentation.
function isQualifiedLead(answers: ParsedBody['answers']): boolean {
  const v = answers?.q7_vermeidung
  const z = answers?.q8_zeitziel
  return v === 'voellig_zu' || v === 'eher_zu' || z === 'diesen_sommer' || z === 'anlass'
}

// Subset of src/lib/cityMatch.ts - only the PLZ-prefix matching the
// function actually needs. Kept here (no shared imports) because Netlify
// functions don't bundle src/* without explicit config.
const PLZ_PREFIX_TO_CITY: Array<[string[], string]> = [
  [['50', '51'], 'Köln'],
  [['40'], 'Düsseldorf'],
  [['60', '61', '63'], 'Frankfurt'],
  [['44'], 'Dortmund'],
  [['10', '12', '13', '14'], 'Berlin'],
  [['80', '81', '85'], 'München'],
  [['20', '21', '22'], 'Hamburg'],
  [['04'], 'Leipzig'],
  [['90', '91'], 'Nürnberg'],
  [['70', '71'], 'Stuttgart'],
  [['45'], 'Essen'],
  [['30'], 'Hannover'],
  [['27', '28'], 'Bremen'],
  [['24'], 'Kiel'],
  [['18'], 'Rostock'],
  [['38'], 'Braunschweig'],
  [['39'], 'Magdeburg'],
  [['23'], 'Lübeck'],
  [['53'], 'Bonn'],
  [['52'], 'Aachen'],
  [['48'], 'Münster'],
  [['42'], 'Wuppertal'],
  [['47'], 'Duisburg'],
  [['86'], 'Augsburg'],
  [['79'], 'Freiburg'],
  [['89'], 'Ulm'],
  [['69'], 'Heidelberg'],
  [['76'], 'Karlsruhe'],
  [['68'], 'Mannheim'],
  [['93'], 'Regensburg'],
  [['97'], 'Würzburg'],
  [['01'], 'Dresden'],
  [['09'], 'Chemnitz'],
  [['99'], 'Erfurt'],
  [['65'], 'Wiesbaden'],
  [['55'], 'Mainz'],
  [['34'], 'Kassel'],
  [['66'], 'Saarbrücken'],
  [['37'], 'Göttingen'],
  [['06'], 'Halle'],
  [['41'], 'Mönchengladbach'],
  [['58'], 'Hagen'],
  [['67'], 'Ludwigshafen'],
  [['26'], 'Oldenburg'],
  [['49'], 'Osnabrück'],
  [['64'], 'Darmstadt'],
  [['56'], 'Koblenz'],
  [['07'], 'Jena'],
  [['54'], 'Trier'],
  [['19'], 'Schwerin'],
  [['31'], 'Hildesheim'],
  [['03'], 'Cottbus'],
]

function cityFromPlz(plz: string): string | null {
  if (!/^\d{5}$/.test(plz)) return null
  let bestCity: string | null = null
  let bestLen = 0
  for (const [prefixes, city] of PLZ_PREFIX_TO_CITY) {
    for (const p of prefixes) {
      if (plz.startsWith(p) && p.length > bestLen) { bestCity = city; bestLen = p.length }
    }
  }
  return bestCity
}

type EmailPayload = {
  vorname: string
  email: string
  plz: string
  typ: string
  auspraegung: string
  auspraegungLower: string
  dringlichkeitShort: string
  isFace: boolean
  qualified: boolean
  city: string | null
}

const CTA_URL = 'https://besenreiser-check.de/methoden-quiz?utm_source=email&utm_medium=transactional&utm_campaign=quiz_auswertung_v2'

function buildSubject(p: EmailPayload): string {
  const namePart = p.vorname ? `${p.vorname}, ` : ''
  return p.isFace
    ? `${namePart}deine Auswertung — und warum Make-up nicht reicht`
    : `${namePart}deine Auswertung — und der Grund, warum Cremes nicht reichen konnten`
}

function buildPreheader(p: EmailPayload): string {
  const ort = p.city ? `Praxen in ${p.city}` : 'Praxen in deiner Region'
  return p.isFace
    ? `${ort} arbeiten direkt an der Kapillarader. Hier sind sie.`
    : `${ort} arbeiten direkt an der Ader. Hier sind sie.`
}

function buildProfileLine(p: EmailPayload): string {
  const wo = p.isFace ? 'im Gesicht' : 'an den Beinen'
  return `${p.typ} ${wo}, ${p.auspraegungLower}, ${p.dringlichkeitShort}`
}

function renderEmailHtml(p: EmailPayload): string {
  const greeting = p.vorname ? `${p.vorname}, hier ist deine Auswertung` : 'Hier ist deine Auswertung'
  const profileLine = buildProfileLine(p)
  const stadtZeile = p.city ? `in ${p.city}` : 'in deiner Region'

  // Pivot block - depth-math for Beine, stays-goes for Gesicht. Footnotes
  // only render on the Beine path because it's the only one with numeric
  // claims that need backing.
  const pivotBlock = p.isFace
    ? `<p style="margin:0 0 12px; font-size:15px; color:#0A1F44; font-weight:600; line-height:1.5;">Eine Kapillarader im Gesicht ist dauerhaft erweitert.</p>
<p style="margin:0 0 12px; font-size:14px; color:#444; line-height:1.6;">Make-up legt sich darüber. Abends ist es weg. Die Ader bleibt. Pflege und Beruhigungs-Cremes wirken in der Hautoberfläche, nicht an der Ader darunter.</p>
<p style="margin:0 0 8px; font-size:14px; color:#444; line-height:1.6;">Das ist kein Versagen deiner Pflege. Das ist eine Frage des Wirkorts.</p>`
    : `<p style="margin:0 0 12px; font-size:15px; color:#0A1F44; font-weight:600; line-height:1.5;">Eine Besenreiser-Ader liegt im Mittel 0,46&nbsp;mm unter der Hautoberfläche.<sup style="font-size:10px;">¹</sup></p>
<p style="margin:0 0 12px; font-size:14px; color:#444; line-height:1.6;">Cremes wirken hauptsächlich in der Hornschicht — etwa 0,02&nbsp;mm tief.<sup style="font-size:10px;">²</sup></p>
<p style="margin:0 0 8px; font-size:14px; color:#444; line-height:1.6;">Das ist kein Versagen deiner Cremes. Das ist eine Frage der Tiefe.</p>`

  // Methods - Beine has Sklero + Laser, Face has just Laser (Sklero is
  // rarely used for facial teleangiektasien because the vessels are too fine).
  const methodsBlock = p.isFace
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFBFE; border:1px solid #DDE3F5; border-radius:6px; margin-bottom:12px;">
<tr><td style="padding:14px 16px;">
<div style="font-size:14px; font-weight:700; color:#0A1F44; margin-bottom:4px;">Laser (z.B. KTP, Nd:YAG)</div>
<div style="font-size:13px; color:#444; line-height:1.5;">Lichtimpulse von außen, koagulieren die feine Kapillarader. Bei dunkleren Hauttypen wird üblicherweise Nd:YAG (1064 nm) eingesetzt — diese Wellenlänge wird vom Hautpigment kaum aufgenommen.</div>
</td></tr></table>`
    : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFBFE; border:1px solid #DDE3F5; border-radius:6px; margin-bottom:8px;">
<tr><td style="padding:14px 16px;">
<div style="font-size:14px; font-weight:700; color:#0A1F44; margin-bottom:4px;">Sklerotherapie</div>
<div style="font-size:13px; color:#444; line-height:1.5;">Eine feine Nadel setzt eine sterile Lösung in die Ader. Die Aderwand schließt sich, der Körper baut die Ader binnen Wochen selbst ab. Gut bei mittleren bis tieferen Adern. Wird seit den 1930er-Jahren angewendet.</div>
</td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFBFE; border:1px solid #DDE3F5; border-radius:6px; margin-bottom:12px;">
<tr><td style="padding:14px 16px;">
<div style="font-size:14px; font-weight:700; color:#0A1F44; margin-bottom:4px;">Laser</div>
<div style="font-size:13px; color:#444; line-height:1.5;">Lichtimpulse von außen, koagulieren die Ader. Gut bei sehr feinen Oberflächen-Adern. Bei dunkleren Hauttypen mit längerwelligem Laser (Nd:YAG, 1064&nbsp;nm) sicher anwendbar.</div>
</td></tr></table>`

  const footnotesBlock = p.isFace
    ? ''
    : `<tr><td style="padding:0 24px 16px;">
<div style="font-size:11px; color:#777; line-height:1.55; border-top:1px solid #E5E9F2; padding-top:10px;">
<p style="margin:0 0 4px;"><strong>¹</strong> Mittlere Tiefe von Besenreisern (Teleangiektasien) im superficialen Korium. Quelle: <a href="https://plasticsurgerykey.com/pathophysiology-of-telangiectasias/" style="color:#0052CC;">Plastic Surgery Key — Pathophysiology of Telangiectasias</a>.</p>
<p style="margin:0;"><strong>²</strong> Hornschicht-Dicke (Stratum corneum) typisch 10-20&nbsp;µm. Topisch applizierte Cremes ohne Penetration-Enhancer werden tiefer meist nicht nachweisbar. Quelle: <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2577912/" style="color:#0052CC;">PMC — Determination of Stratum Corneum Thickness</a>.</p>
</div>
</td></tr>`

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Deine Quiz-Auswertung</title>
<style>@media (prefers-color-scheme: dark) { body { background:#F4F4F4 !important; } }</style>
</head>
<body style="margin:0; padding:0; background-color:#F4F4F4; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#0A1F44;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; visibility:hidden; mso-hide:all;">${buildPreheader(p)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F4F4; padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px; width:100%; background-color:#fff; border-radius:8px; overflow:hidden;">

<tr><td style="background-color:#003399; padding:18px 24px;"><div style="font-size:17px; font-weight:700; color:#fff; letter-spacing:0.02em;">Besenreiser-Check</div></td></tr>

<tr><td style="padding:28px 24px 8px;">
<h1 style="margin:0 0 12px; font-size:22px; font-weight:800; color:#0A1F44; line-height:1.3;">${greeting}</h1>
<p style="margin:0 0 16px; font-size:14px; color:#0A1F44; line-height:1.5;"><strong>Dein Profil in einer Zeile:</strong> ${profileLine}.</p>
</td></tr>

<tr><td style="padding:0 24px 16px;">
<h2 style="margin:0 0 10px; font-size:16px; font-weight:700; color:#0A1F44; line-height:1.4;">Was bei dir aller Wahrscheinlichkeit nach wirkt — und was nicht.</h2>
${pivotBlock}
</td></tr>

<tr><td style="padding:0 24px 12px;">
<p style="margin:0 0 10px; font-size:14px; color:#0A1F44; font-weight:600; line-height:1.5;">An die Ader selbst kommen ${p.isFace ? 'in der Dermatologie folgende Verfahren' : 'zwei Methoden'}:</p>
${methodsBlock}
<p style="margin:0; font-size:13px; color:#555; line-height:1.5; font-style:italic;">Welche Methode bei dir passt, hängt von Größe, Tiefe, Hauttyp und Lokalisation ab. Genau das wird im Erstgespräch geklärt.</p>
</td></tr>

<tr><td style="padding:18px 24px 12px;">
<h2 style="margin:0 0 12px; font-size:15px; font-weight:700; color:#0A1F44;">Drei Sachen, die viele vorher fragen:</h2>
<div style="margin-bottom:12px;">
<div style="font-size:13px; font-weight:700; color:#0A1F44; margin-bottom:2px;">"Verpflichte ich mich, wenn ich anfrage?"</div>
<div style="font-size:13px; color:#444; line-height:1.5;">Nein. Eine Anfrage ist eine Anfrage. Du kannst den Termin annehmen, einen anderen vorschlagen oder nicht antworten.</div>
</div>
<div style="margin-bottom:12px;">
<div style="font-size:13px; font-weight:700; color:#0A1F44; margin-bottom:2px;">"Was kostet das Erstgespräch?"</div>
<div style="font-size:13px; color:#444; line-height:1.5;">In vielen Praxen kostenfrei oder im niedrigen 2-stelligen Bereich. Behandlung später typischerweise 80-300 € pro Sitzung. Reine Besenreiser-Behandlung gilt meistens als kosmetisch und wird von gesetzlichen Kassen nicht übernommen.</div>
</div>
<div>
<div style="font-size:13px; font-weight:700; color:#0A1F44; margin-bottom:2px;">"Wie schnell bekomme ich einen Termin?"</div>
<div style="font-size:13px; color:#444; line-height:1.5;">In den meisten Praxen 1-3 Wochen. Frag bei 2-3 Praxen gleichzeitig an — die schnellste antwortet zuerst. Praxen erwarten das.</div>
</div>
</td></tr>

<tr><td style="padding:14px 24px 6px;">
<p style="margin:0 0 12px; font-size:14px; color:#0A1F44; line-height:1.5;">${p.vorname ? `${p.vorname}, hier` : 'Hier'} kannst du Praxen ${stadtZeile} sehen, die zu deinem Profil passen:</p>
</td></tr>

<tr><td style="padding:0 24px 14px;" align="center">
<a href="${CTA_URL}" style="display:inline-block; background-color:#003399; color:#fff; font-weight:700; font-size:15px; text-decoration:none; padding:14px 26px; border-radius:6px;">Erstgespräch anfragen →</a>
</td></tr>

<tr><td style="padding:0 24px 18px;">
<p style="margin:0; font-size:12px; color:#666; line-height:1.55; text-align:center;"><strong>Tipp:</strong> bei 2-3 Praxen gleichzeitig anfragen kostet dich 5 zusätzliche Minuten und spart Wartezeit.</p>
</td></tr>

${footnotesBlock}

<tr><td style="padding:0 24px 22px;">
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
  const greeting = p.vorname ? `${p.vorname}, hier ist deine Auswertung` : 'Hier ist deine Auswertung'
  const profileLine = buildProfileLine(p)
  const stadtZeile = p.city ? `in ${p.city}` : 'in deiner Region'

  const pivotText = p.isFace
    ? `Eine Kapillarader im Gesicht ist dauerhaft erweitert. Make-up legt sich darüber. Abends ist es weg. Die Ader bleibt. Pflege und Beruhigungs-Cremes wirken in der Hautoberfläche, nicht an der Ader darunter.

Das ist kein Versagen deiner Pflege. Das ist eine Frage des Wirkorts.`
    : `Eine Besenreiser-Ader liegt im Mittel 0,46 mm unter der Hautoberfläche.[1]
Cremes wirken hauptsächlich in der Hornschicht — etwa 0,02 mm tief.[2]

Das ist kein Versagen deiner Cremes. Das ist eine Frage der Tiefe.`

  const methodsText = p.isFace
    ? `An die Ader selbst kommen in der Dermatologie folgende Verfahren:

LASER (z.B. KTP, Nd:YAG)
Lichtimpulse von außen, koagulieren die feine Kapillarader. Bei dunkleren Hauttypen wird üblicherweise Nd:YAG (1064 nm) eingesetzt — diese Wellenlänge wird vom Hautpigment kaum aufgenommen.`
    : `An die Ader selbst kommen zwei Methoden:

SKLEROTHERAPIE
Eine feine Nadel setzt eine sterile Lösung in die Ader. Die Aderwand schließt sich, der Körper baut die Ader binnen Wochen selbst ab. Gut bei mittleren bis tieferen Adern. Wird seit den 1930er-Jahren angewendet.

LASER
Lichtimpulse von außen, koagulieren die Ader. Gut bei sehr feinen Oberflächen-Adern. Bei dunkleren Hauttypen mit längerwelligem Laser (Nd:YAG, 1064 nm) sicher anwendbar.`

  const footnotesText = p.isFace
    ? ''
    : `

---
[1] Mittlere Tiefe von Besenreisern (Teleangiektasien) im superficialen Korium. Quelle: Plastic Surgery Key — Pathophysiology of Telangiectasias.
[2] Hornschicht-Dicke (Stratum corneum) typisch 10-20 µm. Topisch applizierte Cremes ohne Penetration-Enhancer werden tiefer meist nicht nachweisbar. Quelle: PMC — Determination of Stratum Corneum Thickness.`

  return `${greeting}

Dein Profil in einer Zeile: ${profileLine}.


WAS BEI DIR ALLER WAHRSCHEINLICHKEIT NACH WIRKT — UND WAS NICHT.

${pivotText}


${methodsText}

Welche Methode bei dir passt, hängt von Größe, Tiefe, Hauttyp und Lokalisation ab. Genau das wird im Erstgespräch geklärt.


DREI SACHEN, DIE VIELE VORHER FRAGEN:

"Verpflichte ich mich, wenn ich anfrage?"
Nein. Eine Anfrage ist eine Anfrage. Du kannst den Termin annehmen, einen anderen vorschlagen oder nicht antworten.

"Was kostet das Erstgespräch?"
In vielen Praxen kostenfrei oder im niedrigen 2-stelligen Bereich. Behandlung später typischerweise 80-300 € pro Sitzung. Reine Besenreiser-Behandlung gilt meistens als kosmetisch und wird von gesetzlichen Kassen nicht übernommen.

"Wie schnell bekomme ich einen Termin?"
In den meisten Praxen 1-3 Wochen. Frag bei 2-3 Praxen gleichzeitig an — die schnellste antwortet zuerst. Praxen erwarten das.


${p.vorname ? `${p.vorname}, hier` : 'Hier'} kannst du Praxen ${stadtZeile} sehen, die zu deinem Profil passen:

→ Erstgespräch anfragen: ${CTA_URL}

Tipp: bei 2-3 Praxen gleichzeitig anfragen kostet dich 5 zusätzliche Minuten und spart Wartezeit.${footnotesText}

---
Diese Auswertung ist eine Orientierungshilfe und keine ärztliche Diagnose. Eine konkrete Einschätzung erfolgt im Erstgespräch in der Praxis.

Du bekommst diese Mail, weil du am Methoden-Quiz auf besenreiser-check.de teilgenommen hast.
Impressum: https://besenreiser-check.de/impressum
Datenschutz: https://besenreiser-check.de/datenschutz
`
}

async function sendAuswertungMail(p: EmailPayload): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  if (!apiKey) return { ok: false, error: 'BREVO_API_KEY not configured' }
  const sanitised = `len=${apiKey.length} prefix=${apiKey.slice(0, 8)}…${apiKey.slice(-4)}`
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim() || 'kontakt@besenreiser-check.de'
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Besenreiser-Check'

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: p.email, name: p.vorname || undefined }],
        subject: buildSubject(p),
        htmlContent: renderEmailHtml(p),
        textContent: renderEmailText(p),
        tags: [
          'quiz_auswertung_v2',
          p.qualified ? 'intent_qualified' : 'intent_low',
          p.isFace ? 'path_gesicht' : 'path_beine',
        ],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return { ok: false, error: `Brevo ${res.status}: ${errText.slice(0, 200)} [key ${sanitised}]` }
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
    const plz = parsed.lead.plz?.trim() || ''
    const emailRes = await sendAuswertungMail({
      vorname: parsed.lead.vorname?.trim() || '',
      email: parsed.lead.email,
      plz,
      typ: cp.typ,
      auspraegung: auspraegungLabel(cp.auspraegungScore),
      auspraegungLower: auspraegungLabel(cp.auspraegungScore).toLowerCase(),
      dringlichkeitShort: dringlichkeitShort(cp.dringlichkeitScore),
      isFace: parsed.answers?.q1_lokalisation === 'gesicht',
      qualified: isQualifiedLead(parsed.answers),
      city: cityFromPlz(plz),
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
