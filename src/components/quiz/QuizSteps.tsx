import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import AnswerCard from './AnswerCard'
import MultiSelectCard from './MultiSelectCard'
import StatementAgreement from './StatementAgreement'
import type { QuizAnswers } from '../../lib/quizState'
import { Q2_PIVOT_TEXT, Q7_PIVOT_TEXT } from '../../lib/quizDisplayMaps'
import { pivotTextFromAnswers } from '../../lib/quizPivotTexts'

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

export function Step1Lokalisation({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={1} total={Q_TOTAL} prompt="Wo möchtest du sie loswerden?" helpText="Klick auf den Bereich, der dich am meisten stört." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* TODO: Replace text cards with SVG body-map (Beine + Gesicht) per V2 spec. */}
        <AnswerCard label="An den Beinen — Waden, Knie, Knöchel" onSelect={() => onSelect('beine_unten')} />
        <AnswerCard label="An den Beinen — Oberschenkel, Innenseite" onSelect={() => onSelect('beine_oben')} />
        <AnswerCard label="Mehrere Stellen am Bein" onSelect={() => onSelect('beine_mehrere')} />
        <AnswerCard label="Im Gesicht — Wangen, Nasenflügel, Kinn" onSelect={() => onSelect('gesicht')} />
      </div>
    </StepCard>
  )
}

export function Step2Trigger({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={2} total={Q_TOTAL} prompt="Wann sind sie aufgetaucht?" helpText="Damit wir einschätzen, was bei dir hilfreich sein könnte." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label="Schon immer / seit der Jugend" onSelect={() => onSelect('schon_immer')} />
        <AnswerCard label="Nach einer Schwangerschaft" onSelect={() => onSelect('schwangerschaft')} />
        <AnswerCard label="In den Wechseljahren" onSelect={() => onSelect('wechseljahre')} />
        <AnswerCard label="Schleichend mit den Jahren" onSelect={() => onSelect('schleichend')} />
      </div>
    </StepCard>
  )
}

export function Step3Groesse({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={3} total={Q_TOTAL} prompt="Welches Bild kommt deinen Besenreisern am nächsten?" helpText="Größe und Verteilung sind für die Methodenwahl wichtig." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* TODO: Replace text cards with stylised illustrations per V2 spec
            (HWG-konform: schematic SVG, no patient photos). */}
        <AnswerCard label="Sehr fein" sub="Wie ein dünnes Haar (< 0,2 mm)" onSelect={() => onSelect('fein')} />
        <AnswerCard label="Mittel" sub="Deutlich sichtbar, aber dünn (0,2–1 mm)" onSelect={() => onSelect('mittel')} />
        <AnswerCard label="Größer" sub="Knotige oder breitere Gefäße (> 1 mm)" onSelect={() => onSelect('groesser')} />
        <AnswerCard label="Verschiedene — flächig wie eine Landkarte" onSelect={() => onSelect('flaechig')} />
      </div>
    </StepCard>
  )
}

export function Step4Hauttyp({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={4} total={Q_TOTAL} prompt="Welchen Hauttyp hast du?" helpText="Damit wir dir Methoden zeigen, die bei deinem Hauttyp sicher sind." />
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
export function Step5Recognition({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={5} total={Q_TOTAL} prompt="Welcher dieser Sätze klingt am ehesten nach dir?" helpText="Wähle aus, was dir am vertrautesten ist." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label='"Im Schwimmbad lege ich das Handtuch erst ab, wenn ich im Wasser bin."' onSelect={() => onSelect('schwimmbad')} />
        <AnswerCard label='"Im Sommer trage ich lieber lange Hosen als kurze."' onSelect={() => onSelect('lange_hosen')} />
        <AnswerCard label='"Auf Fotos verstecke ich die Beine — Kleid bis zum Knöchel oder gar nicht hin."' onSelect={() => onSelect('fotos')} />
        <AnswerCard label='"Mich stört es, aber im Alltag denke ich nicht ständig dran."' onSelect={() => onSelect('stoert_aber_alltag')} />
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
  { value: 'nichts', label: 'Noch nichts — ich informiere mich gerade' },
]

export function Step6Versucht({
  selected,
  onToggle,
  onContinue,
}: {
  selected: string[]
  onToggle: (v: string) => void
  onContinue: () => void
}) {
  const canContinue = selected.length > 0
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
        Weiter →
      </button>
    </StepCard>
  )
}

// Step 7 - Statement-Agreement (Vermeidung). 4-point Likert scale.
// The statement is a self-diagnosis prompt: clicking "stimme völlig
// zu" is the user telling themselves "my behaviour is influenced by
// my Besenreiser" - the strongest investment anchor in the quiz.
export function Step7Vermeidung({ onSelect }: { onSelect: (v: 'voellig_zu' | 'eher_zu' | 'eher_nicht' | 'gar_nicht') => void }) {
  return (
    <StepCard>
      <StepHeader
        idx={7}
        total={Q_TOTAL}
        prompt="Wie sehr stimmst du diesem Satz zu?"
        helpText="Wähle die Stufe, die für dich am ehesten passt."
      />
      <StatementAgreement
        statement='"Ich habe in den letzten 12 Monaten mindestens einmal etwas wegen meiner Beine vermieden — Kleidung, Foto, Ausflug oder Aktivität."'
        onSelect={onSelect}
      />
    </StepCard>
  )
}

export function Step8Zeitziel({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={8} total={Q_TOTAL} prompt="Bis wann möchtest du Ergebnisse sehen?" helpText="Der Zeitrahmen entscheidet mit, wann du am besten startest." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label="Vor diesem Sommer" onSelect={() => onSelect('diesen_sommer')} />
        <AnswerCard label="Vor einem konkreten Anlass" sub="(Hochzeit, Urlaub, Geburtstag)" onSelect={() => onSelect('anlass')} />
        <AnswerCard label="Kein Zeitdruck — ich will es angehen" onSelect={() => onSelect('kein_druck')} />
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
export function Step9Pivot({ answers, onContinue }: { answers: QuizAnswers; onContinue: () => void }) {
  const triggerText = answers.q2_trigger ? Q2_PIVOT_TEXT[answers.q2_trigger] : ''
  const vermeidungText = answers.q7_vermeidung ? Q7_PIVOT_TEXT[answers.q7_vermeidung] : ''
  const t = pivotTextFromAnswers(answers)

  const bulletStyle: React.CSSProperties = {
    fontSize: '14px', color: '#444', padding: '4px 0', display: 'flex', gap: '8px',
  }

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

      <button
        type="button"
        onClick={onContinue}
        style={{
          width: '100%', backgroundColor: '#003399', color: '#fff', fontWeight: 700,
          fontSize: '15px', border: 'none', borderRadius: '6px', padding: '13px 20px', cursor: 'pointer',
        }}
      >
        Profil anzeigen →
      </button>
    </StepCard>
  )
}

// Step 10 - 2-second loader between Pivot and Lead-Capture. Three
// rotating reassurance lines, auto-advance to step 11.
const LOADER_LINES = [
  'Wir analysieren deine Antworten…',
  'Wir berechnen dein Befundprofil…',
  'Dein Profil ist fertig.',
]

export function Step10Loading({ onDone }: { onDone: () => void }) {
  const [lineIdx, setLineIdx] = useState(0)

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
            <Check size={18} color="#0A7C4A" /> {LOADER_LINES[lineIdx]}
          </span>
        ) : (
          <span>{LOADER_LINES[lineIdx]}</span>
        )}
      </div>
    </div>
  )
}
