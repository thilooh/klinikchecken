// Lightweight SEO helper - no react-helmet, just direct DOM mutation.
// Covers the basics Google + social cards actually look at.

import { useEffect } from 'react'

type SeoOptions = {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

const DEFAULT_TITLE = 'Besenreiser-Check.de – Geprüfte Besenreiser-Praxen in deiner Stadt'
const DEFAULT_DESC = '227 geprüfte Phlebologen, Dermatologen und Venenzentren. Echte Bewertungen, transparente Preise. Kostenlos anfragen – schnelle Antwort.'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

const JSONLD_ID = 'jsonld-page'

export function useSeo(opts: SeoOptions) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = opts.title

    if (opts.description) {
      setMeta('meta[name="description"]', 'name', 'description', opts.description)
      setMeta('meta[property="og:description"]', 'property', 'og:description', opts.description)
    }
    setMeta('meta[property="og:title"]', 'property', 'og:title', opts.title)
    setMeta('meta[property="og:type"]', 'property', 'og:type', opts.ogType ?? 'website')
    if (opts.ogImage) setMeta('meta[property="og:image"]', 'property', 'og:image', opts.ogImage)
    if (opts.canonical) setLink('canonical', opts.canonical)

    let scriptEl: HTMLScriptElement | null = null
    if (opts.jsonLd) {
      scriptEl = document.createElement('script')
      scriptEl.type = 'application/ld+json'
      scriptEl.id = JSONLD_ID
      scriptEl.text = JSON.stringify(opts.jsonLd)
      // Remove any previous JSON-LD we added on a previous route.
      document.head.querySelectorAll(`script[id="${JSONLD_ID}"]`).forEach(el => el.remove())
      document.head.appendChild(scriptEl)
    }

    return () => {
      document.title = prevTitle
      setMeta('meta[name="description"]', 'name', 'description', DEFAULT_DESC)
      if (scriptEl?.parentNode) scriptEl.parentNode.removeChild(scriptEl)
    }
    // JSON.stringify on opts.jsonLd is intentional - we want a deep-equality
    // check on the JSON-LD payload, not a referential one. Re-running the
    // effect on every render where the parent recreates jsonLd would thrash
    // the <script> tag in <head>.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.title, opts.description, opts.canonical, opts.ogImage, opts.ogType, JSON.stringify(opts.jsonLd)])
}

export const SITE_URL = 'https://www.besenreiser-check.de'
export { DEFAULT_TITLE, DEFAULT_DESC }
