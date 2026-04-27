import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import App from './App.tsx'
import AboutPage from './pages/AboutPage.tsx'
import RatgeberPage from './pages/RatgeberPage.tsx'
import PraxisWaehlenPage from './pages/ratgeber/PraxisWaehlenPage.tsx'
import ClinicPage from './pages/ClinicPage.tsx'
import CityPage from './pages/CityPage.tsx'
import MethodePage from './pages/MethodePage.tsx'
import MethodenQuiz from './pages/MethodenQuiz.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import TrackingShell from './components/TrackingShell'
import { initSentry, Sentry } from './lib/sentry'
import './index.css'

initSentry()

function RouteTracker() {
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      // The Meta Pixel base script (loaded via GTM) auto-fires PageView
      // when it initialises, and GA4 Configuration likewise sends its
      // page_view on first load. We must NOT push a custom page_view to
      // the dataLayer on the initial mount or downstream tags will fire
      // PageView twice. We still scroll to top.
      isFirstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'page_view', page_path: pathname })
  }, [pathname])
  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ color: '#003399' }}>Etwas ist schiefgelaufen.</h1>
      <p style={{ color: '#555' }}>Bitte lade die Seite neu. Wir wurden bereits informiert.</p>
      <a href="/" style={{ color: '#0052CC' }}>Zur Startseite</a>
    </div>}>
      <BrowserRouter>
        <RouteTracker />
        <TrackingShell>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/ueber-uns" element={<AboutPage />} />
            <Route path="/ratgeber" element={<RatgeberPage />} />
            <Route path="/ratgeber/praxis-waehlen" element={<PraxisWaehlenPage />} />
            <Route path="/praxis/:slug" element={<ClinicPage />} />
            <Route path="/besenreiser/:city" element={<CityPage />} />
            <Route path="/methode/:method" element={<MethodePage />} />
            <Route path="/methoden-quiz" element={<MethodenQuiz />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </TrackingShell>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
