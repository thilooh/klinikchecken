// Computes the user's "Befundprofil" (typ + Ausprägungs-Score +
// Dringlichkeits-Score) from the 8 quiz answers. Runs once at the
// step 11 → 12 transition; the result is persisted in QuizState so
// the result page renders deterministically without recomputing on
// every render.
//
// HWG-compliance notes:
// - "Teleangiektasien" is the proper medical term for the visible
//   surface vessels people call Besenreiser. Using it framed as a
//   "Typ" doesn't promise anything - it just classifies the input.
// - Scores are 1-8 / 1-6 with text labels rather than concrete
//   percentages so we never make a quantified prognosis.
// - Progression hints are general statements about the underlying
//   condition's natural course, not individual predictions.

import type { QuizAnswers, ComputedProfile } from './quizState'

export function computeProfile(answers: QuizAnswers): ComputedProfile {
  // Typ-Bestimmung. Order matters: gesicht overrides everything,
  // then hormonal triggers, then a size-based fallback.
  let typ = 'Erworbene Teleangiektasien'
  if (answers.q1_lokalisation === 'gesicht') {
    typ = 'Faziale Teleangiektasien'
  } else if (answers.q2_trigger === 'schwangerschaft') {
    typ = 'Hormonell bedingte Teleangiektasien'
  } else if (answers.q2_trigger === 'wechseljahre') {
    typ = 'Hormonell verstärkte Teleangiektasien'
  } else if (answers.q2_trigger === 'schon_immer') {
    typ = 'Genetisch bedingte Teleangiektasien'
  } else if (answers.q3_groesse === 'flaechig') {
    typ = 'Ausgeprägte retikuläre Teleangiektasien'
  }

  // Ausprägungs-Score (1-8) - size is the dominant factor, multi-area
  // bumps it up by one to reflect distribution.
  let auspraegungScore = 3
  if (answers.q3_groesse === 'fein') auspraegungScore = 2
  if (answers.q3_groesse === 'mittel') auspraegungScore = 4
  if (answers.q3_groesse === 'groesser') auspraegungScore = 6
  if (answers.q3_groesse === 'flaechig') auspraegungScore = 7
  if (answers.q1_lokalisation === 'beine_mehrere') {
    auspraegungScore = Math.min(8, auspraegungScore + 1)
  }

  // Dringlichkeits-Score (1-6) - combines progression risk
  // (hormonal triggers) with subjective avoidance and concrete
  // time pressure.
  let dringlichkeitScore = 2
  if (answers.q2_trigger === 'schwangerschaft' || answers.q2_trigger === 'wechseljahre') {
    dringlichkeitScore += 1
  }
  if (answers.q7_vermeidung === 'voellig_zu') dringlichkeitScore += 2
  if (answers.q7_vermeidung === 'eher_zu') dringlichkeitScore += 1
  if (answers.q8_zeitziel === 'diesen_sommer' || answers.q8_zeitziel === 'anlass') {
    dringlichkeitScore += 1
  }
  dringlichkeitScore = Math.min(6, dringlichkeitScore)

  return { typ, auspraegungScore, dringlichkeitScore }
}

export function getAuspraegungLabel(score: number): string {
  if (score <= 2) return 'Leicht ausgeprägt'
  if (score <= 4) return 'Mittel ausgeprägt'
  if (score <= 6) return 'Deutlich ausgeprägt'
  return 'Stark ausgeprägt'
}

export function getDringlichkeitLabel(score: number): string {
  if (score <= 2) return 'Niedrig — kein akuter Handlungsbedarf'
  if (score <= 4) return 'Mittel — Behandlung sinnvoll'
  return 'Hoch — Behandlung empfehlenswert'
}

// Generic statements about the natural course of the underlying
// condition. Triggered by Q2 only - "schon_immer" returns null
// because progression isn't a meaningful framing for a lifelong
// genetic predisposition.
export function getProgressionHint(answers: QuizAnswers): string | null {
  if (answers.q2_trigger === 'schwangerschaft') {
    return 'Bei hormonell ausgelösten Befunden ist eine Zunahme der Ausprägung über die Jahre häufig.'
  }
  if (answers.q2_trigger === 'wechseljahre') {
    return 'Während und nach den Wechseljahren kommen oft weitere Befunde hinzu.'
  }
  if (answers.q2_trigger === 'schleichend') {
    return 'Schleichende Befunde nehmen über die Jahre üblicherweise weiter zu.'
  }
  return null
}

// Score-bar colour ramp - blue up to 4, orange 5-6, red 7+.
// Exposed here so the ScoreBar component and the email template
// can use identical thresholds.
export function colorForScore(score: number): string {
  if (score >= 7) return '#CC0000'
  if (score >= 5) return '#FF6600'
  return '#003399'
}
