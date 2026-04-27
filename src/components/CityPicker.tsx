// Empty-state hero element shown when we couldn't auto-detect a city
// (no URL ?city, no localStorage, no IP-geo, no Bundesland fallback).
// Acts as the explicit picker so users from regions where IP-geo fails
// don't get silently dropped into Köln.

import type { Clinic } from '../types/clinic'

const TOP_CITIES = ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Düsseldorf', 'Stuttgart', 'Leipzig']

interface Props {
  clinics: Clinic[]
  onPick: (city: string) => void
}

export default function CityPicker({ clinics, onPick }: Props) {
  // Show top cities first if we list clinics there, otherwise hide them.
  const cityCounts = new Map<string, number>()
  for (const c of clinics) cityCounts.set(c.city, (cityCounts.get(c.city) ?? 0) + 1)
  const topAvailable = TOP_CITIES.filter(c => cityCounts.has(c))
  const moreCities = Array.from(cityCounts.keys())
    .filter(c => !TOP_CITIES.includes(c))
    .sort()

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
      <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0A1F44', marginBottom: '4px', textAlign: 'center' }}>
        📍 Wo möchtest du behandelt werden?
      </h2>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>
        Wähle deine Stadt - oder gib oben deine Adresse / PLZ ein.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        {topAvailable.map(city => (
          <button key={city} onClick={() => onPick(city)} style={{
            backgroundColor: '#F4F7FF', border: '1px solid #DDE3F5', borderRadius: '6px',
            padding: '12px 10px', cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '2px',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EAF0FF'; e.currentTarget.style.borderColor = '#003399' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F4F7FF'; e.currentTarget.style.borderColor = '#DDE3F5' }}>
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0A1F44' }}>{city}</span>
            <span style={{ fontSize: '11px', color: '#666' }}>{cityCounts.get(city)} Praxen</span>
          </button>
        ))}
      </div>

      {moreCities.length > 0 && (
        <details style={{ borderTop: '1px solid #EEE', paddingTop: '12px' }}>
          <summary style={{ cursor: 'pointer', fontSize: '13px', color: '#0052CC', fontWeight: 600 }}>
            Alle {moreCities.length + topAvailable.length} Städte ▾
          </summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: '12px' }}>
            {moreCities.map(city => (
              <button key={city} onClick={() => onPick(city)} style={{
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                color: '#0052CC', fontSize: '13px',
              }}>
                {city} <span style={{ color: '#888' }}>({cityCounts.get(city)})</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
