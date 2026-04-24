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
import { useFilteredClinics } from './hooks/useFilteredClinics'
import { clinics } from './data/clinics'
import type { Clinic, FilterState } from './types/clinic'

// Normalize + match a raw city string (from Meta {{city}} param or geo API) to a supported city
const CITY_VARIANTS: [string[], string][] = [
  [['köln', 'koeln', 'koln', 'cologne'], 'Köln'],
  [['düsseldorf', 'duesseldorf', 'dusseldorf'], 'Düsseldorf'],
  [['frankfurt', 'frankfurt am main', 'frankfurt a. m.', 'frankfurt a.m.'], 'Frankfurt'],
  [['dortmund'], 'Dortmund'],
  [['berlin'], 'Berlin'],
  [['münchen', 'muenchen', 'munchen', 'munich'], 'München'],
  [['hamburg'], 'Hamburg'],
  [['leipzig'], 'Leipzig'],
  [['nürnberg', 'nuernberg', 'nurnberg', 'nuremberg'], 'Nürnberg'],
  [['stuttgart'], 'Stuttgart'],
  [['essen'], 'Essen'],
]

function matchCity(raw: string): string | null {
  const norm = raw.trim().toLowerCase()
  for (const [variants, canonical] of CITY_VARIANTS) {
    if (variants.includes(norm)) return canonical
  }
  for (const [variants, canonical] of CITY_VARIANTS) {
    if (variants.some(v => norm.startsWith(v) || v.startsWith(norm))) return canonical
  }
  return null
}

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
  searchCity: 'Köln',
}

const interFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

export default function App() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [filterSection, setFilterSection] = useState('sort')

  useEffect(() => {
    const cityParam = new URLSearchParams(window.location.search).get('city')
    if (cityParam) {
      const matched = matchCity(cityParam)
      if (matched) setFilters(f => ({ ...f, searchCity: matched }))
      return
    }
    // Fallback: IP geolocation via Netlify Edge
    fetch('/api/geo')
      .then(r => r.json())
      .then((data: { city?: string }) => {
        if (data.city) {
          const matched = matchCity(data.city)
          if (matched) setFilters(f => ({ ...f, searchCity: matched }))
        }
      })
      .catch(() => {})
  }, [])

  const filtered = useFilteredClinics(clinics, filters)

  const openFilter = (section = 'sort') => {
    setFilterSection(section)
    setMobileFilterOpen(true)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: interFont }}>
      <Navbar />
      <SearchBar filters={filters} setFilters={setFilters} />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '16px 0 32px' }}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="hidden md:block">
              <Sidebar filters={filters} setFilters={setFilters} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ResultsHeader
                count={filtered.length}
                filters={filters}
                setFilters={setFilters}
                onOpenFilter={openFilter}
              />
              <ClinicList clinics={filtered} onInquire={setSelectedClinic} filters={filters} setFilters={setFilters} />
            </div>
          </div>
        </div>
      </main>
      <InfoSection />
      <Footer />
      <InquiryModal clinic={selectedClinic} onClose={() => setSelectedClinic(null)} />
      {mobileFilterOpen && (
        <MobileFilterSheet
          filters={filters}
          setFilters={setFilters}
          count={filtered.length}
          onClose={() => setMobileFilterOpen(false)}
          initialSection={filterSection}
        />
      )}
    </div>
  )
}
