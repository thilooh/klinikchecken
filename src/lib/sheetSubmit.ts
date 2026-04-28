// POSTs a lead payload to /.netlify/functions/lead-write, which
// forwards it server-side to the Google Apps Script Sheet endpoint.
//
// We previously hit GAS directly with `mode: 'no-cors'` and got an
// opaque response - leads vanished without trace. The relay returns
// a real status, so we can capture failures to Sentry and the team
// finds out when the sheet pipeline breaks.
//
// keepalive: true lets the request survive the tab closing right
// after submit, which matters for in-app browsers (Facebook,
// Instagram) where users routinely switch apps mid-flow. The
// downside vs sendBeacon is none for our case - we don't need to
// read the response synchronously, just log failures.

import { sentryCaptureMessage } from './sentry'

const ENDPOINT = '/.netlify/functions/lead-write'

export function submitToSheet(payload: Record<string, unknown>): void {
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then(async res => {
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        captureSheetFailure(`lead-write returned ${res.status}: ${text.slice(0, 300)}`, payload)
      }
    })
    .catch(err => {
      captureSheetFailure(`lead-write fetch failed: ${String(err)}`, payload)
    })
}

function captureSheetFailure(msg: string, payload: Record<string, unknown>): void {
  console.warn('[lead-write]', msg, payload)
  try {
    sentryCaptureMessage(msg, {
      level: 'warning',
      tags: { source: 'lead-write' },
      extra: { clinic: payload.clinic, clinicCity: payload.clinicCity },
    })
  } catch { /* Sentry not initialised in dev */ }
}
