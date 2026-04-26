#!/usr/bin/env node
// Auto-resolve missing placeIds for all clinics in src/data/clinics.ts
// and refresh review JSON files in public/reviews/.
//
// Run:
//   GOOGLE_PLACES_API_KEY=xxx ANTHROPIC_API_KEY=yyy node scripts/sync-google-data.mjs
//
// What it does:
//   1. Parses src/data/clinics.ts and lists every clinic block.
//   2. For clinics with empty placeId, calls Places Text Search (name + address)
//      to resolve a placeId, then patches clinics.ts in place.
//   3. For every clinic with a placeId, fetches the Place Details (rating,
//      reviews, total ratings) and writes public/reviews/<placeId>.json.
//      Existing reviews are merged (no dedup loss) and a 3-bullet AI summary
//      is regenerated via the Anthropic API.
//
// Skip flags:
//   --resolve-only   Only resolve missing placeIds, skip review fetching.
//   --reviews-only   Only refresh review JSONs, skip placeId resolution.
//   --dry            Print what would change, don't write files.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CLINICS_TS = path.join(ROOT, 'src', 'data', 'clinics.ts')
const OUT_DIR = path.join(ROOT, 'public', 'reviews')

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry')
const resolveOnly = args.has('--resolve-only')
const reviewsOnly = args.has('--reviews-only')

if (!GOOGLE_KEY) {
  console.error('Missing GOOGLE_PLACES_API_KEY env var')
  process.exit(1)
}
if (!ANTHROPIC_KEY && !resolveOnly) {
  console.error('Missing ANTHROPIC_API_KEY env var (or pass --resolve-only)')
  process.exit(1)
}

// ─── Parse clinics.ts ────────────────────────────────────────────────────────

function parseClinics(source) {
  const startMarker = 'clinics: Clinic[] = ['
  const startIdx = source.indexOf(startMarker)
  if (startIdx < 0) throw new Error('clinics array not found')
  let i = startIdx + startMarker.length
  const blocks = []
  let depth = 0
  let blockStart = -1
  while (i < source.length) {
    const ch = source[i]
    if (ch === '{') {
      if (depth === 0) blockStart = i
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && blockStart >= 0) {
        const text = source.slice(blockStart, i + 1)
        const id = Number(text.match(/\bid:\s*(\d+)/)?.[1])
        const name = text.match(/\bname:\s*'((?:\\'|[^'])*)'/)?.[1]
        const city = text.match(/\bcity:\s*'((?:\\'|[^'])*)'/)?.[1]
        const address = text.match(/\baddress:\s*'((?:\\'|[^'])*)'/)?.[1]
        const placeId = text.match(/\bplaceId:\s*'((?:\\'|[^'])*)'/)?.[1]
        const rating = text.match(/\bgoogleRating:\s*([\d.]+)/)?.[1]
        const reviewCount = text.match(/\bgoogleReviewCount:\s*(\d+)/)?.[1]
        blocks.push({
          id, name, city, address,
          placeId: placeId ?? '',
          googleRating: rating ? Number(rating) : null,
          googleReviewCount: reviewCount ? Number(reviewCount) : null,
          start: blockStart,
          end: i + 1,
        })
        blockStart = -1
      }
    } else if (ch === ']' && depth === 0) {
      break
    }
    i++
  }
  return blocks
}

// ─── Google Places ───────────────────────────────────────────────────────────

async function placesTextSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  url.searchParams.set('query', query)
  url.searchParams.set('region', 'de')
  url.searchParams.set('language', 'de')
  url.searchParams.set('key', GOOGLE_KEY)
  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.status === 'ZERO_RESULTS') return null
  if (data.status !== 'OK') throw new Error(`TextSearch: ${data.status} – ${data.error_message ?? ''}`)
  return data.results?.[0] ?? null
}

async function placeDetails(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'reviews,rating,user_ratings_total,name')
  url.searchParams.set('language', 'de')
  url.searchParams.set('reviews_sort', 'newest')
  url.searchParams.set('key', GOOGLE_KEY)
  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`Details: ${data.status}`)
  return data.result
}

// ─── Anthropic summary ───────────────────────────────────────────────────────

async function generateSummary(reviews, clinicName) {
  if (!ANTHROPIC_KEY) return []
  if (!reviews?.length) return []
  const reviewTexts = reviews
    .filter(r => r.text?.trim())
    .map(r => `${r.rating}★ – ${r.text.trim()}`)
    .join('\n\n')
  if (!reviewTexts) return []
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Du analysierst Google-Bewertungen einer Arztpraxis fuer eine Vergleichsplattform.\n\nPraxis: ${clinicName}\n\nBewertungen:\n${reviewTexts}\n\nErstelle genau 3 kurze Bullet Points auf Deutsch (je max. 12 Woerter), die zusammenfassen was Patienten haeufig erwaehnen — positiv wie negativ. Schreib nur ein JSON-Array mit 3 Strings, sonst nichts.\n\nBeispiel-Format: ["Punkt eins", "Punkt zwei", "Punkt drei"]`,
      }],
    }),
  })
  const data = await res.json()
  const text = data.content?.[0]?.text ?? '[]'
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed.slice(0, 3) : []
  } catch {
    const match = text.match(/\[[\s\S]*\]/)
    if (match) { try { return JSON.parse(match[0]).slice(0, 3) } catch { /* */ } }
    return []
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

let source = fs.readFileSync(CLINICS_TS, 'utf8')
let clinics = parseClinics(source)
console.log(`Parsed ${clinics.length} clinics from ${path.relative(ROOT, CLINICS_TS)}`)

// 1. Resolve missing placeIds
if (!reviewsOnly) {
  const missing = clinics.filter(c => !c.placeId)
  console.log(`\nResolving placeIds for ${missing.length} clinics with empty placeId...\n`)
  const patches = []
  for (const c of missing) {
    const query = `${c.name} ${c.address ?? c.city}`
    process.stdout.write(`  [${c.city}] ${c.name.slice(0, 60)} ... `)
    try {
      const result = await placesTextSearch(query)
      if (!result?.place_id) {
        console.log('NOT FOUND')
        continue
      }
      console.log(`✓ ${result.place_id}`)
      patches.push({ id: c.id, placeId: result.place_id, rating: result.rating, total: result.user_ratings_total })
      await new Promise(r => setTimeout(r, 100))
    } catch (e) {
      console.log(`✗ ${e.message}`)
    }
  }

  if (patches.length > 0 && !dryRun) {
    // Re-parse against fresh source on each patch to keep offsets correct.
    for (const p of patches) {
      const blocks = parseClinics(source)
      const block = blocks.find(b => b.id === p.id)
      if (!block) continue
      const blockText = source.slice(block.start, block.end)
      const updated = blockText.replace(/placeId:\s*''/, `placeId: '${p.placeId}'`)
      source = source.slice(0, block.start) + updated + source.slice(block.end)
    }
    fs.writeFileSync(CLINICS_TS, source)
    console.log(`\nPatched ${patches.length} placeIds in clinics.ts`)
    clinics = parseClinics(source)
  } else if (patches.length > 0 && dryRun) {
    console.log(`\n[dry] Would patch ${patches.length} placeIds`)
  }
}

// 2. Refresh review JSONs
if (!resolveOnly) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const withPid = clinics.filter(c => c.placeId)
  console.log(`\nRefreshing review JSON for ${withPid.length} clinics...\n`)
  let okCount = 0, skipCount = 0
  for (const c of withPid) {
    const file = path.join(OUT_DIR, `${c.placeId}.json`)
    process.stdout.write(`  [${c.city}] ${c.name.slice(0, 50)} ... `)
    try {
      const detail = await placeDetails(c.placeId)
      const reviews = detail.reviews ?? []
      const existing = (() => { try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null } })()
      const existingKeys = new Set((existing?.reviews ?? []).map(r => `${r.author_name}|${r.relative_time_description}`))
      const merged = [
        ...(existing?.reviews ?? []),
        ...reviews.filter(r => !existingKeys.has(`${r.author_name}|${r.relative_time_description}`)),
      ].sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
      const summary = await generateSummary(reviews, c.name)
      const payload = {
        reviews: merged,
        rating: detail.rating ?? existing?.rating,
        reviewCount: detail.user_ratings_total ?? existing?.reviewCount,
        summary: summary.length > 0 ? summary : (existing?.summary ?? []),
        lastUpdated: new Date().toISOString(),
      }
      if (!dryRun) fs.writeFileSync(file, JSON.stringify(payload, null, 2))
      console.log(`✓ ${merged.length} reviews`)
      okCount++
      await new Promise(r => setTimeout(r, 150))
    } catch (e) {
      console.log(`✗ ${e.message}`)
      skipCount++
    }
  }
  console.log(`\nDone. ${okCount} updated, ${skipCount} skipped.`)
}

console.log('\nFinished.')
