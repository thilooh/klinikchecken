#!/usr/bin/env node
// Generate public/sitemap.xml from src/data/clinics.ts.
// Includes the static routes, every clinic detail page, every city
// landing page, and the methode pages.
//
// Run:  node scripts/generate-sitemap.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SITE = 'https://www.besenreiser-check.de'
const TODAY = new Date().toISOString().slice(0, 10)

const UMLAUT_MAP = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', 'á': 'a', 'à': 'a', 'â': 'a', 'é': 'e', 'è': 'e', 'ê': 'e', 'í': 'i', 'ì': 'i', 'î': 'i', 'ó': 'o', 'ò': 'o', 'ô': 'o', 'ú': 'u', 'ù': 'u', 'û': 'u', 'ç': 'c', 'ñ': 'n' }
const slugify = s => s.toLowerCase().replace(/[äöüßáàâéèêíìîóòôúùûçñ]/g, ch => UMLAUT_MAP[ch] ?? ch).replace(/&/g, 'und').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-').slice(0, 80)

const txt = fs.readFileSync(path.join(ROOT, 'src/data/clinics.ts'), 'utf8')
const startIdx = txt.indexOf('clinics: Clinic[] = [')
let i = startIdx + 'clinics: Clinic[] = ['.length, depth = 0, blockStart = -1
const clinics = []
while (i < txt.length) {
  const c = txt[i]
  if (c === '{') { if (depth === 0) blockStart = i; depth++ }
  else if (c === '}') {
    depth--
    if (depth === 0 && blockStart >= 0) {
      const t = txt.slice(blockStart, i + 1)
      clinics.push({
        id: Number(t.match(/\bid:\s*(\d+)/)?.[1]),
        name: t.match(/\bname:\s*'([^']+)'/)?.[1],
        city: t.match(/\bcity:\s*'([^']+)'/)?.[1],
      })
      blockStart = -1
    }
  } else if (c === ']' && depth === 0) break
  i++
}

const cities = Array.from(new Set(clinics.map(c => c.city))).sort()
const methods = ['verodung', 'laser', 'ipl']

const urls = []
const url = (loc, priority = '0.8', changefreq = 'weekly') => urls.push({ loc, lastmod: TODAY, changefreq, priority })

url(`${SITE}/`, '1.0', 'daily')
url(`${SITE}/ueber-uns`, '0.5', 'monthly')
url(`${SITE}/ratgeber`, '0.7', 'weekly')
url(`${SITE}/ratgeber/praxis-waehlen`, '0.7', 'monthly')

for (const m of methods) {
  url(`${SITE}/methode/${m}`, '0.8', 'monthly')
}

for (const city of cities) {
  url(`${SITE}/besenreiser/${slugify(city)}`, '0.8', 'weekly')
}

for (const c of clinics) {
  if (!c.name || !c.city) continue
  const slug = `${slugify(c.name)}-${slugify(c.city)}-${c.id}`
  url(`${SITE}/praxis/${slug}`, '0.7', 'weekly')
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
fs.writeFileSync(path.join(ROOT, 'public/sitemap.xml'), xml)
console.log(`Wrote ${urls.length} URLs to public/sitemap.xml`)
