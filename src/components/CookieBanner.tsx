import { setConsent } from '../lib/consent'

interface Props {
  onAccept: () => void
  onDecline: () => void
}

export default function CookieBanner({ onAccept, onDecline }: Props) {
  const handleAccept = () => {
    setConsent('accepted')
    onAccept()
  }

  const handleDecline = () => {
    setConsent('declined')
    onDecline()
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000,
      backgroundColor: '#1A1A2E', color: '#fff',
      padding: '16px 20px', boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <p style={{ flex: 1, minWidth: '260px', margin: 0, fontSize: '13px', lineHeight: 1.6, color: '#CCC' }}>
          Wir nutzen Cookies und ähnliche Technologien (Google Tag Manager, Microsoft Clarity, Meta Pixel), um unsere Website zu verbessern
          und dir relevante Angebote zu zeigen. Mehr dazu in unserer{' '}
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: '#7AAAE0', textDecoration: 'underline' }}>
            Datenschutzerklärung
          </a>.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '9px 18px', border: '1px solid #555', borderRadius: '4px',
              backgroundColor: 'transparent', color: '#CCC', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Nur notwendige
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '9px 18px', border: 'none', borderRadius: '4px',
              backgroundColor: '#0052CC', color: '#fff', fontSize: '13px',
              fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  )
}
