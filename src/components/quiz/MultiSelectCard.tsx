interface Props {
  label: string
  checked: boolean
  onToggle: () => void
}

export default function MultiSelectCard({ label, checked, onToggle }: Props) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        border: `1px solid ${checked ? '#003399' : '#DDE3F5'}`,
        borderRadius: '6px',
        backgroundColor: checked ? '#F4F7FF' : '#fff',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{ accentColor: '#003399', flexShrink: 0, width: '18px', height: '18px' }}
      />
      <span style={{ fontSize: '15px', color: '#0A1F44', fontWeight: 600 }}>{label}</span>
    </label>
  )
}
