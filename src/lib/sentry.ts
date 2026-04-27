// Sentry RUM + error tracking. Reads VITE_SENTRY_DSN from the build env.
// Skipped silently in dev (no DSN) so the SDK only loads in production.
//
// Named imports (instead of `import * as Sentry`) so Rolldown can tree-shake
// out the integrations we don't use - notably Session Replay, which alone
// adds ~50 KB to the initial bundle. Microsoft Clarity already gives us
// session recordings for UX work.

import { init, browserTracingIntegration, ErrorBoundary } from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined
const ENV = import.meta.env.MODE

export function initSentry(): void {
  if (!DSN) return
  init({
    dsn: DSN,
    environment: ENV,
    integrations: [browserTracingIntegration()],
    // RUM: capture 10 % of transactions in prod (1 % at high traffic)
    tracesSampleRate: 0.1,
    // Don't ship PII unless we explicitly tag the event
    sendDefaultPii: false,
    beforeSend(event) {
      // Drop events from local dev that snuck through
      if (event.request?.url?.includes('localhost')) return null
      return event
    },
  })
}

export { ErrorBoundary as SentryErrorBoundary }
