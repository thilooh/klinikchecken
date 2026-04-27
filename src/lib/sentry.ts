// Sentry RUM + error tracking. Reads VITE_SENTRY_DSN from the build env.
// Skipped silently in dev (no DSN) so the SDK only loads in production.

import * as Sentry from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined
const ENV = import.meta.env.MODE

export function initSentry(): void {
  if (!DSN) return
  Sentry.init({
    dsn: DSN,
    environment: ENV,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],
    // RUM: capture 10 % of transactions in prod (1 % at high traffic)
    tracesSampleRate: 0.1,
    // Replays: capture 0 % of normal sessions, 100 % of sessions with an error
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    // Don't ship PII unless we explicitly tag the event
    sendDefaultPii: false,
    beforeSend(event) {
      // Drop events from local dev that snuck through
      if (event.request?.url?.includes('localhost')) return null
      return event
    },
  })
}

export { Sentry }
