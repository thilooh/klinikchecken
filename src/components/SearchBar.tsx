import { Search, ChevronDown } from 'lucide-react'
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

        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '4px',
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {/* Treatment dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', borderRight: '1px solid #DDD', height: '100%', minWidth: '160px', cursor: 'pointer', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#333' }}>Besenreiser</span>
            <ChevronDown size={14} color="#666" />
          </div>

          {/* City select */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px' }}>
            <Search size={16} color="#999" />
            <select
              value={filters.searchCity}
              onChange={e => setFilters({ ...filters, searchCity: e.target.value })}
              style={{ border: 'none', outline: 'none', fontSize: '14px', width: '100%', color: '#333', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              {ALL_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Method dropdown */}
          <div className="hidden sm:flex" style={{ alignItems: 'center', padding: '0 12px', borderLeft: '1px solid #DDD', height: '100%', minWidth: '130px', cursor: 'pointer', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Methode</span>
            <ChevronDown size={14} color="#666" />
          </div>

          {/* Price dropdown */}
          <div className="hidden md:flex" style={{ alignItems: 'center', padding: '0 12px', borderLeft: '1px solid #DDD', height: '100%', minWidth: '110px', cursor: 'pointer', gap: '6px' }}>
            <span style={{ fontSize: '13px', color: '#666' }}>Preis</span>
            <ChevronDown size={14} color="#666" />
          </div>

          {/* Search button */}
          <button
            style={{
              backgroundColor: '#FF6600',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              height: '100%',
              width: '160px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            <Search size={16} />
            Suchen
          </button>
        </div>
      </div>
    </div>
  )
}
