#!/usr/bin/env node
// Fetch the first Google Place photo for each clinic that currently has
// a placeholder SVG logo, save it as logo.jpg, and update clinics.ts.
//
// Run:
//   GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-clinic-photos.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CLINICS_TS = path.join(ROOT, 'src', 'data', 'clinics.ts')
const IMAGES = path.join(ROOT, 'public', 'images')

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY
if (!GOOGLE_KEY) { console.error('Missing GOOGLE_PLACES_API_KEY'); process.exit(1) }

// ─── Parse clinics.ts ────────────────────────────────────────────────────────

function parseClinics(source) {
  const startMarker = 'clinics: Clinic[] = ['
  const startIdx = source.indexOf(startMarker)
  let i = startIdx + startMarker.length, depth = 0, blockStart = -1
  const blocks = []
  while (i < source.length) {
    const c = source[i]
    if (c === '{') { if (depth === 0) blockStart = i; depth++ }
    else if (c === '}') {
      depth--
      if (depth === 0 && blockStart >= 0) {
        const text = source.slice(blockStart, i + 1)
        blocks.push({
          id: Number(text.match(/\bid:\s*(\d+)/)?.[1]),
          name: text.match(/\bname:\s*'((?:\\'|[^'])*)'/)?.[1],
          city: text.match(/\bcity:\s*'((?:\\'|[^'])*)'/)?.[1],
          placeId: text.match(/\bplaceId:\s*'((?:\\'|[^'])*)'/)?.[1] ?? '',
          logo: text.match(/\blogo:\s*'((?:\\'|[^'])*)'/)?.[1] ?? '',
          start: blockStart,
          end: i + 1,
        })
        blockStart = -1
      }
    } else if (c === ']' && depth === 0) break
    i++
  }
  return blocks
}

async function placePhotos(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'photos')
  url.searchParams.set('key', GOOGLE_KEY)
  const r = await fetch(url.toString())
  const d = await r.json()
  if (d.status !== 'OK') throw new Error(`Details: ${d.status}`)
  return d.result?.photos ?? []
}

async function downloadPhoto(photoRef, outFile) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo')
  url.searchParams.set('maxwidth', '800')
  url.searchParams.set('photo_reference', photoRef)
  url.searchParams.set('key', GOOGLE_KEY)
  const r = await fetch(url.toString(), { redirect: 'follow' })
  if (!r.ok) throw new Error(`Photo HTTP ${r.status}`)
  const buf = Buffer.from(await r.arrayBuffer())
  fs.writeFileSync(outFile, buf)
  return buf.length
}

// ─── Main ────────────────────────────────────────────────────────────────────

let source = fs.readFileSync(CLINICS_TS, 'utf8')
const clinics = parseClinics(source)

const targets = clinics.filter(c => c.placeId && c.logo.endsWith('.svg'))
console.log(`Found ${targets.length} clinics with SVG placeholder logos.\n`)

const patches = []
for (const c of targets) {
  process.stdout.write(`  [${c.city}] ${c.name.slice(0, 50)} ... `)
  try {
    const photos = await placePhotos(c.placeId)
    if (!photos.length) { console.log('no photos'); continue }
    const dir = path.join(IMAGES, `clinic-${c.id}`)
    fs.mkdirSync(dir, { recursive: true })
    const outFile = path.join(dir, 'logo.jpg')
    const bytes = await downloadPhoto(photos[0].photo_reference, outFile)
    console.log(`✓ ${(bytes/1024).toFixed(1)} KB`)
    patches.push({ id: c.id, oldLogo: c.logo, newLogo: `/images/clinic-${c.id}/logo.jpg` })
    await new Promise(r => setTimeout(r, 150))
  } catch (e) {
    console.log(`✗ ${e.message}`)
  }
}

// Patch clinics.ts (descending order to keep offsets stable)
patches.sort((a, b) => b.id - a.id)
for (const p of patches) {
  const blocks = parseClinics(source)
  const block = blocks.find(b => b.id === p.id)
  if (!block) continue
  const oldText = source.slice(block.start, block.end)
  const updated = oldText.replace(
    new RegExp(`logo: '${p.oldLogo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`),
    `logo: '${p.newLogo}'`
  )
  if (updated !== oldText) {
    source = source.slice(0, block.start) + updated + source.slice(block.end)
  }
}
fs.writeFileSync(CLINICS_TS, source)
console.log(`\nPatched ${patches.length} logos in clinics.ts`)

// Cleanup: delete the now-unused SVG files
for (const p of patches) {
  const svgPath = path.join(ROOT, 'public', p.oldLogo.replace(/^\//, ''))
  try { fs.unlinkSync(svgPath); console.log(`  removed ${p.oldLogo}`) } catch { /* ok */ }
}
