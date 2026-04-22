import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
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
        <MobileFilterSheet
          filters={filters}
          setFilters={setFilters}
          count={filtered.length}
          onClose={() => setMobileFilterOpen(false)}
        />
      )}
    </div>
  )
}
