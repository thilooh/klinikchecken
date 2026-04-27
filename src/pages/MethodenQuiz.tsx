import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, RotateCcw } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useSeo, SITE_URL } from '../lib/seo'
import { sendEvent } from '../lib/gtm'

type Answer = 'beine' | 'gesicht' | 'fein' | 'mittel' | 'gross' | 'hell' | 'dunkel'

type Question = {
  id: number
  prompt: string
  helpText: string
  options: { value: Answer; label: string; sub?: string }[]
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: 'Wo möchtest du deine Besenreiser entfernen lassen?',
    helpText: 'Die Lokalisation entscheidet stark über die geeignete Methode.',
    options: [
      { value: 'beine', label: 'Beine', sub: 'Oberschenkel, Waden, Knöchel' },
      { value: 'gesicht', label: 'Gesicht', sub: 'Wangen, Nasenflügel, Kinn' },
    ],
  },
  {
    id: 2,
    prompt: 'Wie groß sind die Besenreiser?',
    helpText: 'Größere Adern brauchen tiefer wirkende Methoden.',
    options: [
      { value: 'fein', label: 'Sehr fein', sub: 'Wie ein dünnes Haar (< 0,2 mm)' },
      { value: 'mittel', label: 'Mittel', sub: 'Deutlich sichtbar, aber dünn (0,2–1 mm)' },
      { value: 'gross', label: 'Größer', sub: 'Knotige oder breitere Gefäße (> 1 mm)' },
    ],
  },
  {
    id: 3,
    prompt: 'Welchen Hauttyp hast du?',
    helpText: 'Bei dunklerer Haut sind manche Laser-Wellenlängen riskanter.',
    options: [
      { value: 'hell', label: 'Hell bis mittel', sub: 'Hauttyp 1–3' },
      { value: 'dunkel', label: 'Dunkler / Mediterran / POC', sub: 'Hauttyp 4–6' },
    ],
  },
]

type Recommendation = {
  method: string
  methodSlug: string
  rationale: string
  alternative?: string
}

function recommend(answers: Answer[]): Recommendation {
  const [location, size, skin] = answers as [Answer, Answer, Answer]

  // Face = laser/IPL territory
  if (location === 'gesicht') {
    if (size === 'fein') {
      return {
        method: 'IPL-Behandlung oder KTP-Laser',
        methodSlug: 'ipl',
        rationale: 'Sehr feine Gefäße im Gesicht reagieren besonders gut auf gepulstes Licht (IPL) oder den präzisen KTP-Laser. Beide sind sanft und narbenfrei.',
        alternative: 'Bei dichtem Befund kann ein Nd:YAG-Laser ergänzend sinnvoll sein.',
      }
    }
    if (skin === 'dunkel') {
      return {
        method: 'Nd:YAG-Laser',
        methodSlug: 'laser',
        rationale: 'Bei dunklerer Haut ist der Nd:YAG-Laser die sicherste Wahl - er dringt tiefer und schont die oberflächliche Pigmentierung. IPL und KTP bergen hier ein Risiko von Pigmentveränderungen.',
      }
    }
    return {
      method: 'Nd:YAG-Laser',
      methodSlug: 'laser',
      rationale: 'Mittelgroße Gesichtsbesenreiser sprechen sehr gut auf den Nd:YAG-Laser an. Die Behandlung ist präzise und ohne Nadel.',
      alternative: 'Bei tiefer liegenden Gefäßen kann eine Mikro-Verödung kombiniert werden.',
    }
  }

  // Legs
  if (size === 'gross') {
    return {
      method: 'Verödung (Sklerotherapie)',
      methodSlug: 'verodung',
      rationale: 'Größere Beinvenen werden am effektivsten durch Verödung behandelt. Die Methode ist seit Langem bewährt, sicher und wird von erfahrenen Phlebologen routiniert eingesetzt.',
      alternative: 'Bei Stammvarizen kann eine endovenöse Lasertherapie (ELVeS) ergänzend nötig sein.',
    }
  }

  if (size === 'mittel') {
    return {
      method: 'Verödung (Sklerotherapie)',
      methodSlug: 'verodung',
      rationale: 'Mittelgroße Besenreiser an den Beinen sind die klassische Indikation für die Sklerotherapie. Sie wird typischerweise in 3–6 Sitzungen durchgeführt.',
      alternative: 'Bei besonders dichten Arealen kann zusätzlich der Nd:YAG-Laser eingesetzt werden.',
    }
  }

  // size === 'fein'
  if (skin === 'dunkel') {
    return {
      method: 'Verödung (Sklerotherapie)',
      methodSlug: 'verodung',
      rationale: 'Bei dunklerer Haut empfehlen wir auch für feine Beinbesenreiser zunächst die Verödung - sie ist hauttyp-unabhängig und nebenwirkungsarm.',
      alternative: 'Sehr feine Adern können alternativ mit einem Nd:YAG-Laser behandelt werden.',
    }
  }

  return {
    method: 'Nd:YAG-Laser oder Verödung',
    methodSlug: 'laser',
    rationale: 'Sehr feine Beinbesenreiser sprechen oft besser auf den Nd:YAG-Laser an, weil keine Nadel nötig ist. Eine kombinierte Verödung deckt verbleibende größere Gefäße ab.',
    alternative: 'Frag deinen Phlebologen nach einer Kombi-Behandlung.',
  }
}

export default function MethodenQuiz() {
  useSeo({
    title: 'Welche Methode passt zu meinen Besenreisern? – 3-Fragen-Check',
    description: 'In 30 Sekunden zur passenden Behandlungsmethode: Verödung, Laser oder IPL? Unser Quiz fragt nach Lage, Größe und Hauttyp und gibt eine Empfehlung samt passender Praxen.',
    canonical: `${SITE_URL}/methoden-quiz`,
    ogType: 'article',
  })

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const result = step >= QUESTIONS.length ? recommend(answers) : null
  const completedRef = useRef(false)

  // Fire QuizStart on mount, QuizComplete (once) when the user
  // finishes all questions. Lets us measure the funnel
  // /methoden-quiz → start → answer 1/2/3 → complete → CTA-click.
  useEffect(() => {
    sendEvent('QuizStart', { content_type: 'methoden_quiz' })
  }, [])

  useEffect(() => {
    if (result && !completedRef.current) {
      completedRef.current = true
      sendEvent('QuizComplete', {
        content_type: 'methoden_quiz',
        content_name: result.method,
        item_name: result.method,
        item_category: result.methodSlug,
      })
    }
  }, [result])

  const select = (value: Answer) => {
    const next = [...answers, value]
    setAnswers(next)
    setStep(step + 1)
    sendEvent('QuizAnswer', {
      content_type: 'methoden_quiz',
      step: step + 1,
      answer: value,
    })
  }

  const reset = () => { setStep(0); setAnswers([]); completedRef.current = false }

  const progress = Math.min((step / QUESTIONS.length) * 100, 100)
  const current = QUESTIONS[step]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '32px 0 60px' }}>
        <div className="max-w-[640px] mx-auto px-4">
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0A1F44', marginBottom: '8px', textAlign: 'center', lineHeight: 1.2 }}>
            Welche Behandlung passt zu meinen Besenreisern?
          </h1>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px', textAlign: 'center' }}>
            3 Fragen - 30 Sekunden - keine Anmeldung
          </p>

          {/* Progress bar */}
          <div style={{ height: '6px', backgroundColor: '#E5E9F2', borderRadius: '3px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#003399', transition: 'width 0.25s ease' }} />
          </div>

          {current && (
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '28px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '13px', color: '#888', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.05em' }}>FRAGE {current.id} / {QUESTIONS.length}</div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '6px', lineHeight: 1.3 }}>{current.prompt}</h2>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>{current.helpText}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {current.options.map(opt => (
                  <button key={opt.value} onClick={() => select(opt.value)} style={{
                    textAlign: 'left', padding: '14px 16px', border: '1px solid #DDE3F5',
                    borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer',
                    transition: 'border-color 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#003399'; e.currentTarget.style.backgroundColor = '#F4F7FF' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDE3F5'; e.currentTarget.style.backgroundColor = '#fff' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#0A1F44' }}>{opt.label}</div>
                    {opt.sub && <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{opt.sub}</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {result && (
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '28px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#E5F4ED', color: '#0A7C4A', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                <Check size={14} /> EMPFEHLUNG
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0A1F44', marginBottom: '8px', lineHeight: 1.2 }}>
                {result.method}
              </h2>
              <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.6, marginBottom: '14px' }}>
                {result.rationale}
              </p>
              {result.alternative && (
                <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6, marginBottom: '20px', padding: '12px 14px', backgroundColor: '#F4F7FF', borderRadius: '4px', borderLeft: '3px solid #003399' }}>
                  <strong>Alternative:</strong> {result.alternative}
                </p>
              )}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <Link to={`/methode/${result.methodSlug}`} style={{
                  flex: 1, minWidth: '180px', textAlign: 'center', backgroundColor: '#003399', color: '#fff',
                  padding: '13px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '15px',
                }}>
                  Mehr zu dieser Methode
                </Link>
                <Link to="/" style={{
                  flex: 1, minWidth: '180px', textAlign: 'center', backgroundColor: '#FF6600', color: '#fff',
                  padding: '13px 20px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '15px',
                }}>
                  Praxen mit dieser Methode →
                </Link>
              </div>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '14px' }}>
                Hinweis: Diese Empfehlung ersetzt keine ärztliche Diagnose. Eine genaue Indikationsstellung erfolgt im Erstgespräch in der Praxis.
              </p>
              <button onClick={reset} style={{ background: 'none', border: 'none', color: '#0052CC', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', padding: 0 }}>
                <RotateCcw size={13} /> Quiz neu starten
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
