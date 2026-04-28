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
export const Q2_PIVOT_TEXT: Record<string, string> = {
  schon_immer: 'schon seit deiner Jugend da',
  schwangerschaft: 'nach einer Schwangerschaft aufgetaucht',
  wechseljahre: 'in den Wechseljahren gekommen',
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

export const Q6_PIVOT_TEXT: Record<string, string> = {
  diesen_sommer: 'diesem Sommer',
  anlass: 'deinem Anlass',
  kein_druck: 'irgendwann ohne Druck',
  naechster_sommer: 'dem nächsten Sommer',
}
