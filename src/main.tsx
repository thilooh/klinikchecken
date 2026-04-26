import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import App from './App.tsx'
import AboutPage from './pages/AboutPage.tsx'
import RatgeberPage from './pages/RatgeberPage.tsx'
import PraxisWaehlenPage from './pages/ratgeber/PraxisWaehlenPage.tsx'
import ClinicPage from './pages/ClinicPage.tsx'
import CityPage from './pages/CityPage.tsx'
import MethodePage from './pages/MethodePage.tsx'
import './index.css'

function RouteTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'page_view', page_path: pathname })
  }, [pathname])
  return null
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouteTracker />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ueber-uns" element={<AboutPage />} />
        <Route path="/ratgeber" element={<RatgeberPage />} />
        <Route path="/ratgeber/praxis-waehlen" element={<PraxisWaehlenPage />} />
        <Route path="/praxis/:slug" element={<ClinicPage />} />
        <Route path="/besenreiser/:city" element={<CityPage />} />
        <Route path="/methode/:method" element={<MethodePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
