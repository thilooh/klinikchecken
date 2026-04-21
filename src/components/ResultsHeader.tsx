import { useState } from 'react'
import type { FilterState } from '../types/clinic'
import { ChevronDown } from 'lucide-react'

interface Props {
  count: number
  filters: FilterState
  setFilters: (f: FilterState) => void
}

export default function ResultsHeader({ count, filters, setFilters }: Props) {
  const [showTooltip, setShowTooltip] = useState(false)

  const sortOptions: { val: FilterState['sortBy']; label: string }[] = [
    { val: 'recommended', label: 'Beste Bewertung' },
    { val: 'price', label: 'Günstigste zuerst' },
    { val: 'rating', label: 'Meiste Bewertungen' },
    { val: 'distance', label: 'Nächste' },
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#333' }}>{count} Anbieter in {filters.searchCity}</div>
        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Ergebnisse werden täglich aktualisiert</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', color: '#666' }}>Sortieren:</span>

        {/* Tooltip for ranking explanation */}
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <span
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#E8EEF4', color: '#003399', fontSize: '10px', fontWeight: 700, cursor: 'default' }}
          >
            ?
          </span>
          {showTooltip && (
            <div style={{ position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', color: '#fff', fontSize: '11px', padding: '6px 10px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: 20, lineHeight: '1.5' }}>
              Ranking basiert auf Bewertung<br />und Anzahl der Bewertungen.
            </div>
          )}
        </div>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <select
            value={filters.sortBy}
            onChange={e => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            style={{ border: '1px solid #DDD', borderRadius: '4px', padding: '5px 28px 5px 10px', fontSize: '13px', color: '#333', backgroundColor: '#fff', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', outline: 'none' }}
          >
            {sortOptions.map(opt => (
              <option key={opt.val} value={opt.val}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} color="#666" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  )
}
