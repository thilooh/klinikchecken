#!/usr/bin/env node
// Pre-build step: extract the `clinics` array from src/data/clinics.ts
// into two JSON files:
//
//   public/data/clinics.json     - lightweight list payload (cards,
//                                  filters, sort) fetched on every
//                                  page load.
//   public/data/treatments.json  - heavy treatmentInfo prose fetched
//                                  on demand when the user opens the
//                                  ClinicProfileModal or hits a
//                                  /praxis/:slug page.
//
// Splitting these two cuts the always-loaded payload roughly in half
// (treatmentInfo was ~54% of the original clinics.json). The list
// JSON also drops fields that aren't used on the cards (tags - dead
// field everywhere; distanceKm - overwritten at runtime; foundedYear
// - not displayed) and trims lat/lng to four decimals (~11 m).

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'src', 'data', 'clinics.ts')
const OUT_LIST = path.join(ROOT, 'public', 'data', 'clinics.json')
const OUT_TREATMENTS = path.join(ROOT, 'public', 'data', 'treatments.json')

const text = fs.readFileSync(SRC, 'utf8')

const startMarker = 'clinics: Clinic[] = '
const startIdx = text.indexOf(startMarker)
if (startIdx < 0) { console.error('Could not find clinics array in clinics.ts'); process.exit(1) }
let i = startIdx + startMarker.length, depth = 0, arrayStart = -1
while (i < text.length) {
  if (text[i] === '[') { if (depth === 0) arrayStart = i; depth++ }
  else if (text[i] === ']') { depth--; if (depth === 0) break }
  i++
}
if (arrayStart < 0) { console.error('Failed to parse clinics array boundaries'); process.exit(1) }

const arrayLiteral = text.slice(arrayStart, i + 1)
const clinics = new Function(`return ${arrayLiteral}`)()
if (!Array.isArray(clinics) || clinics.length === 0) {
  console.error('Extracted clinics is not a non-empty array')
  process.exit(1)
}

const round = (n, d = 4) => typeof n === 'number'
  ? Math.round(n * 10 ** d) / 10 ** d
  : n

// Split each clinic into a list entry (everything but treatmentInfo,
// minus dead fields) and a treatments entry (id + treatmentInfo).
const list = []
const treatments = []
for (const c of clinics) {
  const { treatmentInfo, tags, distanceKm, foundedYear, ...rest } = c
  // tags: not referenced in the source code anywhere (dead field).
  // distanceKm: always overwritten at runtime by useFilteredClinics.
  // foundedYear: never rendered.
  void tags; void distanceKm; void foundedYear
  list.push({
    ...rest,
    lat: round(rest.lat),
    lng: round(rest.lng),
  })
  if (treatmentInfo) {
    treatments.push({ id: c.id, treatmentInfo })
  }
}

fs.mkdirSync(path.dirname(OUT_LIST), { recursive: true })
fs.writeFileSync(OUT_LIST, JSON.stringify(list))
fs.writeFileSync(OUT_TREATMENTS, JSON.stringify(treatments))

const listKb = (fs.statSync(OUT_LIST).size / 1024).toFixed(1)
const tKb = (fs.statSync(OUT_TREATMENTS).size / 1024).toFixed(1)
console.log(`Extracted ${list.length} clinics → public/data/clinics.json (${listKb} KB)`)
console.log(`Extracted ${treatments.length} treatment entries → public/data/treatments.json (${tKb} KB)`)
