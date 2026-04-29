// V5 strip-DR working copy of the methoden-quiz, mounted at /methoden-quiz-3.
// Identical to MethodenQuiz.tsx (V3) at the moment of forking - this
// is the surface where direct-response copy revisions and frame-shift
// seeds get tested before they're promoted back to /methoden-quiz.
//
// Both pages import the same shared step components today; if a
// rewrite needs to diverge (e.g. a new pivot text), either add a
// `variant` prop to the shared step or fork the relevant step into
// e.g. Step9Pivot2.tsx and import it here.
//
// Don't delete MethodenQuiz.tsx - keeping the V3 baseline reachable
// at /methoden-quiz so we have a stable comparison surface.

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

export default function MethodenQuiz3() {
  useSeo({
    title: 'Welcher Besenreiser-Typ bist du? – 60-Sekunden-Orientierung',
    description: 'In 60 Sekunden zu deiner persönlichen Quiz-Auswertung: Typ, Ausprägung, in Frage kommende Methoden. Eine Orientierungshilfe - keine medizinische Diagnose.',
    canonical: `${SITE_URL}/methoden-quiz-3`,
    ogType: 'article',
  })

  // Lazy initialiser hydrates from sessionStorage so a reload mid-quiz
  // keeps the user where they were. The persisted state has a 24h TTL
  // (see loadPersisted) - older sessions start fresh. Storage key v3
  // makes any in-flight v2 sessions start fresh too.
  const [state, dispatch] = useReducer(quizReducer, INITIAL_QUIZ_STATE, init => loadPersisted() ?? init)
  const [ctaVariant] = useState(() => getCTAVariant())

  useEffect(() => { persist(state) }, [state])

  // ViewContent fires once when the quiz mounts - the top-of-funnel
  // signal Meta uses for audience-building and look-alikes. Even if
  // the user resumes from a persisted state at step 7, the page-view
  // is still a meaningful event on this surface.
  useEffect(() => {
    trackQuizView(ctaVariant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Loader auto-advances; everything else triggers via user action.
  const goNext = () => dispatch({ type: 'GOTO', step: state.currentStep + 1 })

  // Step-driven mid-funnel events. Each fires once when the user
  // arrives at the relevant step boundary (the answer was just made).
  useEffect(() => {
    // Step 8: user just answered Q7 (Vermeidung). Strongest mid-
    // funnel investment anchor - the Add-To-Wishlist semantic fits.
    if (state.currentStep === 8 && state.answers.q7_vermeidung) {
      trackQuizWishlist(state.answers, ctaVariant)
    }
    // Step 10: loader running, recommendation about to surface.
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
  // Step 12 needs more horizontal room for the homepage-style ClinicCard
  // (logo + photo + content panels). Steps 1-11 keep the tighter 640.
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
            <Step1Lokalisation variant="v3" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q1_lokalisation', value: v })} />
          )}
          {state.currentStep === 2 && (
            <Step2Trigger variant="v3" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q2_trigger', value: v })} />
          )}
          {state.currentStep === 3 && (
            <Step3Groesse variant="v3" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q3_groesse', value: v })} />
          )}
          {state.currentStep === 4 && (
            <Step4Hauttyp variant="v3" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q4_hauttyp', value: v })} />
          )}
          {state.currentStep === 5 && (
            <Step5Recognition variant="v3" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q5_recognition', value: v })} />
          )}
          {state.currentStep === 6 && (
            <Step6Versucht
              variant="v3"
              selected={state.answers.q6_versucht}
              onToggle={v => dispatch({ type: 'TOGGLE_VERSUCHT', value: v })}
              onContinue={goNext}
            />
          )}
          {state.currentStep === 7 && (
            <Step7Vermeidung variant="v3" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q7_vermeidung', value: v })} />
          )}
          {state.currentStep === 8 && (
            <Step8Zeitziel variant="v3" onSelect={v => dispatch({ type: 'ANSWER_SINGLE', key: 'q8_zeitziel', value: v })} />
          )}
          {state.currentStep === 9 && (
            <Step9Pivot variant="v3" answers={state.answers} onContinue={goNext} />
          )}
          {state.currentStep === 10 && (
            <Step10Loading variant="v3" onDone={goNext} />
          )}
          {state.currentStep === 11 && (
            <Step11Capture
              variant="v3"
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
              variant="v3"
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
