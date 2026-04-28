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
import Step9Capture from '../components/quiz/Step9Capture'
import Step10Result from '../components/quiz/Step10Result'
import { useSeo, SITE_URL } from '../lib/seo'
import { sendEvent } from '../lib/gtm'
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

  // CustomizeProduct fires once when the recommendation appears
  // (between loading and the result page) - matches the previous
  // tracking behaviour in the old quiz.
  useEffect(() => {
    if (state.currentStep === 8) {
      sendEvent('CustomizeProduct', { content_type: 'methoden_quiz' })
    }
  }, [state.currentStep])

  const reset = () => {
    clearPersisted()
    dispatch({ type: 'RESET' })
  }

  const showHeader = state.currentStep <= 7
  // Step 10 needs more horizontal room for the homepage-style ClinicCard
  // (logo + photo + content panels). 640 was tight, 820 matches the
  // effective content width of the homepage results column (1200 minus
  // sidebar), without a sidebar of our own.
  const containerClass = state.currentStep === 10
    ? 'max-w-[820px] mx-auto px-4'
    : 'max-w-[640px] mx-auto px-4'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '24px 0 48px' }}>
        <div className={containerClass}>
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
            <Step9Capture
              initial={state.lead}
              answers={state.answers}
              onSubmitted={lead => {
                dispatch({ type: 'SET_LEAD', partial: lead })
                dispatch({ type: 'MARK_SUBMITTED' })
                dispatch({ type: 'GOTO', step: 10 })
              }}
            />
          )}
          {state.currentStep === 10 && (
            <Step10Result answers={state.answers} lead={state.lead} onReset={reset} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
