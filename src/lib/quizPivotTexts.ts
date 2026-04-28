// Pivot-step (Step 7) text composition helpers. Three slots are
// derived from the user's Q5 (Versucht) and Q1 (Lokalisation) state
// rather than a flat lookup, so they live here next to the simpler
// maps in quizDisplayMaps.ts.
//
// Wording vetted for HWG-compliance: no efficacy claims, no
// disparaging comparisons against creams / compression / camouflage,
// always closes with a reference to the Erstgespräch as the actual
// diagnosis source.

const NICHTS = 'nichts'

function realTriedCount(q5_versucht: string[]): number {
  return q5_versucht.filter(v => v !== NICHTS).length
}

// Slot 2 - count-based bullet. Special-cases 0 and 1 so the
// string never reads "Du hast schon 1 Strategie ausprobiert" (looks
// like a placeholder bug).
export function getBullet2Text(q5_versucht: string[]): string {
  const count = realTriedCount(q5_versucht)
  if (count === 0) return 'Du informierst dich gerade — bevor du etwas ausprobierst'
  if (count === 1) return 'Du hast schon eine Strategie ausprobiert'
  return `Du hast schon ${count} verschiedene Strategien ausprobiert`
}

// Slot 4 - reframe sentence. Two variants based on whether the user
// has tried anything yet. The "tried something" variant is stronger
// than the original draft because it disarms a hidden worry ("habe
// ich was Dummes gemacht?") rather than just restating the obvious.
export function getReframeText(q5_versucht: string[]): string {
  if (realTriedCount(q5_versucht) === 0) {
    return 'Das ist der richtige Moment, sich vor dem Probieren zu informieren.'
  }
  return 'Das Problem ist nicht, dass du das Falsche probiert hast.'
}

// Slot 5 - bridge sentence explaining what the surface aids actually
// do. Returns null when the user hasn't tried anything yet (the
// bridge would be redundant; the reframe carries on its own).
//
// The Beine variant deliberately credits compression for the
// blood-flow support it actually provides - more accurate AND less
// vulnerable to UWG §5 disparagement claims than the earlier draft
// that lumped it in with "wirkt nur auf der Haut".
export function getBridgeText(
  q1_lokalisation: string | null,
  q5_versucht: string[],
): string | null {
  if (realTriedCount(q5_versucht) === 0) return null
  if (q1_lokalisation === 'gesicht') {
    return 'Cremes, Make-up und kaschierende Pflege wirken auf der Haut — nicht auf die feinen Gefäße darunter, die die sichtbare Verfärbung verursachen. Für die Gefäße selbst gibt es eigene Verfahren in der Dermatologie.'
  }
  return 'Cremes, Kompressionsstrümpfe und Camouflage wirken auf der Haut oder unterstützen den Blutrückfluss — sie behandeln aber nicht die feinen Gefäße, die die sichtbare Verfärbung verursachen. Für die Gefäße selbst gibt es eigene Verfahren in der Phlebologie.'
}
