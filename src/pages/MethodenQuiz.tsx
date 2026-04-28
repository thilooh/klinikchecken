import { useEffect, useReducer } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import QuizHeader from '../components/quiz/QuizHeader'
import {
  Step1Lokalisation,
  Step2Trigger,
  Step3Groesse,
  Step4Hauttyp,
  Step5Versucht,
  Step6Zeitziel,
  Step7Pivot,
  Step8Loading,
} from '../components/quiz/QuizSteps'
import { useSeo, SITE_URL } from '../lib/seo'
import {
  INITIAL_QUIZ_STATE,
  loadPersisted,
  persist,
  quizReducer,
  clearPersisted,
} from '../lib/quizState'

export default function MethodenQuiz() {
  useSeo({
    title: 'Welche Behandlung passt zu meinen Besenreisern? – 60-Sekunden-Beine-Check',
    description: 'In 60 Sekunden zur passenden Behandlungsmethode: Sklerosierung, Laser oder IPL. Sieben Fragen zu Lokalisation, Befund und Hauttyp – plus Praxen in deiner Nähe.',
    canonical: `${SITE_URL}/methoden-quiz`,
    ogType: 'article',
  })

  // Lazy initialiser hydrates from sessionStorage so a reload mid-quiz
  // keeps the user where they were. The persisted state has a 24h TTL
  // (see loadPersisted) - older sessions start fresh.
  const [state, dispatch] = useReducer(quizReducer, INITIAL_QUIZ_STATE, init => loadPersisted() ?? init)

  // Persist on every change so the next reload picks up.
  useEffect(() => { persist(state) }, [state])

  // Loader auto-advances; everything else triggers via user action.
  const goNext = () => dispatch({ type: 'GOTO', step: state.currentStep + 1 })

  const showHeader = state.currentStep <= 7

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '24px 0 48px' }}>
        <div className="max-w-[640px] mx-auto px-4">
          {showHeader && <QuizHeader step={state.currentStep} />}

          {state.currentStep === 1 && (
            <Step1Lokalisation onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q1_lokalisation', value: v })} />
          )}
          {state.currentStep === 2 && (
            <Step2Trigger onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q2_trigger', value: v })} />
          )}
          {state.currentStep === 3 && (
            <Step3Groesse onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q3_groesse', value: v })} />
          )}
          {state.currentStep === 4 && (
            <Step4Hauttyp onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q4_hauttyp', value: v })} />
          )}
          {state.currentStep === 5 && (
            <Step5Versucht
              selected={state.answers.q5_versucht}
              onToggle={v => dispatch({ type: 'TOGGLE_VERSUCHT', value: v })}
              onContinue={goNext}
            />
          )}
          {state.currentStep === 6 && (
            <Step6Zeitziel onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q6_zeitziel', value: v })} />
          )}
          {state.currentStep === 7 && (
            <Step7Pivot answers={state.answers} onContinue={goNext} />
          )}
          {state.currentStep === 8 && (
            <Step8Loading onDone={goNext} />
          )}
          {state.currentStep === 9 && (
            <PlaceholderStep title="Step 9 – Lead-Capture" onReset={() => { clearPersisted(); dispatch({ type: 'RESET' }) }} />
          )}
          {state.currentStep === 10 && (
            <PlaceholderStep title="Step 10 – Plan + Praxen" onReset={() => { clearPersisted(); dispatch({ type: 'RESET' }) }} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Placeholder until Phase 3/4 ship. Lets the user click through the
// new quiz end-to-end and confirms the state machine wires correctly.
function PlaceholderStep({ title, onReset }: { title: string; onReset: () => void }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>{title}</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>Wird in der nächsten Phase implementiert.</p>
      <button onClick={onReset} style={{ background: 'none', border: 'none', color: '#0052CC', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>Quiz neu starten</button>
    </div>
  )
}
