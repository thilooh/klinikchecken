import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import AnswerCard from './AnswerCard'
import MultiSelectCard from './MultiSelectCard'
import type { QuizAnswers } from '../../lib/quizState'
import { Q2_PIVOT_TEXT, Q6_PIVOT_TEXT } from '../../lib/quizDisplayMaps'

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

const Q_TOTAL = 7

export function Step1Lokalisation({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={1} total={Q_TOTAL} prompt="Wo möchtest du sie loswerden?" helpText="Die Lokalisation entscheidet mit über die geeignete Methode." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
      <StepHeader idx={3} total={Q_TOTAL} prompt="Wie ausgeprägt sind sie?" helpText="Größe und Verteilung sind für die Methodenwahl wichtig." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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

const VERSUCHT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'cremes', label: 'Cremes oder Gels' },
  { value: 'kompression', label: 'Kompressionsstrümpfe' },
  { value: 'camouflage', label: 'Camouflage / Make-up für die Beine' },
  { value: 'selftanner', label: 'Bräunungssprays / Self-Tanner' },
  { value: 'hausmittel', label: 'Hausmittel (Apfelessig, Rosskastanie etc.)' },
  { value: 'verstecken', label: 'Ich verstecke sie unter Kleidung' },
  { value: 'nichts', label: 'Noch nichts — ich informiere mich gerade' },
]

export function Step5Versucht({
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
      <StepHeader idx={5} total={Q_TOTAL} prompt="Was hast du bisher schon versucht?" helpText="Mehrfachauswahl möglich." />
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

export function Step6Zeitziel({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <StepCard>
      <StepHeader idx={6} total={Q_TOTAL} prompt="Bis wann möchtest du Ergebnisse sehen?" helpText="Der Zeitrahmen entscheidet mit, wann du am besten startest." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnswerCard label="Vor diesem Sommer" onSelect={() => onSelect('diesen_sommer')} />
        <AnswerCard label="Vor einem konkreten Anlass" sub="(Hochzeit, Urlaub, Geburtstag)" onSelect={() => onSelect('anlass')} />
        <AnswerCard label="Kein Zeitdruck — ich will es angehen" onSelect={() => onSelect('kein_druck')} />
        <AnswerCard label="Vor dem nächsten Sommer reicht" onSelect={() => onSelect('naechster_sommer')} />
      </div>
    </StepCard>
  )
}

// Step 7 - Pivot interstitial. No options - just a reframe + continue.
// Wording is intentionally defensive: we say cremes/kompression "wirken
// auf der Haut, nicht auf das Gefäß darunter" instead of the brief's
// stronger "können Besenreiser nicht entfernen" - same medical reality,
// less UWG-comparative-advertising risk.
export function Step7Pivot({ answers, onContinue }: { answers: QuizAnswers; onContinue: () => void }) {
  const q5Real = answers.q5_versucht.filter(v => v !== 'nichts')
  const q5Empty = q5Real.length === 0
  const triggerText = answers.q2_trigger ? Q2_PIVOT_TEXT[answers.q2_trigger] : ''
  const zeitzielText = answers.q6_zeitziel ? Q6_PIVOT_TEXT[answers.q6_zeitziel] : ''

  return (
    <StepCard>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '14px', lineHeight: 1.3 }}>
        Kurz mal ehrlich.
      </h2>
      <p style={{ fontSize: '15px', color: '#444', marginBottom: '6px' }}>Du hast gerade gesagt:</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px 0' }}>
        {triggerText && (
          <li style={{ fontSize: '14px', color: '#444', padding: '4px 0', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#003399' }}>•</span>Sie sind {triggerText}
          </li>
        )}
        {q5Empty ? (
          <li style={{ fontSize: '14px', color: '#444', padding: '4px 0', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#003399' }}>•</span>Du informierst dich gerade — gut so. Die meisten warten zu lange.
          </li>
        ) : (
          <li style={{ fontSize: '14px', color: '#444', padding: '4px 0', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#003399' }}>•</span>Du hast schon {q5Real.length} {q5Real.length === 1 ? 'Strategie' : 'Strategien'} ausprobiert
          </li>
        )}
        {zeitzielText && (
          <li style={{ fontSize: '14px', color: '#444', padding: '4px 0', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#003399' }}>•</span>Bis {zeitzielText} willst du was ändern
          </li>
        )}
      </ul>

      <p style={{ fontSize: '15px', color: '#0A1F44', fontWeight: 600, marginBottom: '10px' }}>
        Das Problem ist nicht, dass nichts gewirkt hat.
      </p>
      <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '14px' }}>
        Cremes, Kompressionsstrümpfe und Camouflage wirken auf der Haut — nicht auf das Gefäß darunter, das die sichtbare Verfärbung verursacht. Für die Behandlung der Gefäße selbst gibt es etablierte Verfahren in der Phlebologie.
      </p>
      <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '20px' }}>
        Auf der nächsten Seite siehst du, welche Methoden bei Befunden wie deinem in der Phlebologie eingesetzt werden — als Vorbereitung auf dein Erstgespräch.
      </p>

      <button
        type="button"
        onClick={onContinue}
        style={{
          width: '100%', backgroundColor: '#003399', color: '#fff', fontWeight: 700,
          fontSize: '15px', border: 'none', borderRadius: '6px', padding: '13px 20px', cursor: 'pointer',
        }}
      >
        Plan anzeigen →
      </button>
    </StepCard>
  )
}

// Step 8 - 2-second loader with three rotating reassurance lines.
// Auto-advances to step 9 via the onDone callback.
const LOADER_LINES = [
  'Wir gleichen deine Angaben mit den Leitlinien der Phlebologie ab…',
  'Wir prüfen, was bei deinem Hauttyp und Befund infrage kommt…',
  'Dein Plan ist fertig.',
]

export function Step8Loading({ onDone }: { onDone: () => void }) {
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
