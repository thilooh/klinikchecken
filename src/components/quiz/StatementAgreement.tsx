// 4-point Likert-style scale used in step 7 (Vermeidung). The
// statement appears in a quote-styled card above; the four
// agreement levels render as buttons that auto-advance on click.
// On mobile the buttons stack 2x2; on desktop they sit in a single
// horizontal row.

interface Props {
  statement: string
  onSelect: (value: 'voellig_zu' | 'eher_zu' | 'eher_nicht' | 'gar_nicht') => void
}

const OPTIONS: Array<{ value: 'voellig_zu' | 'eher_zu' | 'eher_nicht' | 'gar_nicht'; label: string }> = [
  { value: 'voellig_zu', label: 'Stimme völlig zu' },
  { value: 'eher_zu', label: 'Stimme eher zu' },
  { value: 'eher_nicht', label: 'Stimme eher nicht zu' },
  { value: 'gar_nicht', label: 'Stimme gar nicht zu' },
]

export default function StatementAgreement({ statement, onSelect }: Props) {
  return (
    <div>
      <blockquote style={{
        margin: '0 0 18px 0',
        padding: '14px 18px',
        backgroundColor: '#F4F7FF',
        borderLeft: '3px solid #003399',
        borderRadius: '4px',
        fontSize: '15px',
        color: '#0A1F44',
        lineHeight: 1.5,
        fontStyle: 'italic',
      }}>
        {statement}
      </blockquote>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}>
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            style={{
              padding: '12px 10px',
              border: '1px solid #DDE3F5',
              borderRadius: '6px',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0A1F44',
              transition: 'border-color 0.15s, background-color 0.15s',
              textAlign: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#003399'; e.currentTarget.style.backgroundColor = '#F4F7FF' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDE3F5'; e.currentTarget.style.backgroundColor = '#fff' }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
