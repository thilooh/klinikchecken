import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import ResultsHeader from './components/ResultsHeader'
import ClinicList from './components/ClinicList'
import InquiryModal from './components/InquiryModal'
import InfoSection from './components/InfoSection'
import Footer from './components/Footer'
import MobileFilterSheet from './components/MobileFilterSheet'
import StickyBar from './components/StickyBar'
import MultiInquiryModal from './components/MultiInquiryModal'
import { useFilteredClinics } from './hooks/useFilteredClinics'
import { useClinics } from './hooks/useClinics'
import CityPicker from './components/CityPicker'
import { recallCity, rememberCity } from './lib/cityMemory'
import { cityForRegion } from './lib/regionToCity'
import { matchCity } from './lib/cityMatch'
import { ALL_METHODS } from './data/clinics-meta'
import type { Clinic, FilterState } from './types/clinic'
import { parseVariant, VARIANTS } from './variants'
import type { VariantKey } from './variants'
import { sendEvent } from './lib/gtm'
import { generateEventId, sendCapi } from './lib/capi'
import { getCTAVariant, getCTAColor } from './lib/ctaVariant'
import type { CTAVariant } from './lib/ctaVariant'

// matchCity / CITY_VARIANTS / CANONICAL extracted to src/lib/cityMatch.ts
// so the methoden-quiz can reuse the same PLZ-prefix logic.

const defaultFilters: FilterState = {
  selectedMethods: [],
  minRating: 0,
  maxDistance: 999,
  extras: {
    freeConsultation: false,
    onlineBooking: false,
    evening: false,
    kassenpatient: false,
    ratenzahlung: false,
    parking: false,
    certified: true,
  },
  sortBy: 'rating',
  searchCity: '',          // No city by default; cascade in App.tsx fills it.
  userLat: undefined,
  userLng: undefined,
}

const interFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

export default function App() {
  const { clinics, loading: clinicsLoading } = useClinics()
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const handleInquire = (clinic: Clinic) => {
    const checkoutEventId = generateEventId()
    const checkoutData = {
      content_name: clinic.name,        // Meta Pixel param
      content_category: clinic.city,    // Meta Pixel param
      item_name: clinic.name,           // GA4 param
      item_category: clinic.city,       // GA4 param
      value: 1,
      currency: 'EUR',
      cta_variant: ctaVariant,          // A/B button color attribution
    }
    sendEvent('InitiateCheckout', checkoutData, undefined, checkoutEventId)
    sendCapi('InitiateCheckout', checkoutEventId, checkoutData)
    setSelectedClinic(clinic)
  }
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [filterSection, setFilterSection] = useState('sort')
  const [autoCity, setAutoCity] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [showMultiModal, setShowMultiModal] = useState(false)
  const [selectToast, setSelectToast] = useState(false)
  const MAX_SELECTION = 3
  const [variant] = useState<VariantKey>(() =>
    parseVariant(new URLSearchParams(window.location.search).get('v'))
  )
  const vt = VARIANTS[variant]
  const [ctaVariant] = useState<CTAVariant>(() => getCTAVariant())
  const ctaColor = getCTAColor(ctaVariant)
  // GTM/Clarity loading + cookie banner now live in TrackingShell so they
  // run for every route, not only /. See src/components/TrackingShell.tsx.

  // Cascade for picking a default city. Stops at the first hit.
  // 1. ?city= URL param        - Meta-Ads / Direct-Link
  // 2. localStorage memory     - returning visitor
  // 3. /api/geo postalCode     - most accurate IP-Geo (rarely available)
  // 4. /api/geo city           - exact city match
  // 5. /api/geo subdivisionCode→ Bundesland's largest listed city
  // 6. nothing → CityPicker rendered as empty-state (no Köln-default)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // Pre-select method filters when arriving from MethodenQuiz
    // (?methode=Sklerotherapie,Laser%20%28Nd%3AYAG%29). Unknown values
    // are dropped silently rather than producing an "always empty" filter.
    const methodeParam = params.get('methode')
    if (methodeParam) {
      const known = methodeParam.split(',').map(s => s.trim()).filter(s => ALL_METHODS.includes(s))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (known.length > 0) setFilters(f => ({ ...f, selectedMethods: known }))
    }
    const cityParam = params.get('city')
    if (cityParam) {
      const matched = matchCity(cityParam)
      if (matched) { setFilters(f => ({ ...f, searchCity: matched })); setAutoCity(matched) }
      return
    }
    const remembered = recallCity()
    if (remembered) {
      setFilters(f => ({ ...f, searchCity: remembered }))
      // Don't show the autoCity banner for remembered choices - it's
      // the user's own previous pick, no need to suggest changing it.
      return
    }
    fetch('/api/geo')
      .then(r => r.json())
      .then((data: { city?: string; postalCode?: string; subdivisionCode?: string }) => {
        const matched =
          matchCity(data.postalCode ?? '') ??
          matchCity(data.city ?? '') ??
          cityForRegion(data.subdivisionCode)
        if (matched) { setFilters(f => ({ ...f, searchCity: matched })); setAutoCity(matched) }
      })
      .catch(() => {})
  }, [])

  // Persist any explicit city change so a returning visitor lands in
  // the same place next time.
  useEffect(() => {
    if (filters.searchCity) rememberCity(filters.searchCity)
  }, [filters.searchCity])

  const handleSetFilters = (f: FilterState) => {
    if (f.searchCity !== filters.searchCity) {
      setAutoCity(null)
      // Clear user coords when city changes via sidebar/filter (not via search bar)
      if (f.userLat === filters.userLat) f = { ...f, userLat: undefined, userLng: undefined }
    }
    setFilters(f)
  }

  const focusSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => document.querySelector<HTMLInputElement>('input[type="text"]')?.focus(), 300)
  }

  const filtered = useFilteredClinics(clinics, filters)
  const selectedClinics = clinics.filter(c => selectedIds.has(c.id))

  const toggleSelection = (clinic: Clinic) => {
    setSelectedIds(prev => {
      if (prev.has(clinic.id)) {
        const next = new Set(prev); next.delete(clinic.id); return next
      }
      if (prev.size >= MAX_SELECTION) {
        setSelectToast(true)
        setTimeout(() => setSelectToast(false), 3000)
        return prev
      }
      return new Set([...prev, clinic.id])
    })
  }

  const openFilter = (section = 'sort') => {
    setFilterSection(section)
    setMobileFilterOpen(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: interFont }}>
      <Navbar />
      <SearchBar filters={filters} setFilters={handleSetFilters} hero={vt.hero} />
      {autoCity && (
        <div style={{ backgroundColor: '#EEF4FF', borderBottom: '1px solid #C8DAFE', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px', color: '#1E3A6E' }}>
          <span>📍 Wir zeigen Praxen in <strong>{autoCity}</strong> - Nicht deine Stadt?</span>
          <button onClick={focusSearch} style={{ color: '#0052CC', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '14px' }}>
            Ändern
          </button>
          <button onClick={() => setAutoCity(null)} style={{ color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '16px', lineHeight: 1 }} aria-label="Schließen">
            ×
          </button>
        </div>
      )}
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '16px 0 32px' }}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="hidden md:block">
              <Sidebar filters={filters} setFilters={handleSetFilters} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {(filters.searchCity || filters.userLat != null) && (
                <ResultsHeader
                  count={filtered.length}
                  filters={filters}
                  setFilters={handleSetFilters}
                  onOpenFilter={openFilter}
                />
              )}
              {/* Discovery CTA for the methode quiz - sits above the result list
                  so unsure users find it without scrolling to the sidebar. */}
              <a href="/methoden-quiz" style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'linear-gradient(90deg, #EEF4FF 0%, #F7F9FF 100%)',
                border: '1px solid #DDE3F5', borderRadius: '6px', padding: '10px 14px',
                marginBottom: '12px', textDecoration: 'none', color: '#003399',
              }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>🎯</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1F44' }}>Welcher Besenreiser-Typ bist du?</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>60-Sekunden-Check zeigt dir Methode und Praxis-Match.</div>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#003399', whiteSpace: 'nowrap' }}>Quiz starten →</span>
              </a>
              {clinicsLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className="skeleton" style={{ height: '180px', borderRadius: '6px' }} />
                  ))}
                </div>
              ) : !filters.searchCity && filters.userLat == null ? (
                <CityPicker
                  clinics={clinics}
                  onPick={city => handleSetFilters({ ...filters, searchCity: city })}
                />
              ) : (
                <ClinicList clinics={filtered} onInquire={handleInquire} filters={filters} setFilters={handleSetFilters} cardVariant={vt.card} selectedIds={selectedIds} onToggleSelect={toggleSelection} ctaColor={ctaColor} />
              )}
            </div>
          </div>
        </div>
      </main>
      <InfoSection />
      <Footer />
      <InquiryModal clinic={selectedClinic} onClose={() => setSelectedClinic(null)} ctaColor={ctaColor} ctaVariant={ctaVariant} />
      {mobileFilterOpen && (
        <MobileFilterSheet
          filters={filters}
          setFilters={handleSetFilters}
          count={filtered.length}
          onClose={() => setMobileFilterOpen(false)}
          initialSection={filterSection}
        />
      )}
      <StickyBar
        clinics={selectedClinics}
        onRequest={() => setShowMultiModal(true)}
        onClear={() => setSelectedIds(new Set())}
        ctaColor={ctaColor}
      />
      {showMultiModal && (
        <MultiInquiryModal
          clinics={selectedClinics}
          onClose={() => setShowMultiModal(false)}
          onClearSelection={() => { setSelectedIds(new Set()); setShowMultiModal(false) }}
          ctaColor={ctaColor}
          ctaVariant={ctaVariant}
        />
      )}
      {selectToast && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', color: '#fff', borderRadius: '6px', padding: '10px 18px', fontSize: '13px', zIndex: 2000, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          Maximal 3 Praxen - entferne eine, um eine andere hinzuzufügen.
        </div>
      )}
    </div>
  )
}
