// Display strings for the quiz - kept separate from state so the
// reducer file stays small and the maps can be imported independently
// by the recommendation logic and the result page.

export const Q1_DISPLAY: Record<string, string> = {
  beine_unten: 'Beine — Waden, Knie, Knöchel',
  beine_oben: 'Beine — Oberschenkel/Innenseite',
  beine_mehrere: 'Mehrere Stellen am Bein',
  gesicht: 'Gesicht — Wangen, Nasenflügel, Kinn',
}

export const Q2_DISPLAY: Record<string, string> = {
  schon_immer: 'schon seit der Jugend',
  schwangerschaft: 'nach einer Schwangerschaft',
  wechseljahre: 'in den Wechseljahren',
  schleichend: 'schleichend mit den Jahren',
}

// Used inside the pivot interstitial sentence "Sie sind {{Q2_TEXT}}".
// Wording vetted for HWG-compliance + tone consistency with the other
// bullets - see src/lib/quizPivotTexts.ts for the full pivot spec.
export const Q2_PIVOT_TEXT: Record<string, string> = {
  schon_immer: 'schon seit deiner Jugend ein Thema',
  schwangerschaft: 'nach einer Schwangerschaft aufgetaucht',
  wechseljahre: 'in den Wechseljahren stärker geworden',
  schleichend: 'schleichend mit den Jahren entstanden',
}

export const Q3_DISPLAY: Record<string, string> = {
  fein: 'sehr fein (< 0,2 mm)',
  mittel: 'mittel (0,2–1 mm)',
  groesser: 'größer (> 1 mm)',
  flaechig: 'flächig / netzartig',
}

export const Q4_DISPLAY: Record<string, string> = {
  hell_mittel: 'hell bis mittel (Typ 1–3)',
  dunkler: 'dunkler / mediterran / POC (Typ 4–6)',
}

export const Q5_DISPLAY: Record<string, string> = {
  cremes: 'Cremes oder Gels',
  kompression: 'Kompressionsstrümpfe',
  camouflage: 'Camouflage / Make-up',
  selftanner: 'Bräunungssprays / Self-Tanner',
  hausmittel: 'Hausmittel (Apfelessig, Rosskastanie etc.)',
  verstecken: 'Unter Kleidung verstecken',
  nichts: 'Noch nichts probiert',
}

export const Q6_DISPLAY: Record<string, string> = {
  diesen_sommer: 'diesen Sommer',
  anlass: 'ein konkreter Anlass',
  kein_druck: 'kein Zeitdruck',
  naechster_sommer: 'nächster Sommer',
}

// Pivot bullet 3 - free-formed sentences (not "Bis ___ willst du was
// ändern" which produced ungrammatical results for kein_druck).
export const Q6_PIVOT_BULLET: Record<string, string> = {
  diesen_sommer: 'Du willst noch vor diesem Sommer Ergebnisse sehen',
  anlass: 'Du hast einen konkreten Anlass im Kopf',
  kein_druck: 'Du willst es angehen — ohne festen Zeitrahmen',
  naechster_sommer: 'Du gibst dir Zeit bis zum nächsten Sommer',
}

// Pivot forward-look (last sentence) - varies by Q1 because face
// teleangiectasias are dermatology / laser-medicine territory, not
// phlebology. Three beine_* values share the same text.
export const Q1_FORWARD_LOOK: Record<string, string> = {
  beine_unten: 'Auf der nächsten Seite siehst du, welche Methoden bei Befunden wie deinem in der Phlebologie eingesetzt werden — als Vorbereitung auf dein Erstgespräch.',
  beine_oben: 'Auf der nächsten Seite siehst du, welche Methoden bei Befunden wie deinem in der Phlebologie eingesetzt werden — als Vorbereitung auf dein Erstgespräch.',
  beine_mehrere: 'Auf der nächsten Seite siehst du, welche Methoden bei Befunden wie deinem in der Phlebologie eingesetzt werden — als Vorbereitung auf dein Erstgespräch.',
  gesicht: 'Auf der nächsten Seite siehst du, welche Verfahren bei feinen Gefäßen im Gesicht in der Dermatologie und Lasermedizin eingesetzt werden — als Vorbereitung auf dein Erstgespräch.',
}
