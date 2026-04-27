import { useEffect, useState } from 'react'
import type { Clinic, FilterState } from '../types/clinic'
import type { VariantConfig } from '../variants'
import ClinicCard from './ClinicCard'

interface Props {
  clinics: Clinic[]
  onInquire: (clinic: Clinic) => void
  filters: FilterState
  setFilters: (f: FilterState) => void
  cardVariant: VariantConfig['card']
  selectedIds: Set<number>
  onToggleSelect: (clinic: Clinic) => void
  ctaColor: string
}

function SkeletonCard() {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #DDDDDD', borderRadius: '4px', padding: '16px', marginBottom: '8px', display: 'flex', gap: '14px' }}>
      <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '4px', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: '16px', width: '60%', borderRadius: '4px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '12px', width: '80%', borderRadius: '4px', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '12px', width: '50%', borderRadius: '4px', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '20px', width: '40%', borderRadius: '4px' }} />
      </div>
      <div style={{ width: '140px', flexShrink: 0 }}>
        <div className="skeleton" style={{ height: '30px', width: '80px', borderRadius: '4px', marginBottom: '8px', marginLeft: 'auto' }} />
        <div className="skeleton" style={{ height: '36px', borderRadius: '4px', marginBottom: '6px' }} />
        <div className="skeleton" style={{ height: '32px', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

export default function ClinicList({ clinics, onInquire, filters, setFilters, cardVariant, selectedIds, onToggleSelect, ctaColor }: Props) {
  const [loading, setLoading] = useState(true)
  const hasUserCoords = filters.userLat != null && filters.userLng != null

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return <div>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
  }

  if (clinics.length === 0) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #DDDDDD', borderRadius: '4px', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>📍</div>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#333', marginBottom: '8px' }}>Keine Praxen gefunden</div>
        <div style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
          Für diese Stadt oder PLZ haben wir noch keine Praxen in unserer Datenbank.<br />
          Versuche eine andere Stadt oder passe die Filter an.
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt'].map(city => (
            <button key={city} onClick={() => setFilters({ ...filters, searchCity: city })}
              style={{ padding: '7px 16px', border: '1px solid #0052CC', borderRadius: '20px', color: '#0052CC', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
              {city}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {clinics.map((clinic, index) => (
        <ClinicCard
          key={clinic.id}
          clinic={clinic}
          index={index}
          onInquire={onInquire}
          cardVariant={cardVariant}
          isSelected={selectedIds.has(clinic.id)}
          onToggleSelect={() => onToggleSelect(clinic)}
          ctaColor={ctaColor}
          hasUserCoords={hasUserCoords}
        />
      ))}
    </div>
  )
}
