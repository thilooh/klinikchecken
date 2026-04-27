// Lazy-loaded clinic data - fetched once, then cached at module scope so
// all components see the same array without re-fetching on every render.
//
// Trade-off vs. import { clinics } from '../data/clinics':
//   + ~67 KB gzipped removed from the JS bundle
//   + JSON parses faster than equivalent JS object literals
//   + Browser fetches it in parallel with the JS bundle
//   + CDN caches it independently of code changes
//   - One extra network request on first paint
//   - Components have to handle a brief loading state

import { useEffect, useState } from 'react'
import type { Clinic } from '../types/clinic'

const URL = '/data/clinics.json'

let cache: Clinic[] | null = null
let inFlight: Promise<Clinic[]> | null = null

function load(): Promise<Clinic[]> {
  if (cache) return Promise.resolve(cache)
  if (inFlight) return inFlight
  inFlight = fetch(URL)
    .then(r => {
      if (!r.ok) throw new Error(`Failed to load clinics: ${r.status}`)
      return r.json() as Promise<Clinic[]>
    })
    .then(data => { cache = data; inFlight = null; return data })
    .catch(err => { inFlight = null; throw err })
  return inFlight
}

export function useClinics(): { clinics: Clinic[]; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{ clinics: Clinic[]; loading: boolean; error: Error | null }>(() => ({
    clinics: cache ?? [],
    loading: !cache,
    error: null,
  }))
  useEffect(() => {
    if (cache) return
    let cancelled = false
    load()
      .then(c => { if (!cancelled) setState({ clinics: c, loading: false, error: null }) })
      .catch(err => { if (!cancelled) setState({ clinics: [], loading: false, error: err }) })
    return () => { cancelled = true }
  }, [])
  return state
}

/** Eagerly trigger the fetch - use during route transitions to warm the cache. */
export function preloadClinics(): void { load().catch(() => { /* noop */ }) }
