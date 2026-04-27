import { useState } from 'react'
import { ArrowUpDown, ChevronDown, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import type { FilterState } from '../types/clinic'

interface Props {
  count: number
  filters: FilterState
  setFilters: (f: FilterState) => void
  onOpenFilter: (section?: string) => void
}

const SORT_OPTIONS: { val: FilterState['sortBy']; label: string }[] = [
  { val: 'recommended', label: 'Empfohlen' },
  { val: 'rating', label: 'Beste Bewertung' },
  { val: 'distance', label: 'Nächste' },
]

export default function ResultsHeader({ count, filters, setFilters, onOpenFilter }: Props) {
  const [sortOpen, setSortOpen] = useState(false)
  const [mobileSortOpen, setMobileSortOpen] = useState(false)

  const hasMethodFilter = filters.selectedMethods.length > 0
  const hasDistanceFilter = filters.maxDistance < 999
  const hasAnyFilter = hasMethodFilter || hasDistanceFilter

  const pill = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '5px',
    border: `1px solid ${active ? '#003399' : '#D0D0D0'}`,
    borderRadius: '20px', padding: '8px 16px',
    fontSize: '14px', fontWeight: 500,
    backgroundColor: active ? '#003399' : '#fff',
    color: active ? '#fff' : '#333',
    cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0,
  })

  const clearBtn: React.CSSProperties = {
    marginLeft: '2px', fontWeight: 700, opacity: 0.8, cursor: 'pointer',
    background: 'none', border: 'none', color: 'inherit', padding: '0 0 0 2px', fontSize: '14px',
  }

  const sortMenuItems = (close: () => void) => (
    <div style={{ backgroundColor: '#fff', border: '1px solid #DDD', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', minWidth: '200px', overflow: 'hidden' }}>
      {SORT_OPTIONS.map(opt => (
        <button key={opt.val} onClick={() => { setFilters({ ...filters, sortBy: opt.val }); close() }}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: '14px', border: 'none', borderBottom: '1px solid #F5F5F5', backgroundColor: filters.sortBy === opt.val ? '#EEF2FF' : '#fff', color: filters.sortBy === opt.val ? '#003399' : '#333', cursor: 'pointer', fontWeight: filters.sortBy === opt.val ? 700 : 400 }}>
          {opt.label}{filters.sortBy === opt.val && <span style={{ float: 'right' }}>✓</span>}
        </button>
      ))}
    </div>
  )

  return (
    <div style={{ marginBottom: '12px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#333' }}>{filters.userLat != null ? `${count} Praxen in deiner Nähe` : `${count} geprüfte Praxen in ${filters.searchCity}`}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#F0FFF4', border: '1px solid #86EFAC', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, color: '#15803D', whiteSpace: 'nowrap' }}>
              <ShieldCheck size={11} strokeWidth={2.5} />
              Sortierung nach fachlichen Kriterien
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{filters.userLat != null ? 'Sortiert nach Entfernung zu deinem Standort.' : 'Sortiert nach Facharzt-Qualifikation, Patientenstimmen und Behandlungsvolumen.'}</div>
        </div>
        {/* Desktop sort button top-right */}
        <div className="hidden sm:block" style={{ position: 'relative', flexShrink: 0, marginLeft: '8px' }}>
          <button onClick={() => setSortOpen(v => !v)} style={pill(true)}>
            <ArrowUpDown size={14} />
            Sortiert
            <ChevronDown size={13} />
          </button>
          {sortOpen && (
            <>
              <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50 }}>
                {sortMenuItems(() => setSortOpen(false))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pills row - mobile only */}
      <div className="sm:hidden">
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-0.5">
          <button onClick={() => setMobileSortOpen(v => !v)} style={pill(true)}>
            <ArrowUpDown size={14} />
            Sortiert
            <ChevronDown size={13} />
          </button>
          <button onClick={() => onOpenFilter('filter')} style={pill(hasAnyFilter)}>
            <SlidersHorizontal size={14} />
            Filter
          </button>
          <button onClick={() => onOpenFilter('method')} style={pill(hasMethodFilter)}>
            {hasMethodFilter ? `Methode (${filters.selectedMethods.length})` : 'Methode'}
            {hasMethodFilter && <span style={clearBtn} onClick={e => { e.stopPropagation(); setFilters({ ...filters, selectedMethods: [] }) }}>×</span>}
          </button>
          <button onClick={() => onOpenFilter('distance')} style={pill(hasDistanceFilter)}>
            {hasDistanceFilter ? `bis ${filters.maxDistance} km` : 'Entfernung'}
            {hasDistanceFilter && <span style={clearBtn} onClick={e => { e.stopPropagation(); setFilters({ ...filters, maxDistance: 999 }) }}>×</span>}
          </button>
        </div>

        {/* Mobile sort dropdown - outside overflow container to avoid clipping */}
        {mobileSortOpen && (
          <>
            <div onClick={() => setMobileSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50 }}>
              {sortMenuItems(() => setMobileSortOpen(false))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
