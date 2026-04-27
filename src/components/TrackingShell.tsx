import { useEffect, useState } from 'react'
import CookieBanner from './CookieBanner'
import { loadGTM, getConsent } from '../lib/consent'
import { loadClarity, clarityEvent } from '../lib/clarity'
import { getCTAVariant } from '../lib/ctaVariant'

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
    loadGTM()
    if (getConsent() === 'accepted') loadClarity()
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'cta_variant_assigned', cta_variant: getCTAVariant() })
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
