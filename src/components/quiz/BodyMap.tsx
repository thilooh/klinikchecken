// Body-map for Step 1. Schematic SVG silhouette of lower body
// (leg outline) with two clickable zones (Oberschenkel / Waden) and
// a separate face icon. "Mehrere Stellen am Bein" sits as a text
// button below since it doesn't map to a discrete body region.
//
// Style: minimal black-line illustration on warm hautfarben fill.
// No anatomical detail beyond what's needed to identify the zones -
// keeps the illustration HWG-konform (no "patient image" feel)
// and avoids the uncanny-realistic-body trap.

interface Props {
  selected: string | null
  onSelect: (value: string) => void
}

const SKIN = '#F8E0D0'
const SKIN_HOVER = '#FFCAB0'
const STROKE = '#0A1F44'
const SELECTED = '#003399'

type Zone = 'beine_oben' | 'beine_unten' | 'gesicht'

function ZonePath({
  zone,
  selected,
  onSelect,
  pathD,
  ariaLabel,
}: {
  zone: Zone
  selected: string | null
  onSelect: (v: string) => void
  pathD: string
  ariaLabel: string
}) {
  const isSelected = selected === zone
  return (
    <path
      d={pathD}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      onClick={() => onSelect(zone)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(zone) }
      }}
      style={{
        fill: isSelected ? SELECTED : SKIN,
        stroke: STROKE,
        strokeWidth: 2,
        cursor: 'pointer',
        transition: 'fill 0.15s',
        outline: 'none',
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.fill = SKIN_HOVER }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.fill = SKIN }}
      onFocus={e => { if (!isSelected) e.currentTarget.style.fill = SKIN_HOVER }}
      onBlur={e => { if (!isSelected) e.currentTarget.style.fill = SKIN }}
    />
  )
}

export default function BodyMap({ selected, onSelect }: Props) {
  // Path coordinates: viewBox 0 0 240 360. Two legs, each split at
  // y = 180 (knee). Hip at top y=0, ankle at bottom y=350.
  // Left leg x: 30..100, right leg x: 140..210.
  const leftThigh = 'M 40 5 Q 30 60 32 175 L 92 175 Q 100 60 90 5 Z'
  const rightThigh = 'M 150 5 Q 140 60 148 175 L 208 175 Q 210 60 200 5 Z'
  const leftCalf = 'M 32 185 Q 28 280 38 350 L 86 350 Q 96 280 92 185 Z'
  const rightCalf = 'M 148 185 Q 144 280 154 350 L 202 350 Q 212 280 208 185 Z'

  return (
    <div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
        {/* Legs silhouette */}
        <div style={{ flex: '0 0 auto' }}>
          <svg
            viewBox="0 0 240 360"
            width="180"
            height="270"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Auswahl: Beine. Klick auf den Bereich der dich am meisten stört."
            role="group"
          >
            <ZonePath zone="beine_oben" selected={selected} onSelect={onSelect} pathD={leftThigh} ariaLabel="Linker Oberschenkel auswählen" />
            <ZonePath zone="beine_oben" selected={selected} onSelect={onSelect} pathD={rightThigh} ariaLabel="Rechter Oberschenkel auswählen" />
            <ZonePath zone="beine_unten" selected={selected} onSelect={onSelect} pathD={leftCalf} ariaLabel="Linke Wade auswählen" />
            <ZonePath zone="beine_unten" selected={selected} onSelect={onSelect} pathD={rightCalf} ariaLabel="Rechte Wade auswählen" />
            <text x="120" y="100" textAnchor="middle" style={{ fontSize: '13px', fontWeight: 700, fill: STROKE, pointerEvents: 'none' }}>
              Oberschenkel
            </text>
            <text x="120" y="270" textAnchor="middle" style={{ fontSize: '13px', fontWeight: 700, fill: STROKE, pointerEvents: 'none' }}>
              Waden &amp; Knöchel
            </text>
          </svg>
        </div>

        {/* Face icon */}
        <div style={{ flex: '0 0 auto' }}>
          <svg
            viewBox="0 0 160 200"
            width="120"
            height="150"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Auswahl: Gesicht."
            role="group"
          >
            {/* Head outline as a single clickable path */}
            <path
              d="M 80 20 Q 30 20 30 80 Q 30 130 60 160 Q 70 175 80 180 Q 90 175 100 160 Q 130 130 130 80 Q 130 20 80 20 Z"
              role="button"
              tabIndex={0}
              aria-label="Gesicht auswählen"
              aria-pressed={selected === 'gesicht'}
              onClick={() => onSelect('gesicht')}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect('gesicht') }
              }}
              style={{
                fill: selected === 'gesicht' ? SELECTED : SKIN,
                stroke: STROKE,
                strokeWidth: 2,
                cursor: 'pointer',
                transition: 'fill 0.15s',
                outline: 'none',
              }}
              onMouseEnter={e => { if (selected !== 'gesicht') e.currentTarget.style.fill = SKIN_HOVER }}
              onMouseLeave={e => { if (selected !== 'gesicht') e.currentTarget.style.fill = SKIN }}
            />
            {/* Decorative cheek dots - non-interactive, just hint
                at the typical Besenreiser-im-Gesicht zones. */}
            <circle cx="55" cy="100" r="3" fill="#C77777" pointerEvents="none" />
            <circle cx="105" cy="100" r="3" fill="#C77777" pointerEvents="none" />
            <text x="80" y="195" textAnchor="middle" style={{ fontSize: '13px', fontWeight: 700, fill: STROKE, pointerEvents: 'none' }}>
              Gesicht
            </text>
          </svg>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect('beine_mehrere')}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: `1px solid ${selected === 'beine_mehrere' ? '#003399' : '#DDE3F5'}`,
          borderRadius: '6px',
          backgroundColor: selected === 'beine_mehrere' ? '#F4F7FF' : '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          color: '#0A1F44',
          textAlign: 'center',
        }}
      >
        Mehrere Stellen am Bein
      </button>
    </div>
  )
}
