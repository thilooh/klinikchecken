import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import AnswerCard from './AnswerCard'
import MultiSelectCard from './MultiSelectCard'
import StatementAgreement from './StatementAgreement'
import BodyMap from './BodyMap'
import SizePicker from './SizePicker'
import type { QuizAnswers } from '../../lib/quizState'
import { Q2_PIVOT_TEXT, Q7_PIVOT_TEXT } from '../../lib/quizDisplayMaps'
import { pivotTextFromAnswers } from '../../lib/quizPivotTexts'

// /methoden-quiz   = v1 (control). /methoden-quiz-2 = v2 (DR claim-stack).
// /methoden-quiz-3 = v3 (DR strip - one specific truth per step,
// numeric where defensible). Each step accepts an optional variant
// prop; v1 stays unchanged so the A/B/C test has a stable baseline.
export type QuizVariant = 'v1' | 'v2' | 'v3'

// Helper texts per step. v2 stacks the doubt; v3 strips to one
// specific, unfalsifiable truth (Hopkins / Halbert specificity rule).
const HELP_TEXT: Record<1 | 2 | 3 | 4 | 5, Record<QuizVariant, string>> = {
  1: {
    v1: 'Klick auf den Bereich, der dich am meisten stört.',
    v2: 'Klick auf den Bereich, der dich am meisten stört. Der Ort entscheidet, welche Methode überhaupt funktionieren kann - Beine und Gesicht sind zwei verschiedene Behandlungsdisziplinen.',
    v3: 'Klick auf den Bereich. Beine = Phlebologie. Gesicht = Dermatologie. Eine Praxis kann selten beides.',
  },
  2: {
    v1: 'Damit wir einschätzen, was bei dir hilfreich sein könnte.',
    v2: 'Wann sie aufgetaucht sind, sagt mehr über die Ursache als über die Sichtbarkeit - und die Ursache entscheidet, was funktioniert.',
    v3: 'Wann sie kamen, sagt mehr als wie sie aussehen.',
  },
  3: {
    v1: 'Größe und Verteilung sind für die Methodenwahl wichtig.',
    v2: 'Klein heißt nicht harmlos. Mittel heißt nicht behandlungsresistent. Was du gleich auswählst, sieht oft anders aus als das, was darunter passiert.',
    v3: 'Eine 0,5-mm-Ader sieht im Spiegel oft kleiner aus, als sie ist.',
  },
  4: {
    v1: 'Damit wir dir Methoden zeigen, die bei deinem Hauttyp sicher sind.',
    v2: 'Bei dunkler Haut ist eine bestimmte Laser-Wellenlänge ein Risiko - und nicht jede Praxis spricht das offen an. Deshalb fragen wir.',
    v3: 'Bei Hauttyp 4-6 brennt der falsche Laser die Pigmentierung. Deshalb fragen wir.',
  },
  5: {
    v1: 'Wähle aus, was dir am vertrautesten ist.',
    v2: 'Wähle aus, was dir am vertrautesten ist.',
    v3: 'Wähle aus, was dir am vertrautesten ist.',
  },
}

// Card wrapper used by every question step. Keeps the marginBottom,
// shadow, and padding consistent without re-typing it in each step.
function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {children}
    </div>
  )
}

function StepHeader({ idx, total, prompt, helpText }: { idx: number; total: number; prompt: string; helpText: string }) {
  return (
    <>
      <div style={{ fontSize: '12px', color: '#888', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.05em' }}>
        FRAGE {idx} / {total}
      </div>
      <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0A1F44', marginBottom: '6px', lineHeight: 1.3 }}>{prompt}</h2>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '18px' }}>{helpText}</p>
    </>
  )
}

const Q_TOTAL = 8

export function Step1Lokalisation({ onSelect, variant = 'v1' }: { onSelect: (v: string) => void; variant?: QuizVariant }) {
  return (
    <StepCard>
      <StepHeader idx={1} total={Q_TOTAL} prompt="Wo möchtest du sie loswerden?" helpText={HELP_TEXT[1][variant]} />
      <BodyMap selected={null} onSelect={onSelect} />
    </StepCard>
  )
}

export function Step2Trigger({ onSelect, variant = 'v1' }: { onSelect: (v: string) => void; variant?: QuizVariant }) {
  return (
    <StepCard>
      <StepHeader idx={2} total={Q_TOTAL} prompt="Wann sind sie aufgetaucht?" helpText={HELP_TEXT[2][variant]} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label="Schon immer / seit der Jugend" onSelect={() => onSelect('schon_immer')} />
        <AnswerCard label="Nach einer Schwangerschaft" onSelect={() => onSelect('schwangerschaft')} />
        <AnswerCard label="In den Wechseljahren" onSelect={() => onSelect('wechseljahre')} />
        <AnswerCard label="Schleichend mit den Jahren" onSelect={() => onSelect('schleichend')} />
      </div>
    </StepCard>
  )
}

export function Step3Groesse({ onSelect, variant = 'v1' }: { onSelect: (v: string) => void; variant?: QuizVariant }) {
  return (
    <StepCard>
      <StepHeader idx={3} total={Q_TOTAL} prompt="Welches Bild kommt deinen Besenreisern am nächsten?" helpText={HELP_TEXT[3][variant]} />
      <SizePicker selected={null} onSelect={onSelect} />
    </StepCard>
  )
}

export function Step4Hauttyp({ onSelect, variant = 'v1' }: { onSelect: (v: string) => void; variant?: QuizVariant }) {
  return (
    <StepCard>
      <StepHeader idx={4} total={Q_TOTAL} prompt="Welchen Hauttyp hast du?" helpText={HELP_TEXT[4][variant]} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label="Hell bis mittel" sub="Hauttyp 1–3" onSelect={() => onSelect('hell_mittel')} />
        <AnswerCard label="Dunkler / Mediterran / POC" sub="Hauttyp 4–6" onSelect={() => onSelect('dunkler')} />
      </div>
    </StepCard>
  )
}

// Step 5 - Doctor Question / VoC Recognition. Three of the four
// options are direct lifts from real customer voice quotes; the
// fourth ("stoert_aber_alltag") is the low-pain escape hatch so we
// don't push everyone into a high-investment pivot regardless of
// their actual emotional baseline.
//
// V2 adds a "Spiegel-Satz" pause between the click and step 6.
// V3 swaps the metaphor for a strip-DR specific image: instead of
// "unsichtbare Steuer" (vague), the V3 mirror points at the concrete
// list of clothes / outings the user has been quietly skipping.
// Reader can't argue because the list lives in their head.
const STEP5_MIRROR_TEXTS: Record<QuizVariant, string> = {
  v1: '',
  v2: 'Das ist nicht Eitelkeit. Das ist die unsichtbare Steuer, die du zahlst, weil dein Körper sich anders entschieden hat als du.',
  v3: 'Das ist nicht Eitelkeit. Das ist die Liste der Sachen, die du heimlich nicht mehr machst.',
}

export function Step5Recognition({ onSelect, variant = 'v1' }: { onSelect: (v: string) => void; variant?: QuizVariant }) {
  const [mirrorFor, setMirrorFor] = useState<string | null>(null)
  const showMirror = variant === 'v2' || variant === 'v3'

  const handleSelect = (value: string) => {
    if (!showMirror) {
      onSelect(value)
      return
    }
    // Park the answer locally; the user clicks Weiter to advance
    // once they've actually read the mirror sentence.
    setMirrorFor(value)
  }

  if (showMirror && mirrorFor) {
    return (
      <StepCard>
        <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px 8px' }}>
          <p style={{ fontSize: '15px', color: '#0A1F44', fontWeight: 600, lineHeight: 1.6, maxWidth: '420px', marginBottom: '24px' }}>
            {STEP5_MIRROR_TEXTS[variant]}
          </p>
          <button
            type="button"
            onClick={() => onSelect(mirrorFor)}
            style={{
              backgroundColor: '#003399', color: '#fff', fontWeight: 700, fontSize: '14px',
              border: 'none', borderRadius: '6px', padding: '11px 24px', cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            Weiter →
          </button>
        </div>
      </StepCard>
    )
  }

  return (
    <StepCard>
      <StepHeader idx={5} total={Q_TOTAL} prompt="Welcher dieser Sätze klingt am ehesten nach dir?" helpText={HELP_TEXT[5][variant]} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label='"Im Schwimmbad lege ich das Handtuch erst ab, wenn ich im Wasser bin."' onSelect={() => handleSelect('schwimmbad')} />
        <AnswerCard label='"Im Sommer trage ich lieber lange Hosen als kurze."' onSelect={() => handleSelect('lange_hosen')} />
        <AnswerCard label='"Auf Fotos verstecke ich die Beine - Kleid bis zum Knöchel oder gar nicht hin."' onSelect={() => handleSelect('fotos')} />
        <AnswerCard label='"Mich stört es, aber im Alltag denke ich nicht ständig dran."' onSelect={() => handleSelect('stoert_aber_alltag')} />
      </div>
    </StepCard>
  )
}

const VERSUCHT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'cremes', label: 'Cremes oder Gels' },
  { value: 'kompression', label: 'Kompressionsstrümpfe' },
  { value: 'camouflage', label: 'Camouflage / Make-up für die Beine' },
  { value: 'selftanner', label: 'Bräunungssprays / Self-Tanner' },
  { value: 'hausmittel', label: 'Hausmittel (Apfelessig, Rosskastanie etc.)' },
  { value: 'verstecken', label: 'Ich verstecke sie unter Kleidung' },
  { value: 'nichts', label: 'Noch nichts - ich informiere mich gerade' },
]

export function Step6Versucht({
  selected,
  onToggle,
  onContinue,
  variant = 'v1',
}: {
  selected: string[]
  onToggle: (v: string) => void
  onContinue: () => void
  variant?: QuizVariant
}) {
  const canContinue = selected.length > 0
  // v2 frames the next step as insight, not friction. Drayton Bird:
  // every button label should sell the next click.
  const buttonLabel = variant === 'v2' ? 'Was ich daraus lerne →' : 'Weiter →'
  return (
    <StepCard>
      <StepHeader idx={6} total={Q_TOTAL} prompt="Was hast du bisher schon versucht?" helpText="Mehrfachauswahl möglich." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
        {VERSUCHT_OPTIONS.map(opt => (
          <MultiSelectCard
            key={opt.value}
            label={opt.label}
            checked={selected.includes(opt.value)}
            onToggle={() => onToggle(opt.value)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        style={{
          width: '100%', backgroundColor: canContinue ? '#003399' : '#B0B8CC',
          color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '6px',
          padding: '13px 20px', cursor: canContinue ? 'pointer' : 'not-allowed',
        }}
      >
        {buttonLabel}
      </button>
    </StepCard>
  )
}

// Step 7 - Statement-Agreement (Vermeidung). 4-point Likert scale.
// The statement is a self-diagnosis prompt: clicking "stimme völlig
// zu" is the user telling themselves "my behaviour is influenced by
// my Besenreiser" - the strongest investment anchor in the quiz.
// V2: "Du hast gerade etwas Wichtiges zugegeben." (vague claim).
// V3: echo the user's own answer back literally so the mirror is
// a Trapdoor they can't argue with - they JUST clicked it.
const STEP7_MIRROR_TEXTS: Record<QuizVariant, string> = {
  v1: '',
  v2: 'Du hast gerade etwas Wichtiges zugegeben. Den meisten ist das nicht bewusst.',
  v3: 'Du hast gerade gesagt: Mein Verhalten richtet sich nach meinen Beinen.',
}

export function Step7Vermeidung({ onSelect, variant = 'v1' }: {
  onSelect: (v: 'voellig_zu' | 'eher_zu' | 'eher_nicht' | 'gar_nicht') => void
  variant?: QuizVariant
}) {
  const [mirrorFor, setMirrorFor] = useState<'voellig_zu' | 'eher_zu' | 'eher_nicht' | 'gar_nicht' | null>(null)
  const showMirror = variant === 'v2' || variant === 'v3'

  const handleSelect = (value: 'voellig_zu' | 'eher_zu' | 'eher_nicht' | 'gar_nicht') => {
    if (!showMirror) { onSelect(value); return }
    // Only committal answers earn the mirror moment; non-committal
    // answers pass through immediately so the flow stays brisk.
    if (value === 'voellig_zu' || value === 'eher_zu') {
      setMirrorFor(value)
      return
    }
    onSelect(value)
  }

  if (showMirror && (mirrorFor === 'voellig_zu' || mirrorFor === 'eher_zu')) {
    return (
      <StepCard>
        <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px 8px' }}>
          <p style={{ fontSize: '15px', color: '#0A1F44', fontWeight: 600, lineHeight: 1.6, maxWidth: '420px', marginBottom: '24px' }}>
            {STEP7_MIRROR_TEXTS[variant]}
          </p>
          <button
            type="button"
            onClick={() => onSelect(mirrorFor)}
            style={{
              backgroundColor: '#003399', color: '#fff', fontWeight: 700, fontSize: '14px',
              border: 'none', borderRadius: '6px', padding: '11px 24px', cursor: 'pointer',
              minWidth: '140px',
            }}
          >
            Weiter →
          </button>
        </div>
      </StepCard>
    )
  }

  return (
    <StepCard>
      <StepHeader
        idx={7}
        total={Q_TOTAL}
        prompt="Wie sehr stimmst du diesem Satz zu?"
        helpText="Wähle die Stufe, die für dich am ehesten passt."
      />
      <StatementAgreement
        statement='"Ich habe in den letzten 12 Monaten mindestens einmal etwas wegen meiner Beine vermieden - Kleidung, Foto, Ausflug oder Aktivität."'
        onSelect={handleSelect}
      />
    </StepCard>
  )
}

export function Step8Zeitziel({ onSelect }: { onSelect: (v: string) => void; variant?: QuizVariant }) {
  return (
    <StepCard>
      <StepHeader idx={8} total={Q_TOTAL} prompt="Bis wann möchtest du Ergebnisse sehen?" helpText="Der Zeitrahmen entscheidet mit, wann du am besten startest." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label="Vor diesem Sommer" onSelect={() => onSelect('diesen_sommer')} />
        <AnswerCard label="Vor einem konkreten Anlass" sub="(Hochzeit, Urlaub, Geburtstag)" onSelect={() => onSelect('anlass')} />
        <AnswerCard label="Kein Zeitdruck - ich will es angehen" onSelect={() => onSelect('kein_druck')} />
        <AnswerCard label="Vor dem nächsten Sommer reicht" onSelect={() => onSelect('naechster_sommer')} />
      </div>
    </StepCard>
  )
}

// Step 9 - Mechanism-Reframe interstitial. The big conversion lever:
// reframes the user's failed-strategies experience from "I picked
// the wrong thing" to "those things were built for a different
// problem". Wording delegated to quizPivotTexts so a copywriter can
// edit without touching JSX.
//
// V2 swaps in the "Symptom statt Ursache" three-hit-reveal: bigger
// emotional trapdoor, less clinical phrasing, ends on "die brauchen
// jemanden, der dort arbeiten darf, wo das Problem sitzt." Routes
// the same forward-look (Phlebologie / Dermatologie+Lasermedizin)
// based on Q1 to keep medical accuracy intact.
//
// V3 strips the pivot to a numeric trapdoor: the depth gap between
// vessel (0,5-1 mm under skin) and cream penetration (~0,02 mm).
// Reader does the math in their head; the conclusion is unfalsifiable.
// HWG note: both depth values are within standard dermatology /
// phlebology literature. Texter should keep two short citations on
// file (cream stratum-corneum penetration; teleangiectasia depth).

const STEP9_V2_PARAGRAPHS_BEINE = [
  'Was du an deinen Beinen siehst, ist nicht das Problem. Das ist nur die Stelle, an der das Problem an die Oberfläche durchschimmert.',
  'Die Adern darunter sind erweitert. Sie haben sich unter der Haut entschieden, mehr Platz zu nehmen. Cremes, Sport, Self-Tanner - sie waren nie die Antwort. Sie waren nicht mal an der richtigen Stelle.',
  'Die Methoden, die diese Adern tatsächlich behandeln, gibt es. Aber sie brauchen jemanden, der dort arbeiten darf, wo das Problem sitzt. Nicht obendrauf. Darunter.',
]

const STEP9_V2_PARAGRAPHS_GESICHT = [
  'Was du im Spiegel siehst, ist nicht das Problem. Das ist nur die Stelle, an der das Problem durchschimmert.',
  'Die Kapillargefäße darunter sind dauerhaft erweitert. Sie haben sich gegen ihren Ruhe-Zustand entschieden. Pflege, Make-up, Beruhigungs-Cremes - sie waren nie die Antwort. Sie waren nicht mal an der richtigen Stelle.',
  'Die Verfahren, die diese Gefäße tatsächlich behandeln, gibt es. Aber sie brauchen jemanden, der dort arbeiten darf, wo das Problem sitzt. Nicht obendrauf. Darunter.',
]

const STEP9_V3_PARAGRAPHS_BEINE = [
  'Eine Besenreiser-Ader sitzt 0,5 bis 1 mm unter der Hautoberfläche.',
  'Eine Creme zieht etwa 0,02 mm tief ein.',
  'Cremes erreichen die Ader nie. Die Methoden in der Phlebologie tun das.',
]

const STEP9_V3_PARAGRAPHS_GESICHT = [
  'Eine Kapillarader im Gesicht ist dauerhaft erweitert.',
  'Make-up legt sich darüber. Abends ist es weg. Die Ader bleibt.',
  'Die Verfahren in der Dermatologie verkleinern die Ader. Pflege macht das nicht.',
]

export function Step9Pivot({ answers, onContinue, variant = 'v1' }: {
  answers: QuizAnswers
  onContinue: () => void
  variant?: QuizVariant
}) {
  const triggerText = answers.q2_trigger ? Q2_PIVOT_TEXT[answers.q2_trigger] : ''
  const vermeidungText = answers.q7_vermeidung ? Q7_PIVOT_TEXT[answers.q7_vermeidung] : ''
  const t = pivotTextFromAnswers(answers)

  const bulletStyle: React.CSSProperties = {
    fontSize: '14px', color: '#444', padding: '4px 0', display: 'flex', gap: '8px',
  }

  // V2: three-paragraph "Symptom statt Ursache" reveal replacing
  // the clinical "Klappenschwäche der feinen Venen" framing.
  // V3: depth-math trapdoor (0,5 mm vs 0,02 mm) - same Beine /
  // Gesicht split, but Gesicht uses a "stays / goes" mechanism
  // since the depth gap is smaller for face vessels.
  const isV3 = variant === 'v3'
  const isFace = answers.q1_lokalisation === 'gesicht'
  const v2Paragraphs = isFace ? STEP9_V2_PARAGRAPHS_GESICHT : STEP9_V2_PARAGRAPHS_BEINE
  const v3Paragraphs = isFace ? STEP9_V3_PARAGRAPHS_GESICHT : STEP9_V3_PARAGRAPHS_BEINE
  const reframeParagraphs = isV3 ? v3Paragraphs : v2Paragraphs

  return (
    <StepCard>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '14px', lineHeight: 1.3 }}>
        Kurz mal ehrlich.
      </h2>
      <p style={{ fontSize: '15px', color: '#444', marginBottom: '6px' }}>Du hast gerade gesagt:</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px 0' }}>
        {triggerText && (
          <li style={bulletStyle}><span style={{ color: '#003399' }}>•</span>Sie sind {triggerText}</li>
        )}
        <li style={bulletStyle}><span style={{ color: '#003399' }}>•</span>{t.bullet2}</li>
        {vermeidungText && (
          <li style={bulletStyle}><span style={{ color: '#003399' }}>•</span>Du hast {vermeidungText}</li>
        )}
      </ul>

      <hr style={{ border: 'none', borderTop: '1px solid #E5E9F2', margin: '16px 0' }} />

      {(variant === 'v2' || variant === 'v3') ? (
        <>
          {reframeParagraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: i === 0 ? '15px' : '14px',
                color: i === 0 ? '#0A1F44' : '#444',
                fontWeight: i === 0 ? 600 : 400,
                lineHeight: 1.7,
                marginBottom: i === reframeParagraphs.length - 1 ? '20px' : '14px',
              }}
            >
              {para}
            </p>
          ))}
        </>
      ) : (
        <>
          <p style={{ fontSize: '14px', color: '#0A1F44', fontWeight: 600, marginBottom: '10px' }}>
            {t.mechanismHeadline}
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.7, marginBottom: '14px' }}>
            {t.mechanismParagraph}
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.7, marginBottom: '18px' }}>
            {t.aidsExplanation}
          </p>
          <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.7, marginBottom: '20px' }}>
            {t.forwardLook}
          </p>
        </>
      )}

      <button
        type="button"
        onClick={onContinue}
        style={{
          width: '100%', backgroundColor: '#003399', color: '#fff', fontWeight: 700,
          fontSize: '15px', border: 'none', borderRadius: '6px', padding: '13px 20px', cursor: 'pointer',
        }}
      >
        Auswertung ansehen →
      </button>
    </StepCard>
  )
}

// Step 10 - 2-second loader between Pivot and Lead-Capture. Three
// rotating reassurance lines, auto-advance to step 11.
//
// V2 swaps the middle line for a "Did you know?"-style mini-truth.
// V3 strips the middle line to a no-claim reassurance - lets the
// pivot's depth-math do the work instead of a second mid-funnel
// claim that would compete for the reader's bullshit budget.
const LOADER_LINES_V1 = [
  'Wir gleichen deine Antworten ab…',
  'Wir stellen deine Auswertung zusammen…',
  'Deine Auswertung ist fertig.',
]
const LOADER_LINES_V2 = [
  'Wir gleichen deine Antworten ab…',
  'Was viele übersehen: dein Hauttyp entscheidet oft mehr als die Größe.',
  'Deine Auswertung ist fertig.',
]
const LOADER_LINES_V3 = [
  'Wir gleichen deine Antworten ab…',
  'Wir filtern Praxen, die zu deinen Antworten passen.',
  'Deine Auswertung ist fertig.',
]

export function Step10Loading({ onDone, variant = 'v1' }: { onDone: () => void; variant?: QuizVariant }) {
  const [lineIdx, setLineIdx] = useState(0)
  const lines = variant === 'v3' ? LOADER_LINES_V3 : variant === 'v2' ? LOADER_LINES_V2 : LOADER_LINES_V1

  useEffect(() => {
    const t1 = window.setTimeout(() => setLineIdx(1), 700)
    const t2 = window.setTimeout(() => setLineIdx(2), 1400)
    const t3 = window.setTimeout(() => onDone(), 2000)
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(t3) }
  }, [onDone])

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div
        aria-hidden="true"
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '4px solid #DDE3F5', borderTopColor: '#003399',
          animation: 'quizSpin 1s linear infinite', marginBottom: '20px',
        }}
      />
      <style>{`@keyframes quizSpin { to { transform: rotate(360deg); } }`}</style>
      <div role="status" aria-live="polite" style={{ fontSize: '15px', color: '#0A1F44', maxWidth: '320px', minHeight: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {lineIdx === 2 ? (
          <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Check size={18} color="#0A7C4A" /> {lines[lineIdx]}
          </span>
        ) : (
          <span>{lines[lineIdx]}</span>
        )}
      </div>
    </div>
  )
}
