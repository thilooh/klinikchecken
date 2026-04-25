import { useState } from 'react'
import { Search, MapPin, Navigation } from 'lucide-react'
import type { FilterState } from '../types/clinic'
import { sendEvent } from '../lib/gtm'

interface Props {
  filters: FilterState
  setFilters: (f: FilterState) => void
  hero: { headline: string; subheadline: string }
}

const CITIES = [
  { name: 'Köln',        plzPrefixes: ['50', '51'],             hint: 'PLZ 50xxx – 51xxx', lat: 50.938, lng: 6.960 },
  { name: 'Düsseldorf',  plzPrefixes: ['40', '41'],             hint: 'PLZ 40xxx – 41xxx', lat: 51.222, lng: 6.776 },
  { name: 'Frankfurt',   plzPrefixes: ['60', '61', '63', '65'], hint: 'PLZ 60xxx – 65xxx', lat: 50.111, lng: 8.682 },
  { name: 'Dortmund',    plzPrefixes: ['44'],                   hint: 'PLZ 44xxx',         lat: 51.514, lng: 7.465 },
  { name: 'Berlin',      plzPrefixes: ['10', '12', '13', '14'], hint: 'PLZ 10xxx – 14xxx', lat: 52.520, lng: 13.405 },
  { name: 'München',     plzPrefixes: ['80', '81', '85'],       hint: 'PLZ 80xxx – 81xxx', lat: 48.135, lng: 11.582 },
  { name: 'Hamburg',     plzPrefixes: ['20', '21', '22'],       hint: 'PLZ 20xxx – 22xxx', lat: 53.575, lng: 10.015 },
  { name: 'Leipzig',     plzPrefixes: ['04'],                   hint: 'PLZ 04xxx',         lat: 51.340, lng: 12.373 },
  { name: 'Nürnberg',   plzPrefixes: ['90', '91'],             hint: 'PLZ 90xxx – 91xxx', lat: 49.452, lng: 11.077 },
  { name: 'Stuttgart',   plzPrefixes: ['70', '71'],             hint: 'PLZ 70xxx – 71xxx', lat: 48.776, lng: 9.183 },
  { name: 'Essen',       plzPrefixes: ['45'],                   hint: 'PLZ 45xxx',         lat: 51.456, lng: 7.012 },
]

function nearestCity(lat: number, lng: number): string {
  return CITIES.reduce((best, city) =>
    Math.hypot(lat - city.lat, lng - city.lng) < Math.hypot(lat - best.lat, lng - best.lng) ? city : best
  ).name
}

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
  if (CITIES.some(c => c.name.toLowerCase() === t)) return CITIES
  return CITIES.filter(c =>
    c.name.toLowerCase().includes(t) ||
    (/^\d/.test(t) && c.plzPrefixes.some(p => p.startsWith(t) || t.startsWith(p)))
  )
}

export default function SearchBar({ filters, setFilters, hero }: Props) {
  const [val, setVal] = useState(filters.searchCity)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState(false)

  const matches = getMatches(val)

  const apply = (cityName: string, source: 'user' | 'geo' = 'user') => {
    setVal(cityName)
    setFilters({ ...filters, searchCity: cityName })
    setShowSuggestions(false)
    if (source === 'user') sendEvent('Search', { search_string: cityName })
  }

  const handleSearch = () => apply(resolveCity(val))

  const handleGeolocate = () => {
    if (!navigator.geolocation || locating) return
    setLocating(true)
    setLocError(false)
    navigator.geolocation.getCurrentPosition(
      pos => {
        apply(nearestCity(pos.coords.latitude, pos.coords.longitude), 'user')
        setLocating(false)
      },
      () => { setLocating(false); setLocError(true) },
      { timeout: 10000 }
    )
  }

  return (
    <div style={{ background: 'linear-gradient(175deg, #002B5C 0%, #003F8A 100%)', padding: '22px 0 24px', borderBottom: '3px solid #0052CC' }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '6px', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
          {hero.headline}
        </h1>
        <p style={{ color: '#7AAAE0', fontSize: '15px', textAlign: 'center', marginBottom: '18px', lineHeight: 1.5 }}>
          {hero.subheadline}
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
            <button
              onClick={handleGeolocate}
              disabled={locating}
              title="Mein Standort verwenden"
              style={{ height: '100%', padding: '0 14px', border: 'none', borderRight: '1px solid #E8E8E8', background: 'none', cursor: 'pointer', color: locating ? '#AAC' : '#0052CC', display: 'flex', alignItems: 'center', flexShrink: 0 }}
            >
              <Navigation size={17} style={{ transform: locating ? 'none' : undefined, opacity: locating ? 0.5 : 1 }} />
            </button>
            <button onClick={handleSearch} style={{ backgroundColor: '#0052CC', color: '#fff', fontWeight: 700, fontSize: '15px', height: '100%', padding: '0 28px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
              <Search size={15} />
              Suchen
            </button>
          </div>

          {locError && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, textAlign: 'center', color: '#FFB5B5', fontSize: '13px', pointerEvents: 'none' }}>
              Standort konnte nicht ermittelt werden - bitte manuell eingeben.
            </div>
          )}

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
          {[{ n: '55', label: 'handverlesene Praxen' }, { n: '5.000+', label: 'Bewertungen' }, { n: '11', label: 'Städte verfügbar' }].map(stat => (
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
