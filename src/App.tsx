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
import CookieBanner from './components/CookieBanner'
import StickyBar from './components/StickyBar'
import MultiInquiryModal from './components/MultiInquiryModal'
import { useFilteredClinics } from './hooks/useFilteredClinics'
import { clinics } from './data/clinics'
import type { Clinic, FilterState } from './types/clinic'
import { parseVariant, VARIANTS } from './variants'
import type { VariantKey } from './variants'
import { sendEvent } from './lib/gtm'
import { generateEventId, sendCapi } from './lib/capi'
import { loadGTM, getConsent } from './lib/consent'
import { loadClarity, clarityEvent } from './lib/clarity'
import { getCTAVariant, getCTAColor } from './lib/ctaVariant'
import type { CTAVariant } from './lib/ctaVariant'

// Match a raw city string or PLZ (from {{adset.name}}, geo API, etc.) to a supported city.
// Meta tip: name ad sets by city and use ?city={{adset.name}} - Meta substitutes it reliably.
const CITY_VARIANTS: [string[], string[]][] = [
  [['köln', 'koeln', 'koln', 'cologne'],              ['50', '51']],
  [['düsseldorf', 'duesseldorf', 'dusseldorf'],        ['40']],
  [['frankfurt', 'frankfurt am main'],                 ['60', '61', '63']],
  [['dortmund'],                                       ['44']],
  [['berlin'],                                         ['10', '12', '13', '14']],
  [['münchen', 'muenchen', 'munchen', 'munich'],       ['80', '81', '85']],
  [['hamburg'],                                        ['20', '21', '22']],
  [['leipzig'],                                        ['04']],
  [['nürnberg', 'nuernberg', 'nurnberg', 'nuremberg'], ['90', '91']],
  [['stuttgart'],                                      ['70', '71']],
  [['essen'],                                          ['45']],
  [['hannover', 'hanover'],                            ['30']],
  [['bremen'],                                         ['27', '28']],
  [['kiel'],                                           ['24']],
  [['rostock'],                                        ['18']],
  [['braunschweig', 'brunswick'],                      ['38']],
  [['magdeburg'],                                      ['39']],
  [['lübeck', 'luebeck', 'lubeck'],                   ['23']],
  [['bonn'],                                           ['53']],
  [['aachen'],                                         ['52']],
  [['münster', 'muenster', 'munster'],                 ['48']],
  [['bielefeld'],                                      ['336', '337', '338', '339']],
  [['wuppertal'],                                      ['42']],
  [['bochum'],                                         ['447', '448']],
  [['duisburg'],                                       ['47']],
  [['augsburg'],                                       ['86']],
  [['freiburg', 'freiburg im breisgau'],               ['79']],
  [['ulm'],                                            ['89']],
  [['heidelberg'],                                     ['69']],
  [['karlsruhe'],                                      ['76']],
  [['mannheim'],                                       ['68']],
  [['regensburg'],                                     ['93']],
  [['würzburg', 'wuerzburg', 'wurzburg'],              ['97']],
  [['dresden'],                                        ['01']],
  [['chemnitz'],                                       ['09']],
  [['erfurt'],                                         ['99']],
  [['potsdam'],                                        ['144', '145', '146']],
  [['wiesbaden'],                                      ['65']],
  [['mainz'],                                          ['55']],
  [['kassel'],                                         ['34']],
  [['saarbrücken', 'saarbruecken', 'saarbrucken'],     ['66']],
  [['göttingen', 'goettingen', 'gottingen'],           ['37']],
  [['halle', 'halle an der saale', 'halle saale'],     ['06']],
  [['mönchengladbach', 'moenchengladbach', 'mgladbach'],['41']],
  [['gelsenkirchen'],                                   ['459', '456', '458']],
  [['krefeld', 'crefeld'],                              ['477', '478']],
  [['oberhausen'],                                      ['460', '462']],
  [['hagen'],                                           ['58']],
  [['hamm'],                                            ['592', '593', '594']],
  [['ludwigshafen', 'ludwigshafen am rhein'],           ['67']],
  [['oldenburg'],                                       ['26']],
  [['osnabrück', 'osnabrueck', 'osnabruck'],            ['49']],
  [['leverkusen'],                                      ['513', '514']],
  [['solingen'],                                        ['427', '428']],
  [['paderborn'],                                       ['330', '331', '332']],
  [['darmstadt'],                                       ['64']],
  [['neuss'],                                           ['414']],
  [['ingolstadt'],                                      ['85']],
  [['heilbronn'],                                       ['742', '743', '744']],
  [['pforzheim'],                                       ['753', '754']],
  [['wolfsburg'],                                       ['384', '385', '386']],
  [['erlangen'],                                        ['910', '911']],
  [['reutlingen'],                                      ['721', '722']],
  [['koblenz'],                                         ['56']],
  [['jena'],                                            ['07']],
  [['trier'],                                           ['54']],
  [['schwerin'],                                        ['19']],
  [['gera'],                                            ['075', '076']],
  [['hildesheim'],                                      ['31']],
  [['siegen'],                                          ['571', '572', '573']],
  [['gütersloh', 'guetersloh', 'gutersloh'],            ['333', '334']],
  [['cottbus', 'chóśebuz'],                             ['03']],
]

const CANONICAL: string[] = [
  'Köln','Düsseldorf','Frankfurt','Dortmund','Berlin','München','Hamburg','Leipzig','Nürnberg','Stuttgart','Essen',
  'Hannover','Bremen','Kiel','Rostock','Braunschweig','Magdeburg','Lübeck',
  'Bonn','Aachen','Münster','Bielefeld','Wuppertal','Bochum','Duisburg',
  'Augsburg','Freiburg im Breisgau','Ulm','Heidelberg','Karlsruhe','Mannheim','Regensburg','Würzburg',
  'Dresden','Chemnitz','Erfurt','Potsdam',
  'Wiesbaden','Mainz','Kassel','Saarbrücken','Göttingen',
  'Halle (Saale)','Mönchengladbach','Gelsenkirchen','Krefeld','Oberhausen',
  'Hagen','Hamm','Ludwigshafen am Rhein','Oldenburg','Osnabrück',
  'Leverkusen','Solingen','Paderborn','Darmstadt','Neuss',
  'Ingolstadt','Heilbronn','Pforzheim','Wolfsburg','Erlangen',
  'Reutlingen','Koblenz','Jena','Trier','Schwerin',
  'Gera','Hildesheim','Siegen','Gütersloh','Cottbus',
]

function matchCity(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  const norm = t.toLowerCase()
  // PLZ: 5-digit postal code — longest matching prefix wins
  if (/^\d{5}$/.test(t)) {
    let bestIdx = -1, bestLen = 0
    for (let i = 0; i < CITY_VARIANTS.length; i++) {
      for (const p of CITY_VARIANTS[i][1]) {
        if (t.startsWith(p) && p.length > bestLen) { bestIdx = i; bestLen = p.length }
      }
    }
    return bestIdx >= 0 ? CANONICAL[bestIdx] : null
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
  userLat: undefined,
  userLng: undefined,
}

const interFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

export default function App() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const handleInquire = (clinic: Clinic) => {
    const checkoutEventId = generateEventId()
    const checkoutData = { content_name: clinic.name, content_category: clinic.city }
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
  const [showBanner, setShowBanner] = useState<boolean>(() => getConsent() === null)
  const [variant] = useState<VariantKey>(() =>
    parseVariant(new URLSearchParams(window.location.search).get('v'))
  )
  const vt = VARIANTS[variant]
  const [ctaVariant] = useState<CTAVariant>(() => getCTAVariant())
  const ctaColor = getCTAColor(ctaVariant)

  useEffect(() => {
    loadGTM()
    // Clarity: only load if consent was already given in a previous session
    if (getConsent() === 'accepted') loadClarity()
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: 'cta_variant_assigned', cta_variant: ctaVariant })
  }, [])

  useEffect(() => {
    const cityParam = new URLSearchParams(window.location.search).get('city')
    if (cityParam) {
      const matched = matchCity(cityParam)
      if (matched) { setFilters(f => ({ ...f, searchCity: matched })); setAutoCity(matched) }
      return
    }
    fetch('/api/geo')
      .then(r => r.json())
      .then((data: { city?: string; postalCode?: string }) => {
        const matched = matchCity(data.postalCode ?? '') ?? matchCity(data.city ?? '')
        if (matched) { setFilters(f => ({ ...f, searchCity: matched })); setAutoCity(matched) }
      })
      .catch(() => {})
  }, [])

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
              <ResultsHeader
                count={filtered.length}
                filters={filters}
                setFilters={handleSetFilters}
                onOpenFilter={openFilter}
              />
              <ClinicList clinics={filtered} onInquire={handleInquire} filters={filters} setFilters={handleSetFilters} cardVariant={vt.card} selectedIds={selectedIds} onToggleSelect={toggleSelection} ctaColor={ctaColor} />
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
      {showBanner && (
        <CookieBanner
          onAccept={() => {
            setShowBanner(false)
            loadClarity()
            clarityEvent('cta_variant', ctaVariant)
          }}
          onDecline={() => setShowBanner(false)}
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
