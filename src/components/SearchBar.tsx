import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import type { FilterState } from '../types/clinic'

interface Props {
  filters: FilterState
  setFilters: (f: FilterState) => void
}

const CITIES = [
  { name: 'Köln', plzPrefixes: ['50', '51'], hint: 'PLZ 50xxx – 51xxx' },
  { name: 'Düsseldorf', plzPrefixes: ['40', '41'], hint: 'PLZ 40xxx – 41xxx' },
]

function resolveCity(raw: string): string {
  const t = raw.trim()
  if (!t) return raw
  const lower = t.toLowerCase()
  const exact = CITIES.find(c => c.name.toLowerCase() === lower)
  if (exact) return exact.name
  if (/^\d/.test(t)) {
    const byPlz = CITIES.find(c => c.plzPrefixes.some(p => t.startsWith(p)))
    if (byPlz) return byPlz.name
  }
  const partial = CITIES.find(c => c.name.toLowerCase().startsWith(lower))
  if (partial) return partial.name
  return t
}

function getMatches(input: string) {
  const t = input.trim().toLowerCase()
  if (!t) return CITIES
  return CITIES.filter(c =>
    c.name.toLowerCase().includes(t) ||
    (/^\d/.test(t) && c.plzPrefixes.some(p => p.startsWith(t) || t.startsWith(p)))
  )
}

export default function SearchBar({ filters, setFilters }: Props) {
  const [val, setVal] = useState(filters.searchCity)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const matches = getMatches(val)

  const apply = (cityName: string) => {
    setVal(cityName)
    setFilters({ ...filters, searchCity: cityName })
    setShowSuggestions(false)
  }

  const handleSearch = () => apply(resolveCity(val))

  return (
    <div style={{ background: 'linear-gradient(175deg, #002B5C 0%, #003F8A 100%)', padding: '22px 0 24px', borderBottom: '3px solid #0052CC' }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '6px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
          Die richtige Praxis für deine Besenreiser. Ohne Pfusch.
        </h1>
        <p style={{ color: '#7AAAE0', fontSize: '15px', textAlign: 'center', marginBottom: '18px', lineHeight: 1.5 }}>
          Wir haben 100+ Phlebologen, Dermatologen und Venenzentren geprüft.
        </p>

        <div style={{ position: 'relative' }}>
          {showSuggestions && (
            <div onClick={() => setShowSuggestions(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }} />
          )}
          <div style={{ backgroundColor: '#fff', borderRadius: '6px', height: '52px', display: 'flex', alignItems: 'center', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', position: 'relative', zIndex: 2 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
              <MapPin size={16} color="#0052CC" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Stadt oder PLZ eingeben …"
                value={val}
                onChange={e => { setVal(e.target.value); setShowSuggestions(true) }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                style={{ border: 'none', outline: 'none', fontSize: '16px', fontWeight: 600, width: '100%', color: '#111', backgroundColor: 'transparent' }}
              />
            </div>
            <button onClick={handleSearch} style={{ backgroundColor: '#0052CC', color: '#fff', fontWeight: 700, fontSize: '15px', height: '100%', padding: '0 28px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
              <Search size={15} />
              Suchen
            </button>
          </div>

          {showSuggestions && matches.length > 0 && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 10, overflow: 'hidden' }}>
              {matches.map((city, i) => (
                <button key={city.name} onClick={() => apply(city.name)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '13px 16px', border: 'none', borderBottom: i < matches.length - 1 ? '1px solid #F2F2F2' : 'none', backgroundColor: city.name === filters.searchCity ? '#EEF4FF' : '#fff', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: '34px', height: '34px', backgroundColor: '#EEF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={15} color="#0052CC" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>{city.name}</div>
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '1px' }}>{city.hint}</div>
                  </div>
                  {city.name === filters.searchCity && <span style={{ color: '#0052CC', fontWeight: 700, fontSize: '15px' }}>✓</span>}
                </button>
              ))}
              <div style={{ padding: '9px 16px', fontSize: '12px', color: '#999', backgroundColor: '#F9FAFB', borderTop: '1px solid #F0F0F0' }}>Weitere Städte folgen bald</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '28px', marginTop: '18px', flexWrap: 'wrap' }}>
          {[{ n: '500+', label: 'geprüfte Anbieter' }, { n: '12.000+', label: 'Bewertungen' }, { n: '2', label: 'Städte verfügbar' }].map(stat => (
            <div key={stat.n} style={{ textAlign: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '16px', lineHeight: 1 }}>{stat.n}</div>
              <div style={{ color: '#7AAAE0', fontSize: '12px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
