// State + reducer + sessionStorage persistence for the 10-step
// Methoden-Quiz. Lives in lib/ rather than co-located with the page
// component so the result page can read the same answers when the
// user lands directly on /methoden-quiz/result via a back-button.

export type QuizAnswers = {
  q1_lokalisation: 'beine_unten' | 'beine_oben' | 'beine_mehrere' | 'gesicht' | null
  q2_trigger: 'schon_immer' | 'schwangerschaft' | 'wechseljahre' | 'schleichend' | null
  q3_groesse: 'fein' | 'mittel' | 'groesser' | 'flaechig' | null
  q4_hauttyp: 'hell_mittel' | 'dunkler' | null
  q5_versucht: string[]
  q6_zeitziel: 'diesen_sommer' | 'anlass' | 'kein_druck' | 'naechster_sommer' | null
}

export type QuizLead = {
  vorname: string
  email: string
  plz: string
  consent_data: boolean
  consent_marketing: boolean
}

export type QuizState = {
  currentStep: number // 1..10
  answers: QuizAnswers
  lead: QuizLead
  submittedAt: string | null
}

export const INITIAL_QUIZ_STATE: QuizState = {
  currentStep: 1,
  answers: {
    q1_lokalisation: null,
    q2_trigger: null,
    q3_groesse: null,
    q4_hauttyp: null,
    q5_versucht: [],
    q6_zeitziel: null,
  },
  lead: { vorname: '', email: '', plz: '', consent_data: false, consent_marketing: false },
  submittedAt: null,
}

export type QuizAction =
  | { type: 'ANSWER_SINGLE'; key: Exclude<keyof QuizAnswers, 'q5_versucht'>; value: string }
  | { type: 'TOGGLE_VERSUCHT'; value: string }
  | { type: 'GOTO'; step: number }
  | { type: 'SET_LEAD'; partial: Partial<QuizLead> }
  | { type: 'MARK_SUBMITTED' }
  | { type: 'RESET' }

// "Noch nichts" is mutually exclusive with the other Q5 options - selecting
// it clears the rest, selecting any other clears it. Keeps the data clean
// for the recommendation logic and the pivot-step counter.
const NICHTS = 'nichts'

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'ANSWER_SINGLE':
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value as never },
        currentStep: state.currentStep + 1,
      }
    case 'TOGGLE_VERSUCHT': {
      const cur = state.answers.q5_versucht
      let next: string[]
      if (action.value === NICHTS) {
        next = cur.includes(NICHTS) ? [] : [NICHTS]
      } else {
        const without = cur.filter(v => v !== NICHTS && v !== action.value)
        next = cur.includes(action.value) ? without : [...without, action.value]
      }
      return { ...state, answers: { ...state.answers, q5_versucht: next } }
    }
    case 'GOTO':
      return { ...state, currentStep: Math.max(1, Math.min(10, action.step)) }
    case 'SET_LEAD':
      return { ...state, lead: { ...state.lead, ...action.partial } }
    case 'MARK_SUBMITTED':
      return { ...state, submittedAt: new Date().toISOString() }
    case 'RESET':
      return INITIAL_QUIZ_STATE
  }
}

const STORAGE_KEY = 'bcheck_quiz_state_v2'
const TTL_MS = 24 * 60 * 60 * 1000

type Persisted = { savedAt: number; state: QuizState }

export function loadPersisted(): QuizState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Persisted
    if (Date.now() - parsed.savedAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed.state
  } catch {
    return null
  }
}

export function persist(state: QuizState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), state }))
  } catch { /* sessionStorage may be unavailable in some IAB contexts */ }
}

export function clearPersisted(): void {
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

// Non-linear progress curve - matches the brief.
const PROGRESS_PCT = [0, 10, 22, 34, 46, 58, 68, 78, 88, 95, 100]
export function progressForStep(step: number): number {
  return PROGRESS_PCT[Math.max(0, Math.min(10, step))] ?? 0
}
