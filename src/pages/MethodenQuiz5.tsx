// V5 working copy of the methoden-quiz, mounted at /methoden-quiz-5.
// Synthesis variant: V2's tonal assets (claim-stack helpers,
// "unsichtbare Steuer" mirror, "Was ich daraus lerne →" CTA, "Pelle
// rücken" Step 11) + V3's mechanism asset (depth-math pivot with
// footnotes, Q4-hauttyp safety, Q3-flächig hint, Q8-timing block) +
// V4's delivery-first Step 12 (hero + praxen-above-fold + drawer
// table). Mirror branching for Step 5 / Step 7 reduces reactance on
// the low-pain "stoert_aber_alltag" cluster.
//
// Email-side: Step11Capture passes `variant: 'v5'` in the quiz-submit
// body; the function uses it to wrap the V3 depth-math content with
// a V2-tonal "Erinnerst du dich, was du probiert hast?" opener so the
// inbox arrival matches the quiz tonality.

import { useEffect, useReducer, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import QuizHeader from '../components/quiz/QuizHeader'
import {
  Step1Lokalisation,
  Step2Trigger,
  Step3Groesse,
  Step4Hauttyp,
  Step5Recognition,
  Step6Versucht,
  Step7Vermeidung,
  Step8Zeitziel,
  Step9Pivot,
  Step10Loading,
} from '../components/quiz/QuizSteps'
import Step11Capture from '../components/quiz/Step11Capture'
import Step12Result from '../components/quiz/Step12Result'
import { useSeo, SITE_URL } from '../lib/seo'
import { getCTAVariant } from '../lib/ctaVariant'
import {
  trackQuizView,
  trackQuizWishlist,
  trackQuizCustomize,
} from '../lib/quizTracking'
import {
  INITIAL_QUIZ_STATE,
  loadPersisted,
  persist,
  quizReducer,
  clearPersisted,
} from '../lib/quizState'

export default function MethodenQuiz5() {
  useSeo({
    title: 'Welcher Besenreiser-Typ bist du? – 60-Sekunden-Orientierung',
    description: 'In 60 Sekunden zu deiner persönlichen Quiz-Auswertung: Typ, Ausprägung, in Frage kommende Methoden. Eine Orientierungshilfe - keine medizinische Diagnose.',
    canonical: `${SITE_URL}/methoden-quiz-5`,
    ogType: 'article',
  })

  const [state, dispatch] = useReducer(quizReducer, INITIAL_QUIZ_STATE, init => loadPersisted() ?? init)
  const [ctaVariant] = useState(() => getCTAVariant())

  useEffect(() => { persist(state) }, [state])

  useEffect(() => {
    trackQuizView(ctaVariant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goNext = () => dispatch({ type: 'GOTO', step: state.currentStep + 1 })

  useEffect(() => {
    if (state.currentStep === 8 && state.answers.q7_vermeidung) {
      trackQuizWishlist(state.answers, ctaVariant)
    }
    if (state.currentStep === 10) {
      trackQuizCustomize(state.answers, ctaVariant)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentStep])

  const reset = () => {
    clearPersisted()
    dispatch({ type: 'RESET' })
  }

  const showHeader = state.currentStep <= 9
  const containerClass = state.currentStep === 12
    ? 'max-w-[820px] mx-auto px-4'
    : 'max-w-[640px] mx-auto px-4'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '24px 0 48px' }}>
        <div className={containerClass}>
          {showHeader && <QuizHeader step={state.currentStep} />}

          {state.currentStep === 1 && (
            <Step1Lokalisation variant="v5" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q1_lokalisation', value: v })} />
          )}
          {state.currentStep === 2 && (
            <Step2Trigger variant="v5" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q2_trigger', value: v })} />
          )}
          {state.currentStep === 3 && (
            <Step3Groesse variant="v5" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q3_groesse', value: v })} />
          )}
          {state.currentStep === 4 && (
            <Step4Hauttyp variant="v5" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q4_hauttyp', value: v })} />
          )}
          {state.currentStep === 5 && (
            <Step5Recognition variant="v5" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q5_recognition', value: v })} />
          )}
          {state.currentStep === 6 && (
            <Step6Versucht
              variant="v5"
              selected={state.answers.q6_versucht}
              onToggle={v => dispatch({ type: 'TOGGLE_VERSUCHT', value: v })}
              onContinue={goNext}
            />
          )}
          {state.currentStep === 7 && (
            <Step7Vermeidung variant="v5" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q7_vermeidung', value: v })} />
          )}
          {state.currentStep === 8 && (
            <Step8Zeitziel variant="v5" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q8_zeitziel', value: v })} />
          )}
          {state.currentStep === 9 && (
            <Step9Pivot variant="v5" answers={state.answers} onContinue={goNext} />
          )}
          {state.currentStep === 10 && (
            <Step10Loading variant="v5" onDone={goNext} />
          )}
          {state.currentStep === 11 && (
            <Step11Capture
              variant="v5"
              initial={state.lead}
              answers={state.answers}
              onSubmitted={(lead, profile) => {
                dispatch({ type: 'SET_LEAD', partial: lead })
                dispatch({ type: 'SET_PROFILE', profile })
                dispatch({ type: 'MARK_SUBMITTED' })
                dispatch({ type: 'GOTO', step: 12 })
              }}
            />
          )}
          {state.currentStep === 12 && state.computedProfile && (
            <Step12Result
              variant="v5"
              answers={state.answers}
              lead={state.lead}
              profile={state.computedProfile}
              onReset={reset}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
