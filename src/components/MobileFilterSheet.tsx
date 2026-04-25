import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import type { FilterState } from '../types/clinic'
import { ALL_METHODS } from '../data/clinics'

interface Props {
  filters: FilterState
  setFilters: (f: FilterState) => void
  count: number
  onClose: () => void
  initialSection?: string
}

const METHOD_MAP: Record<string, string> = {
  'Verödung (Sklerotherapie)': 'verödung',
  'Laser (Nd:YAG)': 'nd:yag',
  'Laser (Diode)': 'diode',
  'IPL-Behandlung': 'ipl',
  'Radiofrequenz': 'radiofrequenz',
}

const ROW: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '11px 0', borderBottom: '1px solid #F2F2F2', cursor: 'pointer',
}

export default function MobileFilterSheet({ filters, setFilters, count, onClose, initialSection = 'method' }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    method: initialSection === 'method',
    rating: initialSection === 'rating',
    extras: initialSection === 'extras',
    distance: initialSection === 'distance',
  })

  const toggle = (key: string) => setOpen(s => ({ ...s, [key]: !s[key] }))

  const resetAll = () => setFilters({
    ...filters,
    selectedMethods: [],
    minRating: 0,
    maxDistance: 999,
    extras: { freeConsultation: false, onlineBooking: false, evening: false, kassenpatient: false, ratenzahlung: false, parking: false, certified: true },
  })

  const SectionHead = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => toggle(id)} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      width: '100%', padding: '16px 20px', border: 'none', background: 'none',
      cursor: 'pointer', borderTop: '1px solid #EEEEEE',
    }}>
      <span style={{ fontWeight: 700, fontSize: '16px', color: '#222' }}>{label}</span>
      {open[id] ? <ChevronUp size={18} color="#555" /> : <ChevronDown size={18} color="#555" />}
    </button>
  )

  const radio: React.CSSProperties = { accentColor: '#003399', width: '19px', height: '19px', cursor: 'pointer', flexShrink: 0 }
  const check: React.CSSProperties = { accentColor: '#003399', width: '19px', height: '19px', cursor: 'pointer', flexShrink: 0 }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 290 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300, borderRadius: '16px 16px 0 0', backgroundColor: '#fff', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#111' }}>Wähle deine Filter aus</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 0 }}>
            <X size={22} color="#444" />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>

          <SectionHead id="method" label="Methode" />
          {open.method && (
            <div style={{ padding: '4px 20px 12px' }}>
              {ALL_METHODS.map(method => {
                const key = METHOD_MAP[method]
                const checked = filters.selectedMethods.includes(key)
                return (
                  <label key={method} style={ROW}>
                    <span style={{ fontSize: '14px', color: '#003399' }}>{method}</span>
                    <input type="checkbox" checked={checked}
                      onChange={() => {
                        const next = checked
                          ? filters.selectedMethods.filter(m => m !== key)
                          : [...filters.selectedMethods, key]
                        setFilters({ ...filters, selectedMethods: next })
                      }}
                      style={check} />
                  </label>
                )
              })}
            </div>
          )}

          <SectionHead id="rating" label="Bewertung" />
          {open.rating && (
            <div style={{ padding: '4px 20px 12px' }}>
              {[{ val: 0, label: 'Alle Bewertungen' }, { val: 3, label: '3+ Sterne ★★★' }, { val: 4, label: '4+ Sterne ★★★★' }, { val: 5, label: '5 Sterne ★★★★★' }].map(opt => (
                <label key={opt.val} style={ROW}>
                  <span style={{ fontSize: '14px', color: '#003399' }}>{opt.label}</span>
                  <input type="radio" name="mobileRating" checked={filters.minRating === opt.val}
                    onChange={() => setFilters({ ...filters, minRating: opt.val })} style={radio} />
                </label>
              ))}
            </div>
          )}

          <SectionHead id="extras" label="Extras" />
          {open.extras && (
            <div style={{ padding: '4px 20px 12px' }}>
              {[
                { key: 'freeConsultation' as const, label: 'Kostenlose Erstberatung' },
                { key: 'onlineBooking' as const, label: 'Online-Terminbuchung' },
                { key: 'evening' as const, label: 'Abendtermine verfügbar' },
                { key: 'kassenpatient' as const, label: 'GKV-Abrechnung möglich' },
                { key: 'ratenzahlung' as const, label: 'Ratenzahlung möglich' },
                { key: 'parking' as const, label: 'Parkplätze vorhanden' },
              ].map(item => (
                <label key={item.key} style={ROW}>
                  <span style={{ fontSize: '14px', color: '#003399' }}>{item.label}</span>
                  <input type="checkbox" checked={filters.extras[item.key]}
                    onChange={() => setFilters({ ...filters, extras: { ...filters.extras, [item.key]: !filters.extras[item.key] } })}
                    style={check} />
                </label>
              ))}
            </div>
          )}

          <SectionHead id="distance" label="Entfernung" />
          {open.distance && (
            <div style={{ padding: '4px 20px 12px' }}>
              {[{ val: 5, label: 'bis 5 km' }, { val: 10, label: 'bis 10 km' }, { val: 20, label: 'bis 20 km' }, { val: 30, label: 'bis 30 km' }, { val: 999, label: 'Beliebig' }].map(opt => (
                <label key={opt.val} style={ROW}>
                  <span style={{ fontSize: '14px', color: '#003399' }}>{opt.label}</span>
                  <input type="radio" name="mobileDistance" checked={filters.maxDistance === opt.val}
                    onChange={() => setFilters({ ...filters, maxDistance: opt.val })} style={radio} />
                </label>
              ))}
            </div>
          )}

          <div style={{ height: '8px' }} />
        </div>

        <div style={{ borderTop: '1px solid #E8E8E8', padding: '14px 20px 20px', display: 'flex', gap: '12px', flexShrink: 0, backgroundColor: '#fff' }}>
          <button onClick={resetAll} style={{ flex: 1, background: 'none', border: 'none', fontSize: '14px', fontWeight: 600, color: '#444', cursor: 'pointer', padding: '14px 0' }}>
            Filter entfernen
          </button>
          <button onClick={onClose} style={{ flex: 2, backgroundColor: '#FF6600', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px 0', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>
            Zeige {count} Ergebnisse
          </button>
        </div>
      </div>
    </>
  )
}
