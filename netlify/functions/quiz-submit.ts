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
    q3_groesse?: string | null
    q4_hauttyp?: string | null
    q6_versucht?: string[]
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
  tried: string[]
  zeitziel: string | null
  hauttypDark: boolean
  recoveryUrl: string
  topPraxis: TopPraxis | null
}

// Subset of the clinic JSON that the email needs - just enough to
// render the inline 1-praxis-card and the discipline label.
type Clinic = {
  id: number
  name: string
  city: string
  district?: string
  address?: string
  doctor?: string
  qualification?: string
  methods: string[]
  tier?: string
  foundedYear?: number
}

type TopPraxis = {
  name: string
  city: string
  district?: string
  methods: string[]
  doctor?: string
  qualification?: string
  foundedYear?: number
  isPaidPartner: boolean
}

// Clinic methods that are relevant per quiz-path. Used to prefer
// clinics that actually offer something matching the user's profile
// when picking the "top praxis" inlined into the email.
const LEG_RELEVANT = new Set(['Sklerotherapie', 'Schaumsklerotherapie', 'Endovenöser Laser', 'ClariVein', 'Laser (Nd:YAG)', 'Radiofrequenzablation', 'Venenoperation'])
const FACE_RELEVANT = new Set(['Laser (Nd:YAG)', 'KTP-Laser', 'IPL'])

let clinicsCache: Clinic[] | null = null
let clinicsLoadInflight: Promise<Clinic[]> | null = null

// Lazy-load clinics.json from the deployed static asset. Cached at
// module scope so subsequent invocations on the same warm container
// reuse the same array. Failure surfaces as null upstream so the
// email still ships - just without the inline-praxis block.
async function loadClinics(): Promise<Clinic[] | null> {
  if (clinicsCache) return clinicsCache
  if (clinicsLoadInflight) return clinicsLoadInflight
  const url = (process.env.URL?.trim() || 'https://besenreiser-check.de').replace(/\/$/, '') + '/data/clinics.json'
  clinicsLoadInflight = fetch(url)
    .then(r => {
      if (!r.ok) throw new Error(`clinics.json ${r.status}`)
      return r.json() as Promise<Clinic[]>
    })
    .then(data => { clinicsCache = data; clinicsLoadInflight = null; return data })
    .catch(err => { clinicsLoadInflight = null; console.warn('[quiz-submit] loadClinics failed:', err); return null as unknown as Clinic[] })
  return clinicsLoadInflight
}

// Picks one praxis to feature inline in the email. Heuristic only -
// the result page does the proper sort (with user coords + match-tier-
// distance). Here we just want one defensible name; the rest of the
// list lives one click away.
function findTopPraxis(clinics: Clinic[] | null, city: string | null, isFace: boolean): TopPraxis | null {
  if (!clinics || clinics.length === 0 || !city) return null
  const inCity = clinics.filter(c => c.city === city)
  if (inCity.length === 0) return null
  const relevant = isFace ? FACE_RELEVANT : LEG_RELEVANT
  const matched = inCity.filter(c => c.methods.some(m => relevant.has(m)))
  const tierRank: Record<string, number> = { premium_plus: 0, premium: 1, basic: 2 }
  const sorted = (matched.length > 0 ? matched : inCity).slice().sort(
    (a, b) => (tierRank[a.tier ?? 'basic'] ?? 9) - (tierRank[b.tier ?? 'basic'] ?? 9),
  )
  const c = sorted[0]
  if (!c) return null
  return {
    name: c.name,
    city: c.city,
    district: c.district,
    methods: c.methods,
    doctor: c.doctor,
    qualification: c.qualification,
    foundedYear: c.foundedYear,
    isPaidPartner: c.tier === 'premium_plus' || c.tier === 'premium',
  }
}

// Compact base64url snapshot of the auswertung state. Mirrors the
// browser-side encoder in src/lib/auswertungToken.ts so the recovery
// link the email puts in the user's inbox lands on a fully hydrated
// /auswertung page without a re-quiz.
function encodeRecoveryToken(parsed: ParsedBody): string | null {
  if (!parsed.lead || !parsed.answers || !parsed.computedProfile) return null
  const snapshot = {
    answers: parsed.answers,
    lead: parsed.lead,
    profile: parsed.computedProfile,
  }
  return Buffer.from(JSON.stringify(snapshot)).toString('base64url')
}

function buildRecoveryUrl(parsed: ParsedBody): string {
  const token = encodeRecoveryToken(parsed)
  const base = (process.env.URL?.trim() || 'https://besenreiser-check.de').replace(/\/$/, '')
  if (!token) return `${base}/methoden-quiz?utm_source=email&utm_medium=transactional&utm_campaign=quiz_auswertung_v3`
  return `${base}/auswertung?utm_source=email&utm_medium=transactional&utm_campaign=quiz_auswertung_v3&d=${token}`
}

// Subject A/B variants - 4 per path. pickSubject returns variant id
// (A/B/C/D) tagged in Brevo so open rate per variant is filterable.
const SUBJECT_VARIANTS_BEINE: Array<{ id: string; build: (vorname: string) => string }> = [
  { id: 'A', build: v => `${v ? v + ', ' : ''}die 0,46 mm, die deine Cremes nie erreichen konnten` },
  { id: 'B', build: v => `${v ? v + ', ' : ''}der 0,02-mm-Grund, warum Cremes nicht reichen` },
  { id: 'C', build: v => `${v ? v + ', ' : ''}deine Auswertung — und ein Reframe zur Tiefe` },
  { id: 'D', build: v => `${v ? v + ', ' : ''}was Cremes in 0,02 mm leisten — und wo das Problem sitzt` },
]

const SUBJECT_VARIANTS_FACE: Array<{ id: string; build: (vorname: string) => string }> = [
  { id: 'A', build: v => `${v ? v + ', ' : ''}Make-up überdeckt sie. Was sie wegmacht.` },
  { id: 'B', build: v => `${v ? v + ', ' : ''}warum Make-up den Spiegel betrügt` },
  { id: 'C', build: v => `${v ? v + ', ' : ''}deine Auswertung — die Adern hinter dem Make-up` },
  { id: 'D', build: v => `${v ? v + ', ' : ''}was Pflege erreicht — und was nicht` },
]

function pickSubject(p: EmailPayload): { id: string; subject: string } {
  const variants = p.isFace ? SUBJECT_VARIANTS_FACE : SUBJECT_VARIANTS_BEINE
  const v = variants[Math.floor(Math.random() * variants.length)]
  return { id: v.id, subject: v.build(p.vorname) }
}

// Q6 labels for the named "you tried X, Y, Z" callback. Intentionally
// excludes "nichts" (no treatment attempted) and "verstecken"
// (coping strategy, not a treatment that "works at the wrong place"
// the way Cremes/Kompression/Camouflage do). Keeping verstecken in
// would make the "all have echte Effekte but not at the vessel"
// callback nonsensical.
const Q6_LABEL: Record<string, string> = {
  cremes: 'Cremes',
  kompression: 'Kompression',
  camouflage: 'Camouflage',
  selftanner: 'Self-Tanner',
  hausmittel: 'Hausmittel',
}

function joinAnd(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} und ${items[1]}`
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`
}

// Trapdoor-style callback: the user reads HER OWN list back. Stronger
// than the abstract pivot because she can't argue with what she just
// clicked. Returns null when she hasn't tried any actual treatment -
// the line would feel weird then.
function buildVersuchtCallback(tried: string[]): string | null {
  const labels = tried.filter(v => v in Q6_LABEL).map(v => Q6_LABEL[v])
  if (labels.length === 0) return null
  const list = joinAnd(labels)
  if (labels.length === 1) {
    return `Du hast ${list} probiert. Das hat einen echten Effekt — aber nicht den, eine bereits erweiterte Ader zu verschließen.`
  }
  return `Du hast ${list} probiert. Alle haben echte Effekte — aber keiner ist dafür gemacht, eine bereits erweiterte Ader zu verschließen.`
}

// Concrete timing block per Q8. Replaces the generic "frag bei 2-3
// gleichzeitig an" tipp with a timeline that actually maps to the
// reader's stated horizon.
function buildTimingBlock(zeitziel: string | null, isFace: boolean): { headline: string; body: string } | null {
  switch (zeitziel) {
    case 'diesen_sommer':
      return {
        headline: 'Du willst bis Sommer Ergebnisse sehen.',
        body: `${isFace ? 'Laser-' : 'Sklero- und Laser-'}Sitzungen brauchen typischerweise 4-6 Wochen Abstand. Für sichtbare Reduktion bis Spätsommer hast du noch knapp Zeit, wenn du diese Woche das Erstgespräch klärst.`,
      }
    case 'anlass':
      return {
        headline: 'Für deinen Anlass.',
        body: 'Üblicherweise kalkuliert man 3-4 Monate vor dem Termin Behandlungsstart. Frag im Erstgespräch direkt nach diesem Zeitfenster — die Praxis kann sagen, ob es bei deinem Befund realistisch ist.',
      }
    case 'kein_druck':
      return {
        headline: 'Ohne Zeitdruck kannst du das mit Ruhe angehen.',
        body: 'Optimaler Behandlungsbeginn ist Spätherbst bis Frühjahr — die Adern haben dann Zeit zum Abbau, bevor wieder Sommer ist. Ein Erstgespräch jetzt klärt früh, ohne dass du dich zu etwas verpflichtest.',
      }
    case 'naechster_sommer':
      return {
        headline: 'Für sichtbare Beine im nächsten Sommer.',
        body: 'Behandlungsbeginn idealerweise Spätherbst bis Frühjahr. Ein Erstgespräch jetzt klärt, was bei dir passt — Behandlung startet, wenn es für dich gut ist.',
      }
    default:
      return null
  }
}

// Safety-relevant note for Hauttyp 4-6: shorter laser wavelengths
// (e.g. KTP 532 nm, IPL) carry pigmentation risk. Nd:YAG (1064 nm)
// is the safer default. HWG-defensible: this is sachlich-medizinische
// Information, kein Heilversprechen.
function buildHauttypNote(hauttypDark: boolean, isFace: boolean): string | null {
  if (!hauttypDark) return null
  return `<strong>Wichtig für dich:</strong> bei Hauttyp 4-6 sollte mit längerwelligem Laser (Nd:YAG, 1064&nbsp;nm) gearbeitet werden. ${isFace ? 'Im Gesicht' : 'An den Beinen'} bergen kürzere Wellenlängen ein Pigment-Risiko. Frag in der Praxis explizit nach Nd:YAG, bevor du dich entscheidest.`
}

function buildHauttypNoteText(hauttypDark: boolean, isFace: boolean): string | null {
  if (!hauttypDark) return null
  return `WICHTIG FÜR DICH: bei Hauttyp 4-6 sollte mit längerwelligem Laser (Nd:YAG, 1064 nm) gearbeitet werden. ${isFace ? 'Im Gesicht' : 'An den Beinen'} bergen kürzere Wellenlängen ein Pigment-Risiko. Frag in der Praxis explizit nach Nd:YAG, bevor du dich entscheidest.`
}

// buildSubject is now superseded by pickSubject (which does A/B
// rotation across 4 variants per path). Kept off-disk - all subject
// generation goes through pickSubject in sendAuswertungMail.

// HTML for the single inline praxis card. Mirrors the visual shape
// of PraxisCardV4 (1×1×1×1) but stripped to email-safe markup
// (tables + inline styles, no flex). The Premium-Partner badge sits
// above the card when applicable - UWG §5a wants paid placements
// labelled regardless of context.
function buildPraxisCardHtml(praxis: TopPraxis, recoveryUrl: string, isFace: boolean): string {
  const discipline = isFace
    ? '<strong>Dermatologie</strong> — arbeitet an der Kapillarader im Gesicht'
    : '<strong>Phlebologie</strong> — arbeitet an der Ader, nicht an der Haut'
  const proofParts: string[] = []
  if (praxis.foundedYear) proofParts.push(`Seit ${praxis.foundedYear}`)
  if (praxis.doctor) {
    proofParts.push(praxis.qualification ? `${praxis.doctor}, ${praxis.qualification}` : praxis.doctor)
  } else if (praxis.qualification) {
    proofParts.push(praxis.qualification)
  }
  const proofLine = proofParts.length > 0
    ? `<div style="font-size:12px; color:#666; line-height:1.4; margin-bottom:14px;">${proofParts.join(' · ')}</div>`
    : ''
  const partnerBadge = praxis.isPaidPartner
    ? `<div style="display:inline-block; background-color:#003399; color:#fff; font-size:10px; font-weight:700; letter-spacing:0.05em; padding:3px 8px; border-radius:3px 3px 0 0; margin-bottom:0;">PREMIUM-PARTNER · ANZEIGE</div>`
    : ''
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td>${partnerBadge}</td></tr>
<tr><td style="background-color:#fff; border:1px solid #DDDDDD; border-radius:6px; padding:16px 18px;">
<div style="display:inline-block; background-color:#E8F0FF; color:#003399; font-size:10px; font-weight:700; letter-spacing:0.04em; padding:3px 8px; border-radius:20px; margin-bottom:8px;">BESTE ÜBEREINSTIMMUNG MIT DEINEM PROFIL</div>
<h3 style="margin:0 0 6px; font-size:16px; font-weight:700; color:#0A1F44; line-height:1.3;">${escapeHtml(praxis.name)}</h3>
<div style="font-size:13px; color:#0A1F44; font-weight:600; margin-bottom:4px;">${escapeHtml(praxis.methods.slice(0, 3).join(' · '))}</div>
<div style="font-size:13px; color:#444; margin-bottom:10px; line-height:1.4;">${discipline}</div>
<div style="font-size:13px; color:#555; margin-bottom:${proofLine ? '6px' : '14px'};">📍 ${escapeHtml(praxis.city)}${praxis.district ? ` · ${escapeHtml(praxis.district)}` : ''}</div>
${proofLine}
<a href="${recoveryUrl}" style="display:block; background-color:#003399; color:#fff; font-weight:700; font-size:14px; text-decoration:none; padding:12px 16px; border-radius:6px; text-align:center;">Erstgespräch anfragen →</a>
<div style="font-size:11px; color:#888; text-align:center; margin-top:6px; font-style:italic;">Du verpflichtest dich zu nichts.</div>
</td></tr></table>`
}

// Minimal HTML escape for praxis-name / methods strings injected
// into the inline card. The clinic data is internal and reasonably
// trusted, but we still escape - costs nothing and prevents one
// stray '&' from breaking the email markup.
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
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

// Future-pacing - re-anchors the Step 7 avoidance pattern as a
// motivation, not a guarantee. Hedged ("bei vielen", "häufigste
// Motivation", "keine Garantie") for HWG safety. Concrete examples
// (Schwimmbad, kurze Hose, Foto am Strand / Make-up-Schicht) so the
// reader sees their own life, not an abstract outcome.
function buildFuturePacing(p: EmailPayload): string {
  return p.isFace
    ? 'Was das praktisch heißt: bei vielen Patientinnen wird nach 2-4 Sitzungen die Schicht Make-up überflüssig, mit der sie die Adern morgens überdecken. Das ist keine Garantie. Es ist die häufigste Motivation.'
    : 'Was das praktisch heißt: bei vielen Patientinnen wird nach 2-4 Sitzungen wieder möglich, was sie vorher gemieden haben — Schwimmbad, kurze Hose, Foto am Strand. Das ist keine Garantie. Es ist die häufigste Motivation.'
}

function renderEmailHtml(p: EmailPayload): string {
  const profileLine = buildProfileLine(p)
  const stadtZeile = p.city ? `in ${p.city}` : 'in deiner Region'
  const stadtCta = p.city ? ` in ${p.city}` : ''
  const futurePacing = buildFuturePacing(p)
  const versuchtCallback = buildVersuchtCallback(p.tried)
  const timingBlock = buildTimingBlock(p.zeitziel, p.isFace)
  const hauttypNote = buildHauttypNote(p.hauttypDark, p.isFace)

  // Inline praxis card - one practice featured, rest live on the
  // recovery page. Only renders when we have both a city match and
  // at least one practice in that city; otherwise a generic "Praxen
  // ansehen →" button shows in its place.
  const praxisCard = p.topPraxis
    ? buildPraxisCardHtml(p.topPraxis, p.recoveryUrl, p.isFace)
    : ''

  // H1 = magnetic hook (Schwartz: channel existing desire onto the
  // mechanism). Greeting moves to a smaller line below so the H1 is
  // doing the heavy lifting, not "Lisa, hier ist deine Auswertung."
  const h1 = p.isFace
    ? 'Make-up überdeckt. Pflege beruhigt. Beides erreicht die Ader nicht.'
    : '0,46 mm. Genau dort sitzt das Problem.'
  const greetingLine = p.vorname
    ? `<p style="margin:0 0 4px; font-size:14px; color:#666; line-height:1.4;">${p.vorname}, hier ist deine Auswertung.</p>`
    : ''

  const versuchtBlock = versuchtCallback
    ? `<tr><td style="padding:0 24px 18px;">
<p style="margin:0; font-size:14px; color:#0A1F44; line-height:1.6; padding:12px 14px; background-color:#FAFBFE; border:1px solid #DDE3F5; border-radius:4px;">${versuchtCallback}</p>
</td></tr>`
    : ''

  const hauttypBlock = hauttypNote
    ? `<tr><td style="padding:0 24px 16px;">
<p style="margin:0; font-size:13px; color:#444; line-height:1.55; padding:12px 14px; background-color:#FFF8E1; border:1px solid #F5DD8C; border-radius:4px;">${hauttypNote}</p>
</td></tr>`
    : ''

  const timingHtmlBlock = timingBlock
    ? `<tr><td style="padding:0 24px 18px;">
<div style="padding:14px 16px; background-color:#F4F7FF; border-left:3px solid #003399; border-radius:4px;">
<div style="font-size:14px; font-weight:700; color:#0A1F44; margin-bottom:4px;">${timingBlock.headline}</div>
<div style="font-size:13px; color:#444; line-height:1.55;">${timingBlock.body}</div>
</div>
</td></tr>`
    : ''

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
${greetingLine}
<h1 style="margin:0 0 14px; font-size:24px; font-weight:800; color:#0A1F44; line-height:1.25;">${h1}</h1>
<p style="margin:0 0 16px; font-size:14px; color:#0A1F44; line-height:1.5;"><strong>Dein Profil in einer Zeile:</strong> ${profileLine}.</p>
</td></tr>

${versuchtBlock}

<tr><td style="padding:0 24px 16px;">
${pivotBlock}
</td></tr>

<tr><td style="padding:0 24px 18px;">
<p style="margin:0; font-size:14px; color:#0A1F44; line-height:1.6; padding:14px 16px; background-color:#F4F7FF; border-left:3px solid #003399; border-radius:4px;">${futurePacing}</p>
</td></tr>

<tr><td style="padding:0 24px 12px;">
<p style="margin:0 0 10px; font-size:14px; color:#0A1F44; font-weight:600; line-height:1.5;">An die Ader selbst kommen ${p.isFace ? 'in der Dermatologie folgende Verfahren' : 'zwei Methoden'}:</p>
${methodsBlock}
<p style="margin:0; font-size:13px; color:#555; line-height:1.5; font-style:italic;">Welche Methode bei dir passt, hängt von Größe, Tiefe, Hauttyp und Lokalisation ab. Genau das wird im Erstgespräch geklärt.</p>
</td></tr>

${hauttypBlock}

${timingHtmlBlock}

${praxisCard
  ? `<tr><td style="padding:0 24px 6px;"><div style="font-size:11px; font-weight:700; color:#003399; letter-spacing:0.05em; margin-bottom:8px;">📍 ${p.city ? `EINE PRAXIS IN ${p.city.toUpperCase()}` : 'EINE PRAXIS IN DEINER NÄHE'}</div>${praxisCard}</td></tr>
<tr><td style="padding:0 24px 18px;" align="center">
<a href="${p.recoveryUrl}" style="font-size:13px; color:#0052CC; text-decoration:underline;">Alle Praxen${stadtCta} ansehen →</a>
</td></tr>`
  : `<tr><td style="padding:6px 24px 18px;" align="center">
<a href="${p.recoveryUrl}" style="display:inline-block; background-color:#003399; color:#fff; font-weight:700; font-size:15px; text-decoration:none; padding:14px 26px; border-radius:6px;">Praxen${stadtCta} ansehen →</a>
</td></tr>`}

<tr><td style="padding:0 24px 12px;">
<h2 style="margin:0 0 12px; font-size:15px; font-weight:700; color:#0A1F44;">Drei Sachen, die viele vorher fragen:</h2>
<div style="margin-bottom:12px;">
<div style="font-size:13px; font-weight:700; color:#0A1F44; margin-bottom:2px;">"Verpflichte ich mich, wenn ich anfrage?"</div>
<div style="font-size:13px; color:#444; line-height:1.5;">Nein. Eine Anfrage ist eine Anfrage. Wenn die Praxis sich meldet, kannst du einen Termin annehmen, einen anderen vorschlagen oder nicht antworten — alles okay. Du bist zu nichts verpflichtet.</div>
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

<tr><td style="padding:8px 24px 14px;" align="center">
<a href="${p.recoveryUrl}" style="display:inline-block; background-color:#003399; color:#fff; font-weight:700; font-size:15px; text-decoration:none; padding:14px 26px; border-radius:6px;">Mein Erstgespräch anfragen →</a>
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
  const profileLine = buildProfileLine(p)
  const stadtZeile = p.city ? `in ${p.city}` : 'in deiner Region'
  const stadtCta = p.city ? ` in ${p.city}` : ''
  const futurePacing = buildFuturePacing(p)
  const versuchtCallback = buildVersuchtCallback(p.tried)
  const timingBlock = buildTimingBlock(p.zeitziel, p.isFace)
  const hauttypNote = buildHauttypNoteText(p.hauttypDark, p.isFace)
  const h1 = p.isFace
    ? 'Make-up überdeckt. Pflege beruhigt. Beides erreicht die Ader nicht.'
    : '0,46 mm. Genau dort sitzt das Problem.'
  const greetingPrefix = p.vorname ? `${p.vorname}, hier ist deine Auswertung.\n\n` : ''
  const versuchtTextBlock = versuchtCallback ? `\n\n${versuchtCallback}` : ''
  const hauttypTextBlock = hauttypNote ? `\n\n${hauttypNote}` : ''
  const timingTextBlock = timingBlock ? `\n\n${timingBlock.headline.toUpperCase()}\n${timingBlock.body}` : ''
  const praxisTextBlock = p.topPraxis
    ? `\n\nEINE PRAXIS, DIE ZU DEINEM PROFIL PASST:\n${p.topPraxis.name} (${p.topPraxis.city}${p.topPraxis.district ? ', ' + p.topPraxis.district : ''})\n${p.topPraxis.methods.slice(0, 3).join(' · ')}\n${p.isFace ? 'Dermatologie — arbeitet an der Kapillarader im Gesicht' : 'Phlebologie — arbeitet an der Ader, nicht an der Haut'}${p.topPraxis.foundedYear ? `\nSeit ${p.topPraxis.foundedYear}` : ''}${p.topPraxis.doctor ? ` · ${p.topPraxis.doctor}${p.topPraxis.qualification ? ', ' + p.topPraxis.qualification : ''}` : ''}\n→ Erstgespräch anfragen: ${p.recoveryUrl}\n(Du verpflichtest dich zu nichts.)`
    : ''

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

  return `${greetingPrefix}${h1}

Dein Profil in einer Zeile: ${profileLine}.${versuchtTextBlock}


${pivotText}


${futurePacing}


${methodsText}

Welche Methode bei dir passt, hängt von Größe, Tiefe, Hauttyp und Lokalisation ab. Genau das wird im Erstgespräch geklärt.${hauttypTextBlock}${timingTextBlock}${praxisTextBlock}


${p.topPraxis ? `→ Alle Praxen${stadtCta} ansehen: ${p.recoveryUrl}` : `→ Praxen${stadtCta} ansehen: ${p.recoveryUrl}`}


DREI SACHEN, DIE VIELE VORHER FRAGEN:

"Verpflichte ich mich, wenn ich anfrage?"
Nein. Eine Anfrage ist eine Anfrage. Wenn die Praxis sich meldet, kannst du einen Termin annehmen, einen anderen vorschlagen oder nicht antworten — alles okay. Du bist zu nichts verpflichtet.

"Was kostet das Erstgespräch?"
In vielen Praxen kostenfrei oder im niedrigen 2-stelligen Bereich. Behandlung später typischerweise 80-300 € pro Sitzung. Reine Besenreiser-Behandlung gilt meistens als kosmetisch und wird von gesetzlichen Kassen nicht übernommen.

"Wie schnell bekomme ich einen Termin?"
In den meisten Praxen 1-3 Wochen. Frag bei 2-3 Praxen gleichzeitig an — die schnellste antwortet zuerst. Praxen erwarten das.


→ Mein Erstgespräch anfragen: ${p.recoveryUrl}

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

  const picked = pickSubject(p)
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json', 'accept': 'application/json' },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: p.email, name: p.vorname || undefined }],
        subject: picked.subject,
        htmlContent: renderEmailHtml(p),
        textContent: renderEmailText(p),
        // Tags drive Brevo Activity-segmenting:
        //   quiz_auswertung_v3       - template version
        //   subject_<A|B|C|D>        - A/B variant for open-rate analysis
        //   intent_<qualified|low>   - mirrors trackQuizLead split
        //   path_<beine|gesicht>     - quiz path
        //   praxis_<inline|generic>  - whether the email has an inline praxis card
        tags: [
          'quiz_auswertung_v3',
          `subject_${picked.id}`,
          p.qualified ? 'intent_qualified' : 'intent_low',
          p.isFace ? 'path_gesicht' : 'path_beine',
          p.topPraxis ? 'praxis_inline' : 'praxis_generic',
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
    const city = cityFromPlz(plz)
    const isFace = parsed.answers?.q1_lokalisation === 'gesicht'
    // Load clinics in parallel with email construction. If the fetch
    // fails or city is unknown, topPraxis comes back null and the
    // email falls back to its generic CTA - never blocks the send.
    const clinics = await loadClinics()
    const topPraxis = findTopPraxis(clinics, city, isFace)
    const recoveryUrl = buildRecoveryUrl(parsed)
    const emailRes = await sendAuswertungMail({
      vorname: parsed.lead.vorname?.trim() || '',
      email: parsed.lead.email,
      plz,
      typ: cp.typ,
      auspraegung: auspraegungLabel(cp.auspraegungScore),
      auspraegungLower: auspraegungLabel(cp.auspraegungScore).toLowerCase(),
      dringlichkeitShort: dringlichkeitShort(cp.dringlichkeitScore),
      isFace,
      qualified: isQualifiedLead(parsed.answers),
      city,
      tried: parsed.answers?.q6_versucht ?? [],
      zeitziel: parsed.answers?.q8_zeitziel ?? null,
      hauttypDark: parsed.answers?.q4_hauttyp === 'dunkler',
      recoveryUrl,
      topPraxis,
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
