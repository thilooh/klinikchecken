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
  const expertClinic = clinics.find(c => c.certified && c.city === filters.searchCity) ?? null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: interFont }}>
      <Navbar />
      <SearchBar filters={filters} setFilters={setFilters} />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '16px 0 32px' }}>
        <div className="max-w-[1200px] mx-auto px-4">

          {/* Breadcrumb */}
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

              {/* Experten-Beratung Banner */}
              <div
                onClick={() => setSelectedClinic(expertClinic)}
                style={{ backgroundColor: '#1B3A7A', borderRadius: '8px', padding: '16px 18px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#9DBEFF', fontSize: '12px', marginBottom: '2px' }}>Ihre persönliche</div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '17px', lineHeight: 1.2, marginBottom: '6px', letterSpacing: '-0.02em' }}>EXPERTEN-BERATUNG</div>
                  <div style={{ color: '#C5D5F0', fontSize: '12px', lineHeight: 1.5, marginBottom: '10px' }}>Jetzt Beratungstermin bei einer<br />zertifizierten Klinik anfragen.</div>
                  <span style={{ color: '#FFB366', fontWeight: 700, fontSize: '13px' }}>Jetzt anfragen »</span>
                </div>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fff', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#FFB400" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <div style={{ fontSize: '7px', color: '#555', fontWeight: 700, textAlign: 'center', marginTop: '2px', lineHeight: 1.1 }}>TOP Klinik</div>
                  </div>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fff', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#003399" strokeWidth="2"><path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" /><polyline points="9 12 11 14 15 10" /></svg>
                    <div style={{ fontSize: '7px', color: '#003399', fontWeight: 700, textAlign: 'center', marginTop: '2px', lineHeight: 1.1 }}>Zertifiziert</div>
                  </div>
                </div>
              </div>

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
