// Pivot-step (Step 9) text composition. V3 replaces the V2 "your
// surface aids didn't fail you" framing with a Mechanism-Reframe:
// the pivot now explains *why* surface aids couldn't have worked
// (because Besenreiser are a vessel-level condition, not a skin
// condition) and routes to the next step as "let's see what
// actually treats the underlying mechanism".
//
// Wording is medically conservative and HWG-vetted:
// - "Klappenschwäche der feinen Venen" / "dauerhafte Erweiterung
//   der feinen Gefäße" are accurate descriptions of the underlying
//   mechanism without making a treatment promise.
// - The face variant deliberately avoids the "Klappenschwäche"
//   framing because facial teleangiectasias don't have valves -
//   the mechanism there is permanent capillary dilation.

import type { QuizAnswers } from './quizState'

const NICHTS = 'nichts'

function realTriedCount(q6_versucht: string[]): number {
  return q6_versucht.filter(v => v !== NICHTS).length
}

// Bullet 2 - count-based phrasing for Q6. Word "eine" instead of
// numeral "1" so the singular case doesn't read like a placeholder.
export function getBullet2Text(q6_versucht: string[]): string {
  const count = realTriedCount(q6_versucht)
  if (count === 0) return 'Du informierst dich gerade — bevor du etwas ausprobierst'
  if (count === 1) return 'Du hast schon eine Strategie probiert'
  return `Du hast schon ${count} verschiedene Strategien probiert`
}

// Mechanism-reframe paragraph. Two paths: legs (vein valve story)
// and face (capillary dilation story).
export function getMechanismParagraph(q1_lokalisation: string | null): string {
  if (q1_lokalisation === 'gesicht') {
    return 'Es sind nicht nur "geplatzte Äderchen". Es sind erweiterte Kapillargefäße direkt unter der dünnen Gesichtshaut — und der Grund, warum sie sichtbar werden, liegt in einer dauerhaften Erweiterung der feinen Gefäße, die du mit Pflege oder Make-up nicht zurückdrücken kannst.'
  }
  return 'Besenreiser sind keine Hautsache. Es sind erweiterte Gefäße direkt unter der Hautoberfläche — und der Grund, warum sie sichtbar werden, liegt in einer Klappenschwäche der feinen Venen, die du nicht selbst trainieren oder wegcremen kannst.'
}

// "Hier ist, was die meisten ... nie erfahren" headline. Shifts
// based on Q1 so face users don't read "Besenreiser im Gesicht"
// being introduced as a separate concept later in the same paragraph.
export function getMechanismHeadline(q1_lokalisation: string | null): string {
  if (q1_lokalisation === 'gesicht') {
    return 'Hier ist, was die meisten Frauen über Besenreiser im Gesicht nie erfahren:'
  }
  return 'Hier ist, was die meisten Frauen über Besenreiser nie erfahren:'
}

// Why-the-aids-didn't-work follow-up. Same surface-aid call-out as
// V2 but reframed from "they had a different job" so the user feels
// uncomplicated rather than scolded.
export function getAidsExplanation(q1_lokalisation: string | null): string {
  if (q1_lokalisation === 'gesicht') {
    return 'Das ist auch der Grund, warum Cremes, Camouflage und Beruhigungs-Pflege nicht funktionieren konnten — sie waren für ein anderes Problem gemacht.'
  }
  return 'Das ist auch der Grund, warum Cremes, Kompression und Hausmittel nicht funktionieren konnten — sie waren für ein anderes Problem gemacht.'
}

// Forward-look closer. Routes face users to Dermatologie /
// Lasermedizin and leg users to Phlebologie - medically accurate
// and UWG-safer (we don't conflate specialties).
export function getForwardLook(q1_lokalisation: string | null): string {
  if (q1_lokalisation === 'gesicht') {
    return 'Auf der nächsten Seite siehst du dein persönliches Befundprofil und welche Verfahren in der Dermatologie und Lasermedizin genau dieses Gefäß-Problem behandeln.'
  }
  return 'Auf der nächsten Seite siehst du dein persönliches Befundprofil und welche Methoden in der Phlebologie genau dieses Gefäß-Problem behandeln.'
}

// Small helper exported so the pivot component reads cleanly.
export function pivotTextFromAnswers(answers: QuizAnswers) {
  return {
    bullet2: getBullet2Text(answers.q6_versucht),
    mechanismHeadline: getMechanismHeadline(answers.q1_lokalisation),
    mechanismParagraph: getMechanismParagraph(answers.q1_lokalisation),
    aidsExplanation: getAidsExplanation(answers.q1_lokalisation),
    forwardLook: getForwardLook(answers.q1_lokalisation),
  }
}
