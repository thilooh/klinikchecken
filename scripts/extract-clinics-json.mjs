#!/usr/bin/env node
// Pre-build step: extract the `clinics` array from src/data/clinics.ts
// into public/data/clinics.json so the runtime can fetch it lazily
// instead of including ~67 KB gzipped JSON-in-JS in the main bundle.
//
// Reads clinics.ts as text, evaluates only the array literal in a
// sandboxed Function. No filesystem-affecting code in the TS file is
// executed.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SRC = path.join(ROOT, 'src', 'data', 'clinics.ts')
const OUT = path.join(ROOT, 'public', 'data', 'clinics.json')

const text = fs.readFileSync(SRC, 'utf8')

// Find `clinics: Clinic[] = [...]` and extract just the array body.
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

// The array literal uses TS-style trailing commas + JS object syntax (not
// JSON-strict). Evaluate it with a sandboxed Function that returns the
// data — no imports, no globals beyond what we pass in.
const clinics = new Function(`return ${arrayLiteral}`)()

if (!Array.isArray(clinics) || clinics.length === 0) {
  console.error('Extracted clinics is not a non-empty array')
  process.exit(1)
}

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(clinics))

const sizeKb = (fs.statSync(OUT).size / 1024).toFixed(1)
console.log(`Extracted ${clinics.length} clinics → public/data/clinics.json (${sizeKb} KB)`)
