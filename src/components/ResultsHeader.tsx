import { useState } from 'react'
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import type { FilterState } from '../types/clinic'

interface Props {
  count: number
  filters: FilterState
  setFilters: (f: FilterState) => void
  onOpenFilter: () => void
}

const SORT_OPTIONS: { val: FilterState['sortBy']; label: string }[] = [
  { val: 'recommended', label: 'Empfohlen' },
  { val: 'price', label: 'Günstigste zuerst' },
  { val: 'rating', label: 'Beste Bewertung' },
  { val: 'distance', label: 'Nächste' },
]

export default function ResultsHeader({ count, filters, setFilters, onOpenFilter }: Props) {
  const [sortOpen, setSortOpen] = useState(false)

  const currentSort = SORT_OPTIONS.find(o => o.val === filters.sortBy)!
  const hasPriceFilter = filters.priceRange[0] > 50 || filters.priceRange[1] < 350
  const hasMethodFilter = filters.selectedMethods.length > 0
  const hasDistanceFilter = filters.maxDistance < 999

  const pill = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '5px',
    border: `1px solid ${active ? '#003399' : '#D0D0D0'}`,
    borderRadius: '20px', padding: '7px 14px',
    fontSize: '13px', fontWeight: 500,
    backgroundColor: active ? '#003399' : '#fff',
    color: active ? '#fff' : '#333',
    cursor: 'pointer', whiteSpace: 'nowrap' as const,
    flexShrink: 0,
  })

  const clearBtn: React.CSSProperties = {
    marginLeft: '2px', fontWeight: 700, opacity: 0.8,
    cursor: 'pointer', background: 'none', border: 'none',
    color: 'inherit', padding: '0 0 0 2px', fontSize: '13px',
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Top row: count + sort (sort pill desktop-only, outside scrollable container) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#333' }}>{count} Anbieter in {filters.searchCity}</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Ergebnisse werden täglich aktualisiert</div>
        </div>

        {/* Sort pill — desktop only, sits outside overflow container so dropdown is never clipped */}
        <div className="hidden sm:block" style={{ position: 'relative', flexShrink: 0, marginLeft: '8px' }}>
          <button onClick={() => setSortOpen(v => !v)} style={pill(filters.sortBy !== 'recommended')}>
            <ArrowUpDown size={13} />
            {currentSort.label}
            <ChevronDown size={12} />
          </button>
          {sortOpen && (
            <>
              <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, backgroundColor: '#fff', border: '1px solid #DDD', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 50, minWidth: '190px', overflow: 'hidden' }}>
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.val}
                    onClick={() => { setFilters({ ...filters, sortBy: opt.val }); setSortOpen(false) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: '13px', border: 'none', borderBottom: '1px solid #F5F5F5', backgroundColor: filters.sortBy === opt.val ? '#EEF2FF' : '#fff', color: filters.sortBy === opt.val ? '#003399' : '#333', cursor: 'pointer', fontWeight: filters.sortBy === opt.val ? 700 : 400 }}>
                    {opt.label}{filters.sortBy === opt.val && <span style={{ float: 'right' }}>✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Scrollable filter pills — no sort pill inside so overflow clipping can’t affect dropdowns */}
      <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>

        {/* Price pill */}
        <button onClick={onOpenFilter} style={pill(hasPriceFilter)}>
          {hasPriceFilter ? `${filters.priceRange[0]}–${filters.priceRange[1]} €` : 'Preis'}
          {hasPriceFilter && (
            <span style={clearBtn} onClick={e => { e.stopPropagation(); setFilters({ ...filters, priceRange: [50, 350] }) }}>×</span>
          )}
        </button>

        {/* Method pill */}
        <button onClick={onOpenFilter} style={pill(hasMethodFilter)}>
          {hasMethodFilter ? `Methode (${filters.selectedMethods.length})` : 'Methode'}
          {hasMethodFilter && (
            <span style={clearBtn} onClick={e => { e.stopPropagation(); setFilters({ ...filters, selectedMethods: [] }) }}>×</span>
          )}
        </button>

        {/* Distance pill */}
        <button onClick={onOpenFilter} style={pill(hasDistanceFilter)}>
          {hasDistanceFilter ? `bis ${filters.maxDistance} km` : 'Entfernung'}
          {hasDistanceFilter && (
            <span style={clearBtn} onClick={e => { e.stopPropagation(); setFilters({ ...filters, maxDistance: 999 }) }}>×</span>
          )}
        </button>

        {/* Mobile sort pill — opens filter sheet where sort lives */}
        <button className="sm:hidden" onClick={onOpenFilter} style={pill(filters.sortBy !== 'recommended')}>
          <ArrowUpDown size={13} />
          {filters.sortBy !== 'recommended' ? currentSort.label : 'Sortierung'}
        </button>

      </div>
    </div>
  )
}
