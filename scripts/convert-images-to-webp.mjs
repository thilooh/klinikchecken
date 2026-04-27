#!/usr/bin/env node
// Convert every PNG/JPG/JPEG under public/images/ to WebP at quality 82.
// The ORIGINAL file stays in place (acts as fallback for browsers that
// don't support WebP — practically zero in 2026, but no reason to delete
// a 30 KB PNG that the build cache keeps around).
//
// After running, src/data/clinics.ts is patched so every `logo: '/images/...png'`
// becomes `logo: '/images/...webp'`. Same for streetview/map.
//
// Run:  node scripts/convert-images-to-webp.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const IMAGES = path.join(ROOT, 'public', 'images')
const CLINICS_TS = path.join(ROOT, 'src', 'data', 'clinics.ts')

const QUALITY = 82
const SKIP_EXT = new Set(['.svg', '.webp', '.gif', '.ico'])

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const files = walk(IMAGES).filter(f => {
  const ext = path.extname(f).toLowerCase()
  return !SKIP_EXT.has(ext) && /\.(png|jpe?g)$/i.test(f)
})

console.log(`Converting ${files.length} images to WebP...\n`)

let totalBefore = 0, totalAfter = 0, ok = 0, skipped = 0

for (const file of files) {
  const webpPath = file.replace(/\.(png|jpe?g)$/i, '.webp')
  if (fs.existsSync(webpPath)) {
    const stat = fs.statSync(webpPath)
    totalAfter += stat.size
    totalBefore += fs.statSync(file).size
    skipped++
    continue
  }
  try {
    const before = fs.statSync(file).size
    await sharp(file).webp({ quality: QUALITY }).toFile(webpPath)
    const after = fs.statSync(webpPath).size
    totalBefore += before
    totalAfter += after
    ok++
    if (ok % 50 === 0) console.log(`  …${ok} converted`)
  } catch (e) {
    console.error(`  ✗ ${file}: ${e.message}`)
  }
}

console.log(`\nDone. ${ok} new, ${skipped} already converted.`)
console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB (${Math.round((1 - totalAfter / totalBefore) * 100)}% smaller)`)

// ─── Patch clinics.ts to point at WebP versions ──────────────────────────────

let source = fs.readFileSync(CLINICS_TS, 'utf8')
let patched = 0
source = source.replace(/('\/images\/clinic-\d+\/(?:logo|streetview|map))\.(png|jpe?g)'/gi, (full, prefix) => {
  const webp = `${prefix}.webp'`
  // Only swap if the WebP file actually exists on disk
  const fsPath = path.join(ROOT, 'public', prefix.slice(1) + '.webp')
  if (fs.existsSync(fsPath)) { patched++; return webp }
  return full
})
fs.writeFileSync(CLINICS_TS, source)
console.log(`Patched ${patched} image refs in clinics.ts to .webp`)
