// Single-select option card. Click → onSelect → advance to next step.
// Hover/focus states use the same blue-tint as the existing site
// (sidebar method guide, ratgeber filter chips).

interface Props {
  label: string
  sub?: string
  onSelect: () => void
}

export default function AnswerCard({ label, sub, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        textAlign: 'left',
        padding: '14px 16px',
        border: '1px solid #DDE3F5',
        borderRadius: '6px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        width: '100%',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#003399'; e.currentTarget.style.backgroundColor = '#F4F7FF' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#DDE3F5'; e.currentTarget.style.backgroundColor = '#fff' }}
      onFocus={e => { e.currentTarget.style.borderColor = '#003399' }}
      onBlur={e => { e.currentTarget.style.borderColor = '#DDE3F5' }}
    >
      <div style={{ fontWeight: 700, fontSize: '15px', color: '#0A1F44' }}>{label}</div>
      {sub && <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>{sub}</div>}
    </button>
  )
}
