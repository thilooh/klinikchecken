import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import AboutPage from './pages/AboutPage.tsx'
import RatgeberPage from './pages/RatgeberPage.tsx'
import PraxisWaehlenPage from './pages/ratgeber/PraxisWaehlenPage.tsx'
import ClinicPage from './pages/ClinicPage.tsx'
import CityPage from './pages/CityPage.tsx'
import MethodePage from './pages/MethodePage.tsx'
import MethodenQuiz from './pages/MethodenQuiz.tsx'
import MethodenQuiz2 from './pages/MethodenQuiz2.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'
import RouteTracker from './components/RouteTracker'
import TrackingShell from './components/TrackingShell'
import { initSentry, SentryErrorBoundary } from './lib/sentry'
import { whenIdle } from './lib/idleLoader'
import './index.css'

// Sentry init costs ~30 KB of JS execution on first paint. Defer it until
// the browser is idle so it doesn't compete with React hydration. Errors
// thrown in the very first frames will still reach the global onerror /
// unhandledrejection handlers Sentry installs after init - we just don't
// catch the synchronous render-time crashes for ~1 frame, which is fine.
whenIdle(() => initSentry(), 4000)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<div style={{ padding: '40px 20px', textAlign: 'center' }}>
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
            <Route path="/methoden-quiz-2" element={<MethodenQuiz2 />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </TrackingShell>
      </BrowserRouter>
    </SentryErrorBoundary>
  </React.StrictMode>,
)
