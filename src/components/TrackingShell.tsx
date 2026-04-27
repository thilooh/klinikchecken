import { useEffect, useState } from 'react'
import CookieBanner from './CookieBanner'
import { loadGTM, getConsent } from '../lib/consent'
import { loadClarity, clarityEvent } from '../lib/clarity'
import { getCTAVariant } from '../lib/ctaVariant'
import { whenIdle } from '../lib/idleLoader'

/**
 * App-wide consent + tracking initialisation. Renders on every route
 * (mounted in main.tsx around the route tree), so users who deep-link
 * into /ratgeber, /praxis/:slug, /besenreiser/:city etc. also get:
 *   - GTM loaded (which then handles Meta Pixel etc.)
 *   - Clarity loaded if consent was previously accepted
 *   - The cookie banner if consent has never been given
 *
 * Both loadGTM() and loadClarity() are idempotent (skip on second call
 * via document.getElementById guard), so re-renders are safe.
 */
export default function TrackingShell({ children }: { children: React.ReactNode }) {
  const [showBanner, setShowBanner] = useState<boolean>(() => getConsent() === null)

  useEffect(() => {
    // Push the variant to the dataLayer immediately - it's just an array
    // shove and costs nothing. GTM will replay this when it loads.
    const variant = getCTAVariant()
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'cta_variant_assigned', cta_variant: variant })

    // Defer the actual third-party script downloads and parsing past the
    // LCP window. Each script (GTM ~70 KB, Clarity ~30 KB) blocks the main
    // thread for hundreds of ms on slow mobile - loading them eagerly is the
    // biggest contributor to TBT in Lighthouse. dataLayer.push calls and
    // window.clarity.q queue calls work fine before the scripts load.
    whenIdle(() => {
      loadGTM()
      if (getConsent() === 'accepted') {
        loadClarity()
        clarityEvent('cta_variant', variant)
      }
    }, 3000)
  }, [])

  return (
    <>
      {children}
      {showBanner && (
        <CookieBanner
          onAccept={() => {
            setShowBanner(false)
            loadClarity()
            clarityEvent('cta_variant', getCTAVariant())
          }}
          onDecline={() => setShowBanner(false)}
        />
      )}
    </>
  )
}
