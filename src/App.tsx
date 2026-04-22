import { useState } from 'react'
import { SlidersHorizontal, ChevronRight } from 'lucide-react'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import Sidebar from './components/Sidebar'
import ResultsHeader from './components/ResultsHeader'
import ClinicList from './components/ClinicList'
import InquiryModal from './components/InquiryModal'
import InfoSection from './components/InfoSection'
import Footer from './components/Footer'
import { useFilteredClinics } from './hooks/useFilteredClinics'
import { clinics } from './data/clinics'
import type { Clinic, FilterState } from './types/clinic'

const defaultFilters: FilterState = {
  selectedMethods: [],
  priceRange: [50, 350],
  minRating: 4,
  maxDistance: 10,
  extras: {
    freeConsultation: false,
    onlineBooking: false,
    evening: false,
    kassenpatient: false,
    ratenzahlung: false,
    parking: false,
    certified: true,
  },
  sortBy: 'recommended',
  searchCity: 'Köln',
}

const interFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

export default function App() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const filtered = useFilteredClinics(clinics, filters)

  const activeFilterCount = [
    filters.selectedMethods.length > 0,
    filters.priceRange[0] > 50 || filters.priceRange[1] < 350,
    filters.minRating > 0,
    filters.maxDistance < 999,
    Object.values(filters.extras).some(Boolean),
  ].filter(Boolean).length

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: interFont }}>
      <Navbar />
      <SearchBar filters={filters} setFilters={setFilters} />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '16px 0 32px' }}>
        <div className="max-w-[1200px] mx-auto px-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '12px', color: '#666' }}>
            <a href="#" style={{ color: '#003399', textDecoration: 'none' }}>Startseite</a>
            <ChevronRight size={12} />
            <a href="#" style={{ color: '#003399', textDecoration: 'none' }}>Besenreiser</a>
            <ChevronRight size={12} />
            <span style={{ color: '#333' }}>{filters.searchCity}</span>
          </div>
          <div className="md:hidden" style={{ marginBottom: '12px' }}>
            <button
              onClick={() => setMobileFilterOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#003399', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              <SlidersHorizontal size={15} />
              Filter
              {activeFilterCount > 0 && (
                <span style={{ backgroundColor: '#FF6600', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700 }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="hidden md:block">
              <Sidebar filters={filters} setFilters={setFilters} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ResultsHeader
                count={filtered.length}
                filters={filters}
                setFilters={setFilters}
                onOpenFilter={() => setMobileFilterOpen(true)}
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
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setMobileFilterOpen(false) }}
        >
          <div style={{ backgroundColor: '#fff', borderRadius: '12px 12px 0 0', maxHeight: '85vh', overflowY: 'auto', padding: '8px' }}>
            <div style={{ width: '40px', height: '4px', backgroundColor: '#DDD', borderRadius: '2px', margin: '8px auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px', borderBottom: '1px solid #EEE', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>Filter</span>
              <button onClick={() => setMobileFilterOpen(false)} style={{ backgroundColor: '#FF6600', color: '#fff', border: 'none', borderRadius: '4px', padding: '6px 16px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                {filtered.length} Ergebnisse anzeigen
              </button>
            </div>
            <Sidebar filters={filters} setFilters={setFilters} />
          </div>
        </div>
      )}
    </div>
  )
}
