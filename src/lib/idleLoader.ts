/**
 * Run a callback when the browser is idle (or after a hard timeout).
 *
 * Used to defer heavy third-party scripts (Sentry, GTM, Clarity) past first
 * paint so they don't block the main thread during the LCP window. The
 * timeout guarantees the callback eventually fires even if the user never
 * idles the browser (e.g. on a noisy mobile connection or on a busy page).
 */
export function whenIdle(cb: () => void, timeoutMs = 3000): void {
  if (typeof window === 'undefined') return

  const ric = (window as Window & {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: { timeout: number }) => number
  }).requestIdleCallback

  if (typeof ric === 'function') {
    ric(() => cb(), { timeout: timeoutMs })
    return
  }
  // Safari + older browsers: fall back to a timeout that mimics the
  // "after first paint and a beat" window requestIdleCallback typically gives.
  setTimeout(cb, 1)
}
