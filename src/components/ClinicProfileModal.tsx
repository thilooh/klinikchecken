import { X, MapPin, Clock, Stethoscope, CheckCircle2 } from 'lucide-react'
import type { Clinic } from '../types/clinic'

interface Props {
  clinic: Clinic
  onClose: () => void
  onInquire: (clinic: Clinic) => void
  onShowReviews: () => void
  /** True if distanceKm is computed against the user's actual position; if
   *  false, it's just distance to the clinic's own city centre and we hide it. */
  hasUserCoords?: boolean
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span>{Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#FFB400' : '#DDD', fontSize: size }}>★</span>
    ))}</span>
  )
}

const GIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const extras: { key: keyof Clinic; label: string; icon: string }[] = [
  { key: 'freeConsultation',    label: 'Kostenlose Erstberatung',  icon: '🎁' },
  { key: 'onlineBooking',       label: 'Online-Terminbuchung',     icon: '💻' },
  { key: 'eveningAppointments', label: 'Abendtermine verfügbar',   icon: '🌙' },
  { key: 'kassenpatient',       label: 'GKV-Abrechnung möglich',   icon: '🏥' },
  { key: 'ratenzahlung',        label: 'Ratenzahlung möglich',     icon: '💳' },
  { key: 'parking',             label: 'Parkplätze vorhanden',     icon: '🅿️' },
  { key: 'certified',           label: 'Zertifizierte Praxis',     icon: '✅' },
]

const METHOD_COLORS: Record<string, string> = {
  'Verödung':                  '#E8F5E9',
  'Mikroschaum-Sklerotherapie':'#E8F5E9',
  'Nd:YAG Laser':              '#E3F2FD',
  'Laser':                     '#E3F2FD',
  'KTP-Laser':                 '#E3F2FD',
  'IPL-Behandlung':            '#FFF3E0',
}
const METHOD_TEXT: Record<string, string> = {
  'Verödung':                  '#2E7D32',
  'Mikroschaum-Sklerotherapie':'#2E7D32',
  'Nd:YAG Laser':              '#1565C0',
  'Laser':                     '#1565C0',
  'KTP-Laser':                 '#1565C0',
  'IPL-Behandlung':            '#E65100',
}

export default function ClinicProfileModal({ clinic, onClose, onInquire, onShowReviews, hasUserCoords = false }: Props) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`
  const hasRating = (clinic.googleRating ?? 0) > 0
  const activeExtras = extras.filter(e => clinic[e.key])

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #EEE', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <div style={{ fontWeight: 800, fontSize: '17px', color: '#111', lineHeight: 1.3 }}>{clinic.name}</div>
              <div style={{ fontSize: '13px', color: '#666', fontStyle: 'italic', marginTop: '3px', lineHeight: 1.4 }}>{clinic.headline}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666', flexShrink: 0 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* Doctor & location */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Stethoscope size={16} color="#003399" />
              </div>
              <div>
                {clinic.doctor && clinic.doctor !== 'siehe Website' && (
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{clinic.doctor}</div>
                )}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{clinic.qualification}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={16} color="#003399" />
              </div>
              <div>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600, fontSize: '14px', color: '#003399', textDecoration: 'none' }}>
                  {clinic.address} ↗
                </a>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{clinic.district}{hasUserCoords ? ` · ${clinic.distanceKm} km von dir` : ''}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Clock size={16} color="#003399" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: clinic.openToday ? '#00A651' : '#CC0000', marginBottom: '3px' }}>
                  {clinic.openToday ? 'Heute geöffnet' : 'Heute geschlossen'}
                </div>
                <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.7 }}>
                  {(clinic.openHours ?? '').split(/,\s*/).filter(Boolean).map((seg, i) => <div key={i}>{seg}</div>)}
                </div>
              </div>
            </div>
          </div>

          {/* Treatments */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>Behandlungsmethoden</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {clinic.methods.map(method => (
                <span key={method} style={{
                  backgroundColor: METHOD_COLORS[method] ?? '#F5F5F5',
                  color: METHOD_TEXT[method] ?? '#333',
                  fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px',
                }}>
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* USPs */}
          {clinic.usp.length > 0 && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>Highlights</div>
              {clinic.usp.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: i < clinic.usp.length - 1 ? '8px' : 0 }}>
                  <CheckCircle2 size={15} color="#00A651" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '13px', color: '#333', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Treatment detail sections (clinic-specific) */}
          {clinic.treatmentInfo && (
            <>
              {/* Intro + method details */}
              {(clinic.treatmentInfo.intro || clinic.treatmentInfo.methodDetails) && (
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>Behandlungsansatz</div>
                  {clinic.treatmentInfo.intro && (
                    <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.6, margin: '0 0 12px' }}>{clinic.treatmentInfo.intro}</p>
                  )}
                  {clinic.treatmentInfo.methodDetails?.map((m, i) => (
                    <div key={i} style={{ marginBottom: i < (clinic.treatmentInfo!.methodDetails!.length - 1) ? '12px' : 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#111', marginBottom: '4px' }}>{m.method}</div>
                      <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0 }}>{m.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Process steps */}
              {clinic.treatmentInfo.processSteps && clinic.treatmentInfo.processSteps.length > 0 && (
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>Ablauf & Nachsorge</div>
                  {clinic.treatmentInfo.processSteps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: i < clinic.treatmentInfo!.processSteps!.length - 1 ? '6px' : 0 }}>
                      <span style={{ color: '#0052CC', fontWeight: 700, fontSize: '13px', flexShrink: 0, lineHeight: 1.5 }}>›</span>
                      <span style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Phlebologist */}
              {clinic.treatmentInfo.phlebologist && (
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>Phlebologie-Spezialistin</div>
                  <div style={{ backgroundColor: '#F5F8FF', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#111', marginBottom: '2px' }}>{clinic.treatmentInfo.phlebologist.name}</div>
                    <div style={{ fontSize: '12px', color: '#0052CC', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}>{clinic.treatmentInfo.phlebologist.title}</div>
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.6, margin: 0 }}>{clinic.treatmentInfo.phlebologist.bio}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Extras */}
          {activeExtras.length > 0 && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>Ausstattung & Service</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {activeExtras.map(e => (
                  <span key={e.key as string} style={{ backgroundColor: '#F5F5F5', fontSize: '12px', padding: '5px 10px', borderRadius: '6px', color: '#444' }}>
                    {e.icon} {e.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Google rating */}
          {hasRating && (
            <div style={{ padding: '14px 20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '10px' }}>Google Bewertungen</div>
              <button
                onClick={() => { onClose(); setTimeout(onShowReviews, 50) }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', textAlign: 'left' }}
              >
                <GIcon />
                <Stars rating={clinic.googleRating!} size={15} />
                <span style={{ fontWeight: 700, fontSize: '15px', color: '#111' }}>{clinic.googleRating!.toFixed(1)}</span>
                <span style={{ fontSize: '13px', color: '#666' }}>({clinic.googleReviewCount} Bewertungen)</span>
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#003399', fontWeight: 600 }}>Lesen ›</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #EEE', backgroundColor: '#FAFAFA', borderRadius: '0 0 8px 8px', flexShrink: 0 }}>
          <button
            onClick={() => { onClose(); onInquire(clinic) }}
            style={{ width: '100%', backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '6px', padding: '14px', cursor: 'pointer' }}
          >
            Jetzt anfragen
          </button>
        </div>

      </div>
    </div>
  )
}
