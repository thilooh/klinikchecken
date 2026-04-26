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
  { name: 'Köln',                 plzPrefixes: ['50', '51'],             hint: 'PLZ 50xxx – 51xxx', lat: 50.938, lng:  6.960 },
  { name: 'Düsseldorf',           plzPrefixes: ['40', '41'],             hint: 'PLZ 40xxx – 41xxx', lat: 51.222, lng:  6.776 },
  { name: 'Frankfurt',            plzPrefixes: ['60', '61', '63'],       hint: 'PLZ 60xxx – 63xxx', lat: 50.111, lng:  8.682 },
  { name: 'Dortmund',             plzPrefixes: ['44'],                   hint: 'PLZ 44xxx',         lat: 51.514, lng:  7.465 },
  { name: 'Berlin',               plzPrefixes: ['10', '12', '13', '14'], hint: 'PLZ 10xxx – 14xxx', lat: 52.520, lng: 13.405 },
  { name: 'München',              plzPrefixes: ['80', '81', '85'],       hint: 'PLZ 80xxx – 85xxx', lat: 48.135, lng: 11.582 },
  { name: 'Hamburg',              plzPrefixes: ['20', '21', '22'],       hint: 'PLZ 20xxx – 22xxx', lat: 53.575, lng: 10.015 },
  { name: 'Leipzig',              plzPrefixes: ['04'],                   hint: 'PLZ 04xxx',         lat: 51.340, lng: 12.373 },
  { name: 'Nürnberg',             plzPrefixes: ['90', '91'],             hint: 'PLZ 90xxx – 91xxx', lat: 49.452, lng: 11.077 },
  { name: 'Stuttgart',            plzPrefixes: ['70', '71'],             hint: 'PLZ 70xxx – 71xxx', lat: 48.776, lng:  9.183 },
  { name: 'Essen',                plzPrefixes: ['45'],                   hint: 'PLZ 45xxx',         lat: 51.456, lng:  7.012 },
  { name: 'Hannover',             plzPrefixes: ['30', '31'],             hint: 'PLZ 30xxx – 31xxx', lat: 52.370, lng:  9.733 },
  { name: 'Bremen',               plzPrefixes: ['27', '28'],             hint: 'PLZ 27xxx – 28xxx', lat: 53.075, lng:  8.807 },
  { name: 'Kiel',                 plzPrefixes: ['24'],                   hint: 'PLZ 24xxx',         lat: 54.323, lng: 10.123 },
  { name: 'Rostock',              plzPrefixes: ['18'],                   hint: 'PLZ 18xxx',         lat: 54.092, lng: 12.099 },
  { name: 'Braunschweig',         plzPrefixes: ['38'],                   hint: 'PLZ 38xxx',         lat: 52.268, lng: 10.527 },
  { name: 'Magdeburg',            plzPrefixes: ['39'],                   hint: 'PLZ 39xxx',         lat: 52.131, lng: 11.640 },
  { name: 'Lübeck',               plzPrefixes: ['23'],                   hint: 'PLZ 23xxx',         lat: 53.867, lng: 10.686 },
  { name: 'Bonn',                 plzPrefixes: ['53'],                   hint: 'PLZ 53xxx',         lat: 50.735, lng:  7.099 },
  { name: 'Aachen',               plzPrefixes: ['52'],                   hint: 'PLZ 52xxx',         lat: 50.776, lng:  6.084 },
  { name: 'Münster',              plzPrefixes: ['48'],                   hint: 'PLZ 48xxx',         lat: 51.962, lng:  7.626 },
  { name: 'Bielefeld',            plzPrefixes: ['33'],                   hint: 'PLZ 33xxx',         lat: 52.021, lng:  8.532 },
  { name: 'Wuppertal',            plzPrefixes: ['42'],                   hint: 'PLZ 42xxx',         lat: 51.256, lng:  7.150 },
  { name: 'Bochum',               plzPrefixes: ['447', '448'],           hint: 'PLZ 447xx – 448xx', lat: 51.482, lng:  7.216 },
  { name: 'Duisburg',             plzPrefixes: ['47'],                   hint: 'PLZ 47xxx',         lat: 51.435, lng:  6.762 },
  { name: 'Augsburg',             plzPrefixes: ['86'],                   hint: 'PLZ 86xxx',         lat: 48.370, lng: 10.898 },
  { name: 'Freiburg im Breisgau', plzPrefixes: ['79'],                   hint: 'PLZ 79xxx',         lat: 47.995, lng:  7.842 },
  { name: 'Ulm',                  plzPrefixes: ['89'],                   hint: 'PLZ 89xxx',         lat: 48.401, lng:  9.992 },
  { name: 'Heidelberg',           plzPrefixes: ['69'],                   hint: 'PLZ 69xxx',         lat: 49.399, lng:  8.673 },
  { name: 'Karlsruhe',            plzPrefixes: ['76'],                   hint: 'PLZ 76xxx',         lat: 49.007, lng:  8.404 },
  { name: 'Mannheim',             plzPrefixes: ['68'],                   hint: 'PLZ 68xxx',         lat: 49.488, lng:  8.466 },
  { name: 'Regensburg',           plzPrefixes: ['93'],                   hint: 'PLZ 93xxx',         lat: 49.017, lng: 12.097 },
  { name: 'Würzburg',             plzPrefixes: ['97'],                   hint: 'PLZ 97xxx',         lat: 49.791, lng:  9.953 },
  { name: 'Dresden',              plzPrefixes: ['01'],                   hint: 'PLZ 01xxx',         lat: 51.050, lng: 13.738 },
  { name: 'Chemnitz',             plzPrefixes: ['09'],                   hint: 'PLZ 09xxx',         lat: 50.832, lng: 12.924 },
  { name: 'Erfurt',               plzPrefixes: ['99'],                   hint: 'PLZ 99xxx',         lat: 50.979, lng: 11.033 },
  { name: 'Potsdam',              plzPrefixes: ['144', '145', '146'],    hint: 'PLZ 144xx – 146xx', lat: 52.396, lng: 13.058 },
  { name: 'Wiesbaden',            plzPrefixes: ['65'],                   hint: 'PLZ 65xxx',         lat: 50.083, lng:  8.240 },
  { name: 'Mainz',                plzPrefixes: ['55'],                   hint: 'PLZ 55xxx',         lat: 49.998, lng:  8.271 },
  { name: 'Kassel',               plzPrefixes: ['34'],                   hint: 'PLZ 34xxx',         lat: 51.312, lng:  9.480 },
  { name: 'Saarbrücken',          plzPrefixes: ['66'],                   hint: 'PLZ 66xxx',         lat: 49.234, lng:  7.000 },
  { name: 'Göttingen',            plzPrefixes: ['37'],                   hint: 'PLZ 37xxx',         lat: 51.541, lng:  9.926 },
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
          {[{ n: '139', label: 'handverlesene Praxen' }, { n: '5.000+', label: 'Bewertungen' }, { n: '42', label: 'Städte verfügbar' }].map(stat => (
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
