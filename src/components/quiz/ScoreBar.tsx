// Filled rectangles ▰▰▰▰▱▱ style score bar for the result page's
// Orientierungsprofil. Colour ramps from primary blue (1-4) to
// orange (5-6) to red (7-8). The bar shows visual extent only -
// the explicit "X/Y" number is intentionally suppressed (Anpassung
// A) so the result reads less like a clinical scale and more like
// a self-reported intensity.

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
      <div
        role="img"
        aria-label={label ?? `Wert ${value} von ${max}`}
        style={{ display: 'flex', gap: '3px', marginBottom: label ? '6px' : 0 }}
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
      {label && (
        <div style={{ fontSize: '13px', color: '#444' }}>{label}</div>
      )}
    </div>
  )
}
