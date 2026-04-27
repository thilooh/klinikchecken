// localStorage memory of the last city the user actually used.
// Survives across visits so a Hamburg user from a paid Meta ad doesn't
// land in Köln on every return.

const KEY = 'bc.lastCity'
const MAX_AGE_DAYS = 90

type Stored = { city: string; ts: number }

export function rememberCity(city: string | null | undefined): void {
  if (!city || typeof window === 'undefined') return
  try {
    const payload: Stored = { city, ts: Date.now() }
    window.localStorage.setItem(KEY, JSON.stringify(payload))
  } catch { /* private mode etc. */ }
}

export function recallCity(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Stored
    const ageDays = (Date.now() - parsed.ts) / (1000 * 60 * 60 * 24)
    if (ageDays > MAX_AGE_DAYS) {
      window.localStorage.removeItem(KEY)
      return null
    }
    return parsed.city
  } catch {
    return null
  }
}
