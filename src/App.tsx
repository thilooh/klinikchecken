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

// Match a raw city string or PLZ (from {{adset.name}}, geo API, etc.) to a supported city.
// Meta tip: name ad sets by city and use ?city={{adset.name}} — Meta substitutes it reliably.
const CITY_VARIANTS: [string[], string[]][] = [
  [['köln', 'koeln', 'koln', 'cologne'],       ['50', '51']],
  [['düsseldorf', 'duesseldorf', 'dusseldorf'], ['40', '41']],
  [['frankfurt', 'frankfurt am main'],           ['60', '61', '63', '65']],
  [['dortmund'],                                 ['44']],
  [['berlin'],                                   ['10', '12', '13', '14']],
  [['münchen', 'muenchen', 'munchen', 'munich'], ['80', '81', '85']],
  [['hamburg'],                                  ['20', '21', '22']],
  [['leipzig'],                                  ['04']],
  [['nürnberg', 'nuernberg', 'nurnberg', 'nuremberg'], ['90', '91']],
  [['stuttgart'],                                ['70', '71']],
  [['essen'],                                    ['45']],
]

const CANONICAL: string[] = ['Köln','Düsseldorf','Frankfurt','Dortmund','Berlin','München','Hamburg','Leipzig','Nürnberg','Stuttgart','Essen']

function matchCity(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  const norm = t.toLowerCase()
  // PLZ: 5-digit postal code
  if (/^\d{5}$/.test(t)) {
    const idx = CITY_VARIANTS.findIndex(([, prefixes]) => prefixes.some(p => t.startsWith(p)))
    return idx >= 0 ? CANONICAL[idx] : null
  }
  // City name: exact then partial
  for (let i = 0; i < CITY_VARIANTS.length; i++) {
    if (CITY_VARIANTS[i][0].includes(norm)) return CANONICAL[i]
  }
  for (let i = 0; i < CITY_VARIANTS.length; i++) {
    if (CITY_VARIANTS[i][0].some(v => norm.startsWith(v) || v.startsWith(norm))) return CANONICAL[i]
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
      .then((data: { city?: string; postalCode?: string }) => {
        const matched = matchCity(data.postalCode ?? '') ?? matchCity(data.city ?? '')
        if (matched) setFilters(f => ({ ...f, searchCity: matched }))
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
