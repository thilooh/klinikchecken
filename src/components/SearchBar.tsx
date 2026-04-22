import { Search } from 'lucide-react'
import type { FilterState } from '../types/clinic'
import { ALL_CITIES } from '../data/clinics'

interface Props {
  filters: FilterState
  setFilters: (f: FilterState) => void
}

function BlobShapes() {
  return (
    <>
      {/* Large coral blob – top right */}
      <svg
        style={{ position: 'absolute', top: '-40px', right: '-50px', opacity: 0.75, pointerEvents: 'none' }}
        width="260" height="240" viewBox="0 0 260 240" fill="none"
      >
        <path
          d="M130,20 C175,8 220,40 238,85 C256,130 238,182 200,205 C162,228 108,222 72,195 C36,168 18,118 28,72 C38,26 85,32 130,20 Z"
          fill="#E8584E"
        />
      </svg>

      {/* Small salmon blob – bottom left */}
      <svg
        style={{ position: 'absolute', bottom: '-30px', left: '-35px', opacity: 0.5, pointerEvents: 'none' }}
        width="180" height="160" viewBox="0 0 180 160" fill="none"
      >
        <path
          d="M80,15 C115,5 150,30 158,65 C166,100 148,138 115,148 C82,158 42,142 22,110 C2,78 10,35 45,20 C60,13 65,20 80,15 Z"
          fill="#C8A45A"
        />
      </svg>

      {/* Tiny accent blob – top left */}
      <svg
        style={{ position: 'absolute', top: '10px', left: '60px', opacity: 0.3, pointerEvents: 'none' }}
        width="90" height="80" viewBox="0 0 90 80" fill="none"
      >
        <ellipse cx="45" cy="40" rx="45" ry="38" fill="#E8584E" />
      </svg>
    </>
  )
}

export default function SearchBar({ filters, setFilters }: Props) {
  return (
    <div style={{ backgroundColor: '#0B2057', padding: '14px 0 18px', position: 'relative', overflow: 'hidden' }}>
      <BlobShapes />

      <div className="max-w-[1200px] mx-auto px-4" style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, textAlign: 'center', marginBottom: '2px', letterSpacing: '-0.02em' }}>
          Besenreiser Behandlung vergleichen
        </h1>
        <p style={{ color: '#99BBFF', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>
          Preise, Methoden und Bewertungen von geprüften Kliniken
        </p>

        {/* Compact pill search – Check24 style */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '28px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          border: '2px solid #E8584E',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
            <Search size={15} color="#999" style={{ flexShrink: 0 }} />
            <select
              value={filters.searchCity}
              onChange={e => setFilters({ ...filters, searchCity: e.target.value })}
              style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: 500, width: '100%', color: '#222', backgroundColor: 'transparent', cursor: 'pointer' }}
            >
              {ALL_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div style={{ padding: '4px 4px 4px 0' }}>
            <button style={{
              backgroundColor: '#E8584E',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              height: '36px',
              padding: '0 22px',
              border: 'none',
              borderRadius: '22px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}>
              <Search size={14} />
              Suchen
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
