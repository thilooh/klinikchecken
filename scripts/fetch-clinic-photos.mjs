#!/usr/bin/env node
// Fetch the best available logo for each clinic that currently has a
// placeholder SVG logo. Tries multiple sources in order:
//
//   1. Practice website (from Place Details `website` field):
//        a) <link rel="apple-touch-icon">  (highest quality, often 180×180)
//        b) og:image meta tag
//        c) <img> with class/id/src containing "logo"
//        d) /apple-touch-icon.png at the domain root
//        e) /favicon.ico
//   2. Google Place Photos API (first venue photo)
//
// Saves to public/images/clinic-<id>/logo.<ext>, patches clinics.ts,
// removes the unused SVG placeholder.
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

const UA = 'Mozilla/5.0 (compatible; klinikchecken-logo-fetcher/1.0)'
const TIMEOUT = 12000  // ms per HTTP request

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

// ─── HTTP helpers ────────────────────────────────────────────────────────────

async function fetchText(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: ctrl.signal })
    if (!r.ok) return null
    return await r.text()
  } catch { return null } finally { clearTimeout(t) }
}

async function fetchBinary(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: ctrl.signal })
    if (!r.ok) return null
    const buf = Buffer.from(await r.arrayBuffer())
    const ct = r.headers.get('content-type') ?? ''
    return { buf, contentType: ct, finalUrl: r.url }
  } catch { return null } finally { clearTimeout(t) }
}

function extFromContentType(ct) {
  if (ct.includes('image/png')) return 'png'
  if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return 'jpg'
  if (ct.includes('image/webp')) return 'webp'
  if (ct.includes('image/svg')) return 'svg'
  if (ct.includes('image/x-icon') || ct.includes('image/vnd.microsoft.icon')) return 'ico'
  return null
}

function isImageBuffer(buf) {
  if (!buf || buf.length < 8) return false
  // PNG, JPEG, WebP, GIF, ICO, SVG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E) return 'png'
  if (buf[0] === 0xFF && buf[1] === 0xD8) return 'jpg'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[8] === 0x57) return 'webp'
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'gif'
  if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return 'ico'
  const head = buf.slice(0, 200).toString('utf8').trim().toLowerCase()
  if (head.startsWith('<svg') || head.startsWith('<?xml')) return 'svg'
  return false
}

function absolutize(url, base) {
  try { return new URL(url, base).toString() } catch { return null }
}

// ─── Logo extraction from website HTML ───────────────────────────────────────

function extractLogoCandidates(html, baseUrl) {
  const candidates = []

  const linkRe = /<link\s+[^>]*rel=["']([^"']+)["'][^>]*>/gi
  let m
  while ((m = linkRe.exec(html)) !== null) {
    const tag = m[0]
    const rel = m[1].toLowerCase()
    const hrefM = tag.match(/href=["']([^"']+)["']/i)
    const sizesM = tag.match(/sizes=["']([^"']+)["']/i)
    if (!hrefM) continue
    const href = absolutize(hrefM[1], baseUrl)
    if (!href) continue
    const size = sizesM ? parseInt(sizesM[1].split('x')[0]) || 0 : 0
    if (rel.includes('apple-touch-icon')) candidates.push({ url: href, score: 90 + size, kind: 'apple-touch' })
    else if (rel.includes('icon')) candidates.push({ url: href, score: 30 + size, kind: 'icon' })
  }

  const ogM = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
  if (ogM) {
    const u = absolutize(ogM[1], baseUrl)
    if (u) candidates.push({ url: u, score: 70, kind: 'og:image' })
  }

  const imgRe = /<img\s+[^>]*>/gi
  while ((m = imgRe.exec(html)) !== null) {
    const tag = m[0]
    const srcM = tag.match(/src=["']([^"']+)["']/i)
    if (!srcM) continue
    const src = srcM[1]
    const tagL = tag.toLowerCase()
    if (/\blogo\b/.test(tagL) || /\blogo\b/.test(src.toLowerCase())) {
      const u = absolutize(src, baseUrl)
      if (u) candidates.push({ url: u, score: 60, kind: 'img-logo' })
    }
  }

  candidates.push({ url: absolutize('/apple-touch-icon.png', baseUrl), score: 50, kind: 'apple-touch-fallback' })
  candidates.push({ url: absolutize('/favicon.ico', baseUrl), score: 10, kind: 'favicon' })

  candidates.sort((a, b) => b.score - a.score)
  const seen = new Set()
  return candidates.filter(c => c.url && !seen.has(c.url) && (seen.add(c.url), true))
}

// ─── Google Place APIs ───────────────────────────────────────────────────────

async function placeDetails(placeId, fields) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', fields)
  url.searchParams.set('key', GOOGLE_KEY)
  const r = await fetch(url.toString())
  const d = await r.json()
  if (d.status !== 'OK') return null
  return d.result ?? null
}

async function fetchPlacePhoto(photoRef) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo')
  url.searchParams.set('maxwidth', '800')
  url.searchParams.set('photo_reference', photoRef)
  url.searchParams.set('key', GOOGLE_KEY)
  return fetchBinary(url.toString())
}

// ─── Try sources in order ────────────────────────────────────────────────────

async function findBestLogo(clinic) {
  const detail = await placeDetails(clinic.placeId, 'website,photos')
  if (!detail) return null

  // 1. Practice website
  if (detail.website) {
    const html = await fetchText(detail.website)
    if (html) {
      const candidates = extractLogoCandidates(html, detail.website)
      for (const c of candidates) {
        const result = await fetchBinary(c.url)
        if (!result) continue
        const ext = isImageBuffer(result.buf) || extFromContentType(result.contentType)
        if (!ext || ext === 'ico') continue   // skip favicons (too small/blurry usually)
        if (result.buf.length < 800) continue  // skip tiny placeholder pixels
        return { buf: result.buf, ext, source: `website (${c.kind})` }
      }
    }
  }

  // 2. Google Place Photos
  if (detail.photos?.length) {
    const r = await fetchPlacePhoto(detail.photos[0].photo_reference)
    if (r) {
      const ext = isImageBuffer(r.buf) || extFromContentType(r.contentType) || 'jpg'
      return { buf: r.buf, ext, source: 'google-place-photo' }
    }
  }

  return null
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
    const logo = await findBestLogo(c)
    if (!logo) { console.log('no logo found'); continue }
    const dir = path.join(IMAGES, `clinic-${c.id}`)
    fs.mkdirSync(dir, { recursive: true })
    const outFile = path.join(dir, `logo.${logo.ext}`)
    fs.writeFileSync(outFile, logo.buf)
    console.log(`✓ ${(logo.buf.length / 1024).toFixed(1)} KB from ${logo.source} → logo.${logo.ext}`)
    patches.push({ id: c.id, oldLogo: c.logo, newLogo: `/images/clinic-${c.id}/logo.${logo.ext}` })
    await new Promise(r => setTimeout(r, 250))
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
  if (updated !== oldText) source = source.slice(0, block.start) + updated + source.slice(block.end)
}
fs.writeFileSync(CLINICS_TS, source)
console.log(`\nPatched ${patches.length} logos in clinics.ts`)

// Remove now-unused SVG placeholders (only when replaced by a different ext)
for (const p of patches) {
  if (p.oldLogo === p.newLogo) continue
  const svgPath = path.join(ROOT, 'public', p.oldLogo.replace(/^\//, ''))
  try { fs.unlinkSync(svgPath); console.log(`  removed ${p.oldLogo}`) } catch { /* ignore */ }
}
