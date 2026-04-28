// Best-effort POST to the Google Apps Script Sheet endpoint.
//
// Uses navigator.sendBeacon first - the browser guarantees delivery
// even if the tab closes immediately after submit, which matters in
// in-app browsers (Facebook, Instagram, TikTok) where users routinely
// switch apps mid-flow. Falls back to fetch with `keepalive: true` when
// sendBeacon is unavailable or the payload is too large.
//
// The GAS endpoint parses e.postData.contents as JSON server-side, so
// the wire content-type is text/plain to avoid CORS preflight on the
// sendBeacon path.

const SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL as string | undefined

export function submitToSheet(payload: Record<string, unknown>): void {
  if (!SHEET_URL) return
  const body = JSON.stringify(payload)

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'text/plain;charset=UTF-8' })
    if (navigator.sendBeacon(SHEET_URL, blob)) return
  }

  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body,
    keepalive: true,
  }).catch(() => { /* best-effort */ })
}
