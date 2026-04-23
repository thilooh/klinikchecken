import { useState } from 'react'
import type { FilterState } from '../types/clinic'
import { ALL_METHODS } from '../data/clinics'

interface Props {
  filters: FilterState
  setFilters: (f: FilterState) => void
}

const S = {
  section: { borderBottom: '1px solid #EEEEEE', paddingBottom: '14px', marginBottom: '14px' } as React.CSSProperties,
  sectionTitle: { fontWeight: 700, fontSize: '12px', textTransform: 'uppercase' as const, color: '#333', marginBottom: '10px', letterSpacing: '0.5px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#333', cursor: 'pointer', padding: '3px 0' } as React.CSSProperties,
  hint: { fontSize: '11px', color: '#999', marginTop: '6px', lineHeight: '1.4' } as React.CSSProperties,
}

const METHOD_GUIDE = [
  { name: 'Verödung', desc: 'Injektion eines Verschäumungsmittels direkt ins Gefäß – besonders effektiv für kleine bis mittelgroße Besenreiser.' },
  { name: 'Nd:YAG Laser', desc: 'Laser-Energie durch die Haut – ideal für tiefere, blaue Adern und größere Gefäße.' },
  { name: 'Diode Laser', desc: 'Ähnlich wie Nd:YAG, besonders schonend – gut bei heller Haut und feinen roten Äderchen.' },
  { name: 'IPL', desc: 'Breitbandlicht für sehr feine, oberflächliche Rötungen und haarfädige Gefäße.' },
  { name: 'Radiofrequenz', desc: 'Wärmebehandlung für hartnäckige Gefäße – wird oft kombiniert mit Verödung eingesetzt.' },
]

function StarDisplay({ count }: { count: number }) {
  return <span style={{ color: '#FFB400' }}>{'★'.repeat(count)}{'☆'.repeat(5 - count)}</span>
}

export default function Sidebar({ filters, setFilters }: Props) {
  const [showMethodGuide, setShowMethodGuide] = useState(false)

  const methodMap: Record<string, string> = {
    'Verödung (Sklerotherapie)': 'verödung',
    'Laser (Nd:YAG)': 'nd:yag',
    'Laser (Diode)': 'diode',
    'IPL-Behandlung': 'ipl',
    'Radiofrequenz': 'radiofrequenz',
  }

  const toggleMethod = (method: string) => {
    const key = methodMap[method]
    const newMethods = filters.selectedMethods.includes(key)
      ? filters.selectedMethods.filter(m => m !== key)
      : [...filters.selectedMethods, key]
    setFilters({ ...filters, selectedMethods: newMethods })
  }

  const toggleExtra = (key: keyof FilterState['extras']) => {
    setFilters({ ...filters, extras: { ...filters.extras, [key]: !filters.extras[key] } })
  }

  const resetAll = () => {
    setFilters({
      ...filters,
      selectedMethods: [],
      minRating: 0,
      maxDistance: 10,
      extras: { freeConsultation: false, onlineBooking: false, evening: false, kassenpatient: false, ratenzahlung: false, parking: false, certified: true },
    })
  }

  return (
    <aside style={{ backgroundColor: '#fff', border: '1px solid #DDDDDD', borderRadius: '4px', padding: '16px', width: '240px', flexShrink: 0, alignSelf: 'flex-start', position: 'sticky', top: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontWeight: 700, fontSize: '14px' }}>Filter</span>
        <button onClick={resetAll} style={{ color: '#003399', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Alle zurücksetzen</button>
      </div>

      {/* Methode */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Methode</div>
        {ALL_METHODS.map(method => {
          const key = methodMap[method]
          return (
            <label key={method} style={S.label}>
              <input
                type="checkbox"
                checked={filters.selectedMethods.includes(key)}
                onChange={() => toggleMethod(method)}
                style={{ accentColor: '#003399', cursor: 'pointer' }}
              />
              {method}
            </label>
          )
        })}

        {/* Method guide toggle */}
        <button
          onClick={() => setShowMethodGuide(v => !v)}
          style={{ marginTop: '8px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#003399', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span style={{ fontSize: '13px' }}>{showMethodGuide ? '▼' : '▶'}</span>
          Welche Methode passt zu mir?
        </button>

        {showMethodGuide && (
          <div style={{ marginTop: '8px', backgroundColor: '#F7F9FF', border: '1px solid #DDE3F5', borderRadius: '4px', padding: '10px' }}>
            {METHOD_GUIDE.map(m => (
              <div key={m.name} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#003399', marginBottom: '2px' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.4' }}>{m.desc}</div>
              </div>
            ))}
            <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', borderTop: '1px solid #DDE3F5', paddingTop: '6px' }}>Die beste Methode wird beim Erstberatungsgespräch individuell bestimmt.</div>
          </div>
        )}
      </div>

      {/* Bewertung */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Bewertung</div>
        {[{ val: 0, label: 'Alle Bewertungen' }, { val: 3, label: '3+ Sterne' }, { val: 4, label: '4+ Sterne' }, { val: 5, label: '5 Sterne' }].map(opt => (
          <label key={opt.val} style={S.label}>
            <input type="radio" name="rating" checked={filters.minRating === opt.val} onChange={() => setFilters({ ...filters, minRating: opt.val })} style={{ accentColor: '#003399', cursor: 'pointer' }} />
            {opt.val === 0 ? opt.label : <><StarDisplay count={opt.val} /> {opt.val}+ Sterne</>}
          </label>
        ))}
      </div>

      {/* Entfernung */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Entfernung</div>
        {[{ val: 5, label: 'bis 5 km' }, { val: 10, label: 'bis 10 km' }, { val: 20, label: 'bis 20 km' }, { val: 30, label: 'bis 30 km' }, { val: 999, label: 'beliebig' }].map(opt => (
          <label key={opt.val} style={S.label}>
            <input type="radio" name="distance" checked={filters.maxDistance === opt.val} onChange={() => setFilters({ ...filters, maxDistance: opt.val })} style={{ accentColor: '#003399', cursor: 'pointer' }} />
            {opt.label}
          </label>
        ))}
      </div>

      {/* Extras */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Extras</div>
        {[
          { key: 'freeConsultation' as const, label: 'Kostenlose Erstberatung' },
          { key: 'onlineBooking' as const, label: 'Online-Terminbuchung' },
          { key: 'evening' as const, label: 'Abendtermine verfügbar' },
          { key: 'parking' as const, label: 'Parkplätze vorhanden' },
        ].map(item => (
          <label key={item.key} style={S.label}>
            <input type="checkbox" checked={filters.extras[item.key]} onChange={() => toggleExtra(item.key)} style={{ accentColor: '#003399', cursor: 'pointer' }} />
            {item.label}
          </label>
        ))}
      </div>

      {/* Abrechnungsart */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Abrechnungsart</div>
        <label style={S.label}>
          <input type="checkbox" checked={filters.extras.kassenpatient} onChange={() => toggleExtra('kassenpatient')} style={{ accentColor: '#003399', cursor: 'pointer' }} />
          GKV-Abrechnung möglich
        </label>
        <label style={S.label}>
          <input type="checkbox" checked={filters.extras.ratenzahlung} onChange={() => toggleExtra('ratenzahlung')} style={{ accentColor: '#003399', cursor: 'pointer' }} />
          Ratenzahlung möglich
        </label>
        <div style={S.hint}>Besenreiser sind in der Regel keine GKV-Leistung und werden meist als IGeL privat abgerechnet.</div>
      </div>

      {/* Qualifikation */}
      <div>
        <div style={S.sectionTitle}>Arzt-Qualifikation</div>
        <label style={S.label}>
          <input type="checkbox" style={{ accentColor: '#003399' }} />
          Facharzt für Dermatologie
        </label>
        <label style={S.label}>
          <input type="checkbox" style={{ accentColor: '#003399' }} />
          Phlebologe
        </label>
        <label style={S.label}>
          <input type="checkbox" checked={filters.extras.certified} onChange={() => toggleExtra('certified')} style={{ accentColor: '#003399', cursor: 'pointer' }} />
          Aesthetiq-zertifiziert
        </label>
      </div>
    </aside>
  )
}
