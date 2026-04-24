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

export default function ClinicList({ clinics, onInquire, filters, setFilters, cardVariant }: Props) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  const handleMethodClick = (methodKey: string) => {
    const newMethods = filters.selectedMethods.includes(methodKey)
      ? filters.selectedMethods.filter(m => m !== methodKey)
      : [...filters.selectedMethods, methodKey]
    setFilters({ ...filters, selectedMethods: newMethods })
  }

  if (loading) {
    return <div>{[1, 2, 3].map(i => <SkeletonCard key={i} />)}</div>
  }

  if (clinics.length === 0) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #DDDDDD', borderRadius: '4px', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#333', marginBottom: '8px' }}>Keine Anbieter gefunden</div>
        <div style={{ color: '#666', fontSize: '13px' }}>Bitte passen Sie Ihre Filtereinstellungen an.</div>
      </div>
    )
  }

  return (
    <div>
      {clinics.map((clinic) => (
        <ClinicCard
          key={clinic.id}
          clinic={clinic}
          onInquire={onInquire}
          onMethodClick={handleMethodClick}
          activeMethodKeys={filters.selectedMethods}
          cardVariant={cardVariant}
        />
      ))}
    </div>
  )
}
