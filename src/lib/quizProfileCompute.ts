// Computes the user's "Orientierungsprofil" (typ + Ausprägungs-Score
// + Behandlungswunsch-Score) from the 8 quiz answers. Runs once at
// the step 11 → 12 transition; the result is persisted in QuizState
// so the result page renders deterministically without recomputing.
//
// Wording is defensive (Anpassung A from the legal review):
// - "Besenreiser" instead of "Teleangiektasien" - removes the
//   medical-classification feel without losing the trigger-based
//   sub-typing.
// - "Behandlungswunsch" instead of "Behandlungs-Dringlichkeit" -
//   reframes from "we triage your case" to "you reported this
//   priority", which is what the score actually measures (it's
//   built from Q7 vermeidung + Q8 zeitziel).
// - Score labels are descriptive of the user's input (leicht /
//   mittel / stark ausgeprägt), not clinical recommendations.
// - Progression hints stay general ("erfahrungsgemäß", "häufig")
//   rather than individual prognoses.

import type { QuizAnswers, ComputedProfile } from './quizState'

export function computeProfile(answers: QuizAnswers): ComputedProfile {
  let typ = 'Erworbene Besenreiser'
  if (answers.q1_lokalisation === 'gesicht') {
    typ = 'Besenreiser im Gesicht'
  } else if (answers.q2_trigger === 'schwangerschaft') {
    typ = 'Hormonell bedingte Besenreiser'
  } else if (answers.q2_trigger === 'wechseljahre') {
    typ = 'Hormonell verstärkte Besenreiser'
  } else if (answers.q2_trigger === 'schon_immer') {
    typ = 'Veranlagte Besenreiser'
  } else if (answers.q3_groesse === 'flaechig') {
    typ = 'Ausgeprägte netzartige Besenreiser'
  }

  // Ausprägungs-Score (1-8). Size is the dominant factor;
  // multi-area bumps it up by one to reflect distribution.
  let auspraegungScore = 3
  if (answers.q3_groesse === 'fein') auspraegungScore = 2
  if (answers.q3_groesse === 'mittel') auspraegungScore = 4
  if (answers.q3_groesse === 'groesser') auspraegungScore = 6
  if (answers.q3_groesse === 'flaechig') auspraegungScore = 7
  if (answers.q1_lokalisation === 'beine_mehrere') {
    auspraegungScore = Math.min(8, auspraegungScore + 1)
  }

  // Behandlungswunsch-Score (1-6). Combines hormonal trigger
  // (a generic progression hint, not a personal prognosis),
  // self-reported avoidance, and time pressure.
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

// Reframed from clinical urgency labels ("Hoch — Behandlung
// empfehlenswert") to plain priority labels. The score reflects
// what the user said about their own willingness to act, not a
// medical recommendation.
export function getDringlichkeitLabel(score: number): string {
  if (score <= 2) return 'Niedrig — du hast Zeit'
  if (score <= 4) return 'Mittel'
  return 'Hoch — du willst zeitnah weiter'
}

// General-knowledge statements about the natural course of
// Besenreiser by trigger. Wording is hedged ("häufig",
// "üblicherweise") and never frames the user's specific case.
export function getProgressionHint(answers: QuizAnswers): string | null {
  if (answers.q2_trigger === 'schwangerschaft') {
    return 'Erfahrungsgemäß zeigen sich bei hormonell entstandenen Besenreisern über die Jahre häufig zusätzliche Adern.'
  }
  if (answers.q2_trigger === 'wechseljahre') {
    return 'Während und nach den Wechseljahren kommen erfahrungsgemäß oft weitere Besenreiser hinzu.'
  }
  if (answers.q2_trigger === 'schleichend') {
    return 'Schleichend entstandene Besenreiser nehmen über die Jahre üblicherweise weiter zu.'
  }
  return null
}

export function colorForScore(score: number): string {
  if (score >= 7) return '#CC0000'
  if (score >= 5) return '#FF6600'
  return '#003399'
}
