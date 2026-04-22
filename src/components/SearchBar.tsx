import { Search, MapPin } from 'lucide-react'
import type { FilterState } from '../types/clinic'
import { ALL_CITIES } from '../data/clinics'

interface Props {
  filters: FilterState
  setFilters: (f: FilterState) => void
}

export default function SearchBar({ filters, setFilters }: Props) {
  return (
    <div style={{
      background: 'linear-gradient(175deg, #002B5C 0%, #003F8A 100%)',
      padding: '22px 0 24px',
      borderBottom: '3px solid #0052CC',
    }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, textAlign: 'center', marginBottom: '4px', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Besenreiser Behandlung vergleichen
        </h1>
        <p style={{ color: '#7AAAE0', fontSize: '13px', textAlign: 'center', marginBottom: '18px' }}>
          Transparente Preise · Zertifizierte Kliniken · Kostenlose Anfrage
        </p>

        <div style={{ backgroundColor: '#fff', borderRadius: '6px', height: '50px', display: 'flex', alignItems: 'center', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
            <MapPin size={15} color="#0052CC" style={{ flexShrink: 0 }} />
            <select
              value={filters.searchCity}
              onChange={e => setFilters({ ...filters, searchCity: e.target.value })}
              style={{ border: 'none', outline: 'none', fontSize: '15px', fontWeight: 600, width: '100%', color: '#111', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              {ALL_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <button style={{ backgroundColor: '#0052CC', color: '#fff', fontWeight: 700, fontSize: '14px', height: '100%', padding: '0 28px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
            <Search size={14} />
            Suchen
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '16px', flexWrap: 'wrap' }}>
          {[{ n: '500+', label: 'geprüfte Anbieter' }, { n: '12.000+', label: 'Bewertungen' }, { n: '2', label: 'Städte verfügbar' }].map(stat => (
            <div key={stat.n} style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '15px', lineHeight: 1 }}>{stat.n}</div>
              <div style={{ color: '#7AAAE0', fontSize: '10px', marginTop: '3px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
