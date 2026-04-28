// Lazy loader for the treatments.json payload, fetched the first
// time a profile modal or /praxis/:slug page asks for treatmentInfo.
// Caching strategy:
// - In-memory map keyed by clinic.id, populated on first fetch.
// - Single in-flight promise so concurrent callers share one network
//   request rather than firing N parallel ones.
// - Service Worker (vite-plugin-pwa) caches the file via its
//   precache or runtime stale-while-revalidate config; we don't add
//   our own SW logic here.
//
// Splitting treatmentInfo out of clinics.json saves ~225 KB on the
// initial page load. The treatments file is only fetched once a
// profile is actually opened - most listing-only sessions never pay
// that cost.

import type { Clinic } from '../types/clinic'

type TreatmentEntry = { id: number; treatmentInfo: NonNullable<Clinic['treatmentInfo']> }

let cache: Map<number, NonNullable<Clinic['treatmentInfo']>> | null = null
let inflight: Promise<Map<number, NonNullable<Clinic['treatmentInfo']>>> | null = null

async function loadAll(): Promise<Map<number, NonNullable<Clinic['treatmentInfo']>>> {
  if (cache) return cache
  if (inflight) return inflight
  inflight = fetch('/data/treatments.json')
    .then(r => r.ok ? r.json() : [])
    .then((entries: TreatmentEntry[]) => {
      const m = new Map<number, NonNullable<Clinic['treatmentInfo']>>()
      for (const e of entries) m.set(e.id, e.treatmentInfo)
      cache = m
      inflight = null
      return m
    })
    .catch(() => {
      inflight = null
      return new Map()
    })
  return inflight
}

export async function getTreatmentInfo(clinicId: number): Promise<NonNullable<Clinic['treatmentInfo']> | undefined> {
  const m = await loadAll()
  return m.get(clinicId)
}
