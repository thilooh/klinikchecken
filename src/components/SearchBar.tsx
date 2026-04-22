import { Search } from 'lucide-react'
import type { FilterState } from '../types/clinic'
import { ALL_CITIES } from '../data/clinics'

interface Props {
  filters: FilterState
  setFilters: (f: FilterState) => void
}

export default function SearchBar({ filters, setFilters }: Props) {
  return (
    <div style={{ backgroundColor: '#003399', padding: '16px 0 20px' }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}>
          Besenreiser Behandlung vergleichen
        </h1>
        <p style={{ color: '#99BBFF', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
          Vergleiche Preise, Methoden und Bewertungen von geprüften Kliniken
        </p>
        <div style={{ backgroundColor: '#fff', borderRadius: '4px', height: '52px', display: 'flex', alignItems: 'center', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px' }}>
            <Search size={16} color="#999" style={{ flexShrink: 0 }} />
            <select
              value={filters.searchCity}
              onChange={e => setFilters({ ...filters, searchCity: e.target.value })}
              style={{ border: 'none', outline: 'none', fontSize: '15px', width: '100%', color: '#333', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              {ALL_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <button
            style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '15px', height: '100%', padding: '0 28px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexShrink: 0 }}
          >
            <Search size={16} />
            Suchen
          </button>
        </div>
      </div>
    </div>
  )
}
