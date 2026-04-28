// Quiz recommendation logic. Returns a method recommendation, a
// price/sessions/duration range, and a timing hint - all formulated
// HWG-conform (no superlatives, no comparisons to specific products,
// always pointing to the Erstgespräch as the actual diagnosis source).

import type { QuizAnswers } from './quizState'

export type Recommendation = {
  primary: string
  description: string
  alternative?: string
  // Specialty whose practices typically perform the recommended
  // methods. Surfaces in the result page header and the practice
  // section divider so face users see "Dermatologie" rather than
  // "Phlebologie".
  fachgebiet: 'Phlebologie' | 'Dermatologie und Lasermedizin'
}

export function getMethodRecommendation(answers: QuizAnswers): Recommendation {
  // Gesicht - IPL/KTP territory regardless of skin type
  if (answers.q1_lokalisation === 'gesicht') {
    return {
      primary: 'IPL-Behandlung oder KTP-Laser',
      description: 'Sehr feine Gefäße im Gesicht werden in vielen Dermatologie- und Lasermedizin-Praxen mit gepulstem Licht (IPL) oder dem präzisen KTP-Laser behandelt. Bei dichteren Befunden kommt teilweise ein Nd:YAG-Laser zum Einsatz.',
      fachgebiet: 'Dermatologie und Lasermedizin',
    }
  }

  // Beine + dunkler Hauttyp - Sklerosierung bevorzugt (Laser-Risiko)
  if (answers.q4_hauttyp === 'dunkler') {
    return {
      primary: 'Mikroschaum-Sklerosierung',
      description: 'Die Sklerosierung gilt in der Phlebologie als Standardverfahren bei Besenreisern an den Beinen - und ist bei dunkleren Hauttypen häufig die sicherere Wahl, da bestimmte Laser-Wellenlängen bei Hauttyp 4–6 Pigmentveränderungen begünstigen können.',
      alternative: 'Nd:YAG-Laser kann bei sehr feinen Gefäßen ergänzend besprochen werden - die Indikation klärt der Arzt.',
      fachgebiet: 'Phlebologie',
    }
  }

  // Beine + sehr fein
  if (answers.q3_groesse === 'fein') {
    return {
      primary: 'Laser-Behandlung oder Sklerosierung',
      description: 'Sehr feine Besenreiser an den Beinen werden je nach Praxis und Befund mit Laser (Nd:YAG, KTP) oder Sklerosierung behandelt. Welche Methode bei dir besser passt, hängt vom genauen Befund ab.',
      alternative: 'Häufig kommt eine Kombination beider Methoden zum Einsatz.',
      fachgebiet: 'Phlebologie',
    }
  }

  // Beine + größer/flächig
  if (answers.q3_groesse === 'groesser' || answers.q3_groesse === 'flaechig') {
    return {
      primary: 'Mikroschaum-Sklerosierung',
      description: 'Bei größeren oder flächigen Befunden an den Beinen ist die Mikroschaum-Sklerosierung in der Phlebologie das verbreitetste Verfahren. Der Schaum verteilt sich gleichmäßig im Gefäß und behandelt auch verzweigte Areale.',
      alternative: 'Bei einzelnen größeren Gefäßen kann zusätzlich eine Mini-Phlebektomie besprochen werden.',
      fachgebiet: 'Phlebologie',
    }
  }

  // Default: Beine + mittel
  return {
    primary: 'Mikroschaum-Sklerosierung',
    description: 'Die Mikroschaum-Sklerosierung ist in der Phlebologie ein etabliertes Verfahren bei Besenreisern an den Beinen. Welche Methode bei dir konkret in Frage kommt, klärt das Erstgespräch.',
    alternative: 'Je nach Befund kann auch eine Laser-Behandlung ergänzend besprochen werden.',
    fachgebiet: 'Phlebologie',
  }
}

export type Ranges = {
  sitzungen: string
  dauer: string
  preis: string
}

export function getRanges(answers: QuizAnswers): Ranges {
  let sitzungenMin = 2, sitzungenMax = 3
  let preisMin = 800, preisMax = 1400

  if (answers.q3_groesse === 'flaechig') {
    sitzungenMin = 3; sitzungenMax = 5
    preisMin = 1100; preisMax = 1900
  } else if (answers.q3_groesse === 'fein') {
    sitzungenMin = 1; sitzungenMax = 3
    preisMin = 400; preisMax = 1100
  }

  return {
    sitzungen: `${sitzungenMin}–${sitzungenMax}`,
    dauer: `${sitzungenMin + 1}–${sitzungenMax + 1}`,
    preis: `ca. ${preisMin}–${preisMax} €`,
  }
}

export function getTimingHint(zeitziel: string | null): string {
  switch (zeitziel) {
    case 'diesen_sommer':
      return 'Wer im Sommer Ergebnisse sehen möchte, beginnt typischerweise im Herbst oder Winter davor - die Heilungsphase mit möglichen Hämatomen dauert mehrere Wochen.'
    case 'anlass':
      return 'Für einen konkreten Anlass starten viele Patientinnen 4–6 Monate vorher - so bleibt Puffer für die Heilungsphase.'
    case 'naechster_sommer':
      return 'Der Herbst und Winter sind in der Phlebologie die typische Behandlungssaison - keine Sonne, keine Sauna, ideal für die Heilung.'
    case 'kein_druck':
      return 'Ohne Zeitdruck zu starten ist ein Vorteil: Du kannst die Behandlung optimal in deinen Alltag legen.'
    default:
      return ''
  }
}

// Maps quiz-internal method keys to the canonical method names from
// clinics-meta.ts. The quiz only knows 4 surface treatments; deep-vein
// methods (Endovenöser Laser, RFA, ClariVein, Venenoperation) aren't
// recommended for cosmetic Besenreiser cases.
export type QuizMethodKey = 'sklerosierung' | 'laser_ndyag' | 'laser_ktp' | 'ipl'

export const QUIZ_METHOD_TO_CANONICAL: Record<QuizMethodKey, string[]> = {
  sklerosierung: ['Sklerotherapie', 'Schaumsklerotherapie'],
  laser_ndyag: ['Laser (Nd:YAG)'],
  laser_ktp: ['KTP-Laser'],
  ipl: ['IPL'],
}

export const QUIZ_METHOD_DISPLAY: Record<QuizMethodKey, string> = {
  sklerosierung: 'Mikroschaum-Sklerosierung',
  laser_ndyag: 'Nd:YAG-Laser',
  laser_ktp: 'KTP-Laser',
  ipl: 'IPL-Behandlung',
}

// Maps the user's quiz answers to the relevant method keys for ranking
// clinics. Mirrors the recommendation branches above.
export function getRelevantMethods(answers: QuizAnswers): QuizMethodKey[] {
  if (answers.q1_lokalisation === 'gesicht') {
    return ['ipl', 'laser_ktp', 'laser_ndyag']
  }
  if (answers.q4_hauttyp === 'dunkler') {
    return ['sklerosierung']
  }
  if (answers.q3_groesse === 'fein') {
    return ['laser_ndyag', 'laser_ktp', 'sklerosierung']
  }
  return ['sklerosierung']
}
