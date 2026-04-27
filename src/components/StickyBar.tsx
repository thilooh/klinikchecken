import type { Clinic } from '../types/clinic'

interface Props {
  clinics: Clinic[]
  onRequest: () => void
  onClear: () => void
  ctaColor?: string
}

export default function StickyBar({ clinics, onRequest, onClear, ctaColor = '#FF6600' }: Props) {
  const count = clinics.length
  if (count === 0) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1500,
      backgroundColor: '#003399', boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
      animation: 'slideUp 0.25s ease',
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
      <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '12px 16px' }}>

        {/* Mobile layout */}
        <div className="block sm:hidden">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {clinics.map(c => (
                <div key={c.id} title={c.name} style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  backgroundColor: '#fff', border: '2px solid rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#003399', flexShrink: 0, overflow: 'hidden',
                }}>
                  {c.media?.logo
                    ? <img src={c.media.logo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : c.name.charAt(0)}
                </div>
              ))}
            </div>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600, flex: 1 }}>{count} {count > 1 ? 'Praxen' : 'Praxis'} ausgewählt</span>
            <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '0 2px' }} aria-label="Auswahl löschen">×</button>
          </div>
          <button onClick={onRequest} style={{
            width: '100%', backgroundColor: ctaColor, color: '#fff', fontWeight: 700,
            fontSize: '15px', border: 'none', borderRadius: '6px', padding: '13px', cursor: 'pointer',
          }}>
            {count} {count > 1 ? 'Praxen' : 'Praxis'} gemeinsam anfragen →
          </button>
        </div>

        {/* Desktop layout */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {clinics.map(c => (
              <div key={c.id} title={c.name} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: '#fff', border: '2px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 700, color: '#003399', flexShrink: 0, overflow: 'hidden',
              }}>
                {c.media?.logo
                  ? <img src={c.media.logo} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : c.name.charAt(0)}
              </div>
            ))}
          </div>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{count} {count > 1 ? 'Praxen' : 'Praxis'} ausgewählt</span>
          <button onClick={onClear} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>Auswahl löschen</button>
          <div style={{ flex: 1 }} />
          <button onClick={onRequest} style={{
            backgroundColor: ctaColor, color: '#fff', fontWeight: 700,
            fontSize: '15px', border: 'none', borderRadius: '6px', padding: '12px 28px', cursor: 'pointer',
          }}>
            {count} {count > 1 ? 'Praxen' : 'Praxis'} gemeinsam anfragen →
          </button>
        </div>
      </div>
    </div>
  )
}
