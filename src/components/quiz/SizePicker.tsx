// Step 3 size picker. Four stylised SVG illustrations of different
// vein patterns on a hautfarben background. Schematic only - no
// patient photographs (HWG: keine bildliche Darstellung des
// Behandlungsergebnisses am Patienten).
//
// Each illustration shows the same skin patch with progressively
// denser / coarser vessel networks:
//   fein       — sparse hair-thin lines
//   mittel     — clearly visible thin branches
//   groesser   — thicker tortuous knot
//   flaechig   — netzartig dense web
//
// On mobile the four cards lay out 2x2; on desktop they remain 2x2
// but with slightly more breathing room.

interface Props {
  selected: string | null
  onSelect: (value: 'fein' | 'mittel' | 'groesser' | 'flaechig') => void
}

const SKIN = '#F8E0D0'
const VESSEL = '#A03030'

type SizeKey = 'fein' | 'mittel' | 'groesser' | 'flaechig'

const OPTIONS: Array<{ key: SizeKey; label: string; sub: string }> = [
  { key: 'fein',     label: 'Sehr fein',  sub: '< 0,2 mm' },
  { key: 'mittel',   label: 'Mittel',     sub: '0,2–1 mm' },
  { key: 'groesser', label: 'Größer',     sub: '> 1 mm' },
  { key: 'flaechig', label: 'Flächig',    sub: 'netzartig' },
]

// Each illustration is a stand-alone SVG snippet rendered into a
// 140x140 viewport. Background is the skin patch; vessels are
// drawn as red strokes of varying width and complexity.
function Illustration({ size }: { size: SizeKey }) {
  return (
    <svg viewBox="0 0 140 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect x="0" y="0" width="140" height="140" rx="6" fill={SKIN} />
      {size === 'fein' && (
        <g stroke={VESSEL} strokeWidth="0.8" fill="none" strokeLinecap="round">
          <path d="M 30 40 Q 50 50 70 45" />
          <path d="M 60 70 Q 80 65 95 80" />
          <path d="M 35 95 Q 55 100 75 95" />
          <path d="M 45 60 Q 50 55 60 60" />
          <path d="M 80 105 L 100 110" />
        </g>
      )}
      {size === 'mittel' && (
        <g stroke={VESSEL} strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M 25 50 Q 50 45 75 55 Q 95 60 110 50" />
          <path d="M 30 80 Q 55 75 80 85" />
          <path d="M 40 100 Q 60 95 85 105" />
          <path d="M 55 30 L 70 45" />
          <path d="M 70 65 L 78 78" />
          <path d="M 90 90 Q 100 85 105 95" />
        </g>
      )}
      {size === 'groesser' && (
        <g stroke={VESSEL} strokeWidth="2.6" fill="none" strokeLinecap="round">
          <path d="M 25 45 Q 45 35 65 50 Q 80 60 100 50" />
          <path d="M 35 85 Q 55 70 75 85 Q 90 95 110 80" />
          <path d="M 45 110 L 75 105" />
          <path d="M 60 30 Q 70 45 85 35" />
        </g>
      )}
      {size === 'flaechig' && (
        <g stroke={VESSEL} strokeWidth="1.4" fill="none" strokeLinecap="round">
          {/* Dense network - many crossing branches */}
          <path d="M 20 35 Q 45 30 70 40 Q 95 50 120 35" />
          <path d="M 25 55 Q 50 60 75 55 Q 100 50 115 65" />
          <path d="M 18 75 Q 45 70 70 85 Q 95 95 120 80" />
          <path d="M 22 95 Q 50 100 80 95 Q 100 90 118 100" />
          <path d="M 30 115 Q 60 110 90 115" />
          <path d="M 40 30 L 50 70" />
          <path d="M 65 45 L 75 90" />
          <path d="M 85 55 L 95 95" />
          <path d="M 50 100 L 58 118" />
        </g>
      )}
    </svg>
  )
}

export default function SizePicker({ selected, onSelect }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '10px',
    }}>
      {OPTIONS.map(opt => {
        const isSel = selected === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSelect(opt.key)}
            aria-pressed={isSel}
            style={{
              padding: '12px',
              border: `2px solid ${isSel ? '#003399' : '#DDE3F5'}`,
              borderRadius: '8px',
              backgroundColor: isSel ? '#F4F7FF' : '#fff',
              cursor: 'pointer',
              transition: 'border-color 0.15s, background-color 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={e => { if (!isSel) e.currentTarget.style.borderColor = '#003399' }}
            onMouseLeave={e => { if (!isSel) e.currentTarget.style.borderColor = '#DDE3F5' }}
          >
            <div style={{ width: '100%', aspectRatio: '1 / 1', maxWidth: '140px' }}>
              <Illustration size={opt.key} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0A1F44' }}>{opt.label}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{opt.sub}</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
