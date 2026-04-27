#!/usr/bin/env node
// Run: node scripts/refresh-reviews.mjs
// Env: GOOGLE_PLACES_API_KEY, ANTHROPIC_API_KEY

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '..', 'public', 'reviews')

const GOOGLE_KEY = process.env.GOOGLE_PLACES_API_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!GOOGLE_KEY) { console.error('Missing GOOGLE_PLACES_API_KEY'); process.exit(1) }
if (!ANTHROPIC_KEY) { console.error('Missing ANTHROPIC_API_KEY'); process.exit(1) }

const CLINICS = [
  { id: 'ChIJ77UO7K8lv0cRFQXzvxhCfeg', name: 'Dermatologie am Dom – Dr. Hundgeburth & Kollegen' },
  { id: 'ChIJnX4erq8lv0cRgS7GNvNWuYk', name: 'Hautarztpraxis Dr. Stephanie Rösing' },
  { id: 'ChIJX9ZcEQElv0cRNol9fcxuDvI', name: 'MVZ Gefäßzentrum am Rudolfplatz' },
  { id: 'ChIJs0y27B0lv0cRanz1EUCp5nI', name: 'Hautarztpraxis Dr. Kruppa & Dr. Larsen' },
  { id: 'ChIJEczfE70lv0cRvWaW_r31jPI', name: 'Be esthetic – Dr. Babak J. Esfahani' },
  { id: 'ChIJBxF7Yqwmv0cRHrktSpvsNh4', name: 'Dermatologikum Köln – PD Dr. Philipp-Dormston' },
  { id: 'ChIJYVCTVzzKuEcRn4fFkzAPgAo', name: 'Dr. Hilton & Partner – Medical Skin Center' },
  { id: 'ChIJq9LAvSvLuEcRB4FbkwYjE2E', name: 'Gefäßpraxis Dr. Kusenack – Phlebologie Königsallee' },
  { id: 'ChIJXzKEgiDKuEcRYyGdp6djiEo', name: 'Hautarztpraxis Funk, Humke & Herrmann' },
  { id: 'ChIJZ_yZefHJuEcRLC4hOHKqJug', name: 'Haut & Laser Praxis PD Dr. Fritsch' },
]

async function fetchPlaceDetails(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'reviews,rating,user_ratings_total,name')
  url.searchParams.set('language', 'de')
  url.searchParams.set('reviews_sort', 'newest')
  url.searchParams.set('key', GOOGLE_KEY)

  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.status !== 'OK') throw new Error(`Places API: ${data.status}`)
  return data.result
}

async function generateSummary(reviews, clinicName) {
  if (!reviews || reviews.length === 0) return []

  const reviewTexts = reviews
    .filter(r => r.text && r.text.trim())
    .map(r => `${r.rating}★ – ${r.text.trim()}`)
    .join('\n\n')

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
        content: `Du analysierst Google-Bewertungen einer Arztpraxis für eine Vergleichsplattform.

Praxis: ${clinicName}

Bewertungen:
${reviewTexts}

Erstelle genau 3 kurze Bullet Points auf Deutsch (je max. 12 Wörter), die zusammenfassen was Patienten häufig erwähnen - positiv wie negativ. Schreib nur ein JSON-Array mit 3 Strings, sonst nichts.

Beispiel-Format: ["Punkt eins", "Punkt zwei", "Punkt drei"]`,
      }],
    }),
  })

  const data = await res.json()
  const text = data.content?.[0]?.text ?? '[]'
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed.slice(0, 3) : []
  } catch {
    // Claude sometimes wraps in markdown code fences
    const match = text.match(/\[[\s\S]*\]/)
    if (match) {
      try { return JSON.parse(match[0]).slice(0, 3) } catch { /* fall through */ }
    }
    return []
  }
}

async function refreshClinic(clinic) {
  process.stdout.write(`  ${clinic.name} … `)
  try {
    const result = await fetchPlaceDetails(clinic.id)
    const reviews = result.reviews ?? []
    const summary = await generateSummary(reviews, clinic.name)

    const existing = (() => {
      try { return JSON.parse(fs.readFileSync(path.join(OUT_DIR, `${clinic.id}.json`), 'utf8')) } catch { return null }
    })()

    // Merge: keep reviews not already present (by author + date)
    const existingKeys = new Set((existing?.reviews ?? []).map(r => `${r.author_name}|${r.relative_time_description}`))
    const newReviews = reviews.filter(r => !existingKeys.has(`${r.author_name}|${r.relative_time_description}`))
    const allReviews = [...(existing?.reviews ?? []), ...newReviews]
      .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))

    const hasChanges = newReviews.length > 0 || !existing

    const payload = {
      reviews: allReviews,
      rating: result.rating ?? existing?.rating,
      reviewCount: result.user_ratings_total ?? existing?.reviewCount,
      summary: summary.length > 0 ? summary : (existing?.summary ?? []),
      lastUpdated: new Date().toISOString(),
    }

    fs.writeFileSync(path.join(OUT_DIR, `${clinic.id}.json`), JSON.stringify(payload, null, 2))
    console.log(hasChanges ? `✓ (${newReviews.length} neu)` : '✓ (keine Änderungen)')
    return hasChanges
  } catch (err) {
    console.log(`✗ ${err.message}`)
    return false
  }
}

fs.mkdirSync(OUT_DIR, { recursive: true })

console.log('Refreshing reviews…\n')
const results = await Promise.allSettled(CLINICS.map(refreshClinic))
const changed = results.filter(r => r.status === 'fulfilled' && r.value).length
console.log(`\nDone. ${changed}/${CLINICS.length} clinics updated.`)
