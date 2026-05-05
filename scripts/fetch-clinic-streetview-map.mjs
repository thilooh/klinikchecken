#!/usr/bin/env node
// Fetch Google Streetview + Static Map images for clinics that have a
// placeId + lat/lng but lack streetview/map in their `media` field.
//
// Note: requires both `Street View Static API` and `Maps Static API`
// enabled on the API key's Google Cloud project.
//
// Saves to public/images/clinic-<id>/streetview.jpg and map.png and
// patches the clinic's `media` block in src/data/clinics.ts in place.
//
// Idempotent: skips clinics whose streetview AND map already point at
// existing files on disk.
//
// Run:
//   GOOGLE_PLACES_API_KEY=xxx node scripts/fetch-clinic-streetview-map.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CLINICS_TS = path.join(ROOT, 'src', 'data', 'clinics.ts')
const IMAGES = path.join(ROOT, 'public', 'images')
const PUBLIC = path.join(ROOT, 'public')

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
        const mediaMatch = text.match(/media:\s*\{([^}]*)\}/)
        const mediaText = mediaMatch?.[1] ?? ''
        blocks.push({
          id: Number(text.match(/\bid:\s*(\d+)/)?.[1]),
          name: text.match(/\bname:\s*'((?:\\'|[^'])*)'/)?.[1],
          city: text.match(/\bcity:\s*'((?:\\'|[^'])*)'/)?.[1],
          placeId: text.match(/\bplaceId:\s*'((?:\\'|[^'])*)'/)?.[1] ?? '',
          lat: Number(text.match(/\blat:\s*([\d.-]+)/)?.[1]),
          lng: Number(text.match(/\blng:\s*([\d.-]+)/)?.[1]),
          streetview: mediaText.match(/streetview:\s*'((?:\\'|[^'])*)'/)?.[1] ?? '',
          map: mediaText.match(/\bmap:\s*'((?:\\'|[^'])*)'/)?.[1] ?? '',
          hasMedia: !!mediaMatch,
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

// ─── Google APIs ─────────────────────────────────────────────────────────────

async function streetviewAvailable(lat, lng, radius = 50) {
  const url = new URL('https://maps.googleapis.com/maps/api/streetview/metadata')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', String(radius))
  url.searchParams.set('source', 'outdoor')
  url.searchParams.set('key', GOOGLE_KEY)
  const r = await fetch(url.toString())
  const d = await r.json()
  return d.status === 'OK'
}

async function fetchStreetview(lat, lng, radius = 50) {
  const url = new URL('https://maps.googleapis.com/maps/api/streetview')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', String(radius))
  url.searchParams.set('source', 'outdoor')
  url.searchParams.set('size', '800x500')
  url.searchParams.set('fov', '80')
  url.searchParams.set('pitch', '0')
  url.searchParams.set('key', GOOGLE_KEY)
  const r = await fetch(url.toString())
  if (!r.ok) return null
  return Buffer.from(await r.arrayBuffer())
}

async function fetchStaticMap(lat, lng) {
  const url = new URL('https://maps.googleapis.com/maps/api/staticmap')
  url.searchParams.set('center', `${lat},${lng}`)
  url.searchParams.set('zoom', '15')
  url.searchParams.set('size', '600x400')
  url.searchParams.set('maptype', 'roadmap')
  url.searchParams.set('markers', `color:0x003399|${lat},${lng}`)
  url.searchParams.set('language', 'de')
  url.searchParams.set('key', GOOGLE_KEY)
  const r = await fetch(url.toString())
  if (!r.ok) {
    const body = await r.text().catch(() => '')
    console.error(`    [staticmap HTTP ${r.status}] ${body.slice(0, 240)}`)
    return null
  }
  const ct = r.headers.get('content-type') ?? ''
  const buf = Buffer.from(await r.arrayBuffer())
  if (!ct.startsWith('image/')) {
    console.error(`    [staticmap unexpected content-type ${ct}] ${buf.slice(0, 240).toString('utf8')}`)
    return null
  }
  return buf
}

// ─── File helpers ────────────────────────────────────────────────────────────

function fileExistsForRef(ref) {
  if (!ref) return false
  return fs.existsSync(path.join(PUBLIC, ref.replace(/^\//, '')))
}

// ─── Main ────────────────────────────────────────────────────────────────────

let source = fs.readFileSync(CLINICS_TS, 'utf8')
const clinics = parseClinics(source)

const targets = clinics.filter(c =>
  c.placeId &&
  Number.isFinite(c.lat) && Number.isFinite(c.lng) &&
  (!fileExistsForRef(c.streetview) || !fileExistsForRef(c.map))
)

console.log(`Found ${targets.length} clinics needing streetview and/or map.\n`)

const patches = []
for (const c of targets) {
  const dir = path.join(IMAGES, `clinic-${c.id}`)
  fs.mkdirSync(dir, { recursive: true })
  const updates = {}

  // ── Streetview ─────────────────────────────────────────────────────────────
  if (!fileExistsForRef(c.streetview)) {
    process.stdout.write(`  [${c.city}] ${c.name.slice(0, 40)} streetview ... `)
    try {
      let ok = await streetviewAvailable(c.lat, c.lng, 50)
      if (!ok) ok = await streetviewAvailable(c.lat, c.lng, 200)
      if (!ok) {
        console.log('✗ no street view imagery')
      } else {
        const buf = await fetchStreetview(c.lat, c.lng, 200)
        if (buf && buf.length > 5000) {
          const out = path.join(dir, 'streetview.jpg')
          fs.writeFileSync(out, buf)
          updates.streetview = `/images/clinic-${c.id}/streetview.jpg`
          console.log(`✓ ${(buf.length / 1024).toFixed(1)} KB`)
        } else {
          console.log('✗ download too small or failed')
        }
      }
      await new Promise(r => setTimeout(r, 200))
    } catch (e) {
      console.log(`✗ ${e.message}`)
    }
  }

  // ── Static Map ─────────────────────────────────────────────────────────────
  if (!fileExistsForRef(c.map)) {
    process.stdout.write(`  [${c.city}] ${c.name.slice(0, 40)} staticmap  ... `)
    try {
      const buf = await fetchStaticMap(c.lat, c.lng)
      if (buf && buf.length > 2000) {
        const out = path.join(dir, 'map.png')
        fs.writeFileSync(out, buf)
        updates.map = `/images/clinic-${c.id}/map.png`
        console.log(`✓ ${(buf.length / 1024).toFixed(1)} KB`)
      } else {
        console.log('✗ download too small or failed')
      }
      await new Promise(r => setTimeout(r, 200))
    } catch (e) {
      console.log(`✗ ${e.message}`)
    }
  }

  if (Object.keys(updates).length > 0) {
    patches.push({ id: c.id, hasMedia: c.hasMedia, ...updates })
  }
}

// ─── Patch clinics.ts ────────────────────────────────────────────────────────

if (patches.length === 0) {
  console.log('\nNo files added; clinics.ts unchanged.')
  process.exit(0)
}

// Build patches in descending order so byte offsets stay valid as we splice.
patches.sort((a, b) => b.id - a.id)

for (const p of patches) {
  const blocks = parseClinics(source)
  const block = blocks.find(b => b.id === p.id)
  if (!block) continue
  let blockText = source.slice(block.start, block.end)

  // Build the set of fields we need in the media object.
  // Preserve any existing logo path; add/replace streetview and map.
  const mediaMatch = blockText.match(/media:\s*\{([^}]*)\}/)
  if (mediaMatch) {
    let mediaInner = mediaMatch[1]

    function upsertField(name, value) {
      const re = new RegExp(`(${name}:\\s*'[^']*')`)
      if (re.test(mediaInner)) {
        mediaInner = mediaInner.replace(re, `${name}: '${value}'`)
      } else {
        mediaInner = mediaInner.trim()
        if (mediaInner && !mediaInner.endsWith(',')) mediaInner += ','
        mediaInner += ` ${name}: '${value}'`
      }
    }
    if (p.streetview) upsertField('streetview', p.streetview)
    if (p.map) upsertField('map', p.map)
    blockText = blockText.replace(mediaMatch[0], `media: { ${mediaInner.trim()} }`)
  } else {
    // No media block at all - insert one before `treatmentInfo:` if present,
    // otherwise before the closing brace of the object.
    const fields = []
    if (p.streetview) fields.push(`streetview: '${p.streetview}'`)
    if (p.map) fields.push(`map: '${p.map}'`)
    const newMedia = `    media: { ${fields.join(', ')} },\n`
    if (/\btreatmentInfo:/.test(blockText)) {
      blockText = blockText.replace(/(\s*treatmentInfo:)/, `\n${newMedia}$1`)
    } else {
      blockText = blockText.replace(/(\s*\}\s*)$/, `\n${newMedia}$1`)
    }
  }

  source = source.slice(0, block.start) + blockText + source.slice(block.end)
}

fs.writeFileSync(CLINICS_TS, source)
console.log(`\nPatched ${patches.length} clinics with new streetview/map paths.`)
