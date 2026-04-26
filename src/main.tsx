import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import AboutPage from './pages/AboutPage.tsx'
import RatgeberPage from './pages/RatgeberPage.tsx'
import PraxisWaehlenPage from './pages/ratgeber/PraxisWaehlenPage.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ueber-uns" element={<AboutPage />} />
        <Route path="/ratgeber" element={<RatgeberPage />} />
        <Route path="/ratgeber/praxis-waehlen" element={<PraxisWaehlenPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
