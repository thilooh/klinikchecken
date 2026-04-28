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

export const Q5_RECOGNITION_DISPLAY: Record<string, string> = {
  schwimmbad: '"Im Schwimmbad lege ich das Handtuch erst ab, wenn ich im Wasser bin."',
  lange_hosen: '"Im Sommer trage ich lieber lange Hosen als kurze."',
  fotos: '"Auf Fotos verstecke ich die Beine — Kleid bis zum Knöchel oder gar nicht hin."',
  stoert_aber_alltag: '"Mich stört es, aber im Alltag denke ich nicht ständig dran."',
}

export const Q6_DISPLAY: Record<string, string> = {
  cremes: 'Cremes oder Gels',
  kompression: 'Kompressionsstrümpfe',
  camouflage: 'Camouflage / Make-up',
  selftanner: 'Bräunungssprays / Self-Tanner',
  hausmittel: 'Hausmittel (Apfelessig, Rosskastanie etc.)',
  verstecken: 'Unter Kleidung verstecken',
  nichts: 'Noch nichts probiert',
}

export const Q7_VERMEIDUNG_DISPLAY: Record<string, string> = {
  voellig_zu: 'stimme völlig zu',
  eher_zu: 'stimme eher zu',
  eher_nicht: 'stimme eher nicht zu',
  gar_nicht: 'stimme gar nicht zu',
}

// Used in the pivot interstitial bullet "Du hast {{Q7_TEXT}}".
export const Q7_PIVOT_TEXT: Record<string, string> = {
  voellig_zu: 'wegen deiner Beine schon Dinge vermieden',
  eher_zu: 'wegen deiner Beine schon mal etwas vermieden',
  eher_nicht: 'dich davon im Alltag noch nicht stark einschränken lassen',
  gar_nicht: 'es im Alltag nicht ständig im Kopf',
}

export const Q8_DISPLAY: Record<string, string> = {
  diesen_sommer: 'diesen Sommer',
  anlass: 'ein konkreter Anlass',
  kein_druck: 'kein Zeitdruck',
  naechster_sommer: 'nächster Sommer',
}
