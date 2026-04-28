// Filled rectangles ▰▰▰▰▱▱ style score bar for the result page's
// Befundprofil. Colour ramps from primary blue (1-4) to orange (5-6)
// to red (7-8) so users see the severity at a glance without us
// having to write "stark" everywhere.

import { colorForScore } from '../../lib/quizProfileCompute'

interface Props {
  value: number
  max: number
  label?: string
}

export default function ScoreBar({ value, max, label }: Props) {
  const filled = Math.max(0, Math.min(max, value))
  const fillColor = colorForScore(value)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: label ? '6px' : 0 }}>
        <div
          role="img"
          aria-label={`${value} von ${max}`}
          style={{ display: 'flex', gap: '3px', flex: 1 }}
        >
          {Array.from({ length: max }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '12px',
                borderRadius: '2px',
                backgroundColor: i < filled ? fillColor : '#E5E9F2',
                transition: 'background-color 0.2s',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0A1F44', minWidth: '36px', textAlign: 'right' }}>
          {value}/{max}
        </span>
      </div>
      {label && (
        <div style={{ fontSize: '13px', color: '#444', fontStyle: 'italic' }}>→ {label}</div>
      )}
    </div>
  )
}
