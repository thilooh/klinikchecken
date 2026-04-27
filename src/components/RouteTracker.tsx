import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Tracks SPA route changes by pushing a `page_view` event to GTM.
 *
 * The first render is intentionally skipped: the Meta Pixel base script
 * (loaded via GTM) auto-fires PageView when it initialises, and the GA4
 * Configuration tag does the same. Pushing our own page_view on the
 * initial mount would double-count.
 */
export default function RouteTracker() {
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'page_view', page_path: pathname })
  }, [pathname])

  return null
}
