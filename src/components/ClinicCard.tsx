import { useState } from 'react'
import { MapPin, Heart, Clock, ExternalLink } from 'lucide-react'
import type { Clinic } from '../types/clinic'

interface Props {
  clinic: Clinic
  onInquire: (clinic: Clinic) => void
  onMethodClick: (methodKey: string) => void
  activeMethodKeys: string[]
  showCertifiedBadge: boolean
}

const TAG_TO_METHOD_KEY: Record<string, string> = {
  'Verödung': 'verödung',
  'Nd:YAG Laser': 'nd:yag',
  'IPL-Behandlung': 'ipl',
  'Radiofrequenz': 'radiofrequenz',
  'Diode Laser': 'diode',
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < full || (i === full && half) ? '#FFB400' : '#DDD', fontSize: '13px' }}>★</span>
      ))}
    </span>
  )
}

export default function ClinicCard({ clinic, onInquire, onMethodClick, activeMethodKeys, showCertifiedBadge }: Props) {
  const [favorited, setFavorited] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="card-hover fade-in"
      style={{
        backgroundColor: clinic.featured ? '#FFFDF0' : '#fff',
        border: clinic.featured ? '1px solid #DDC' : '1px solid #DDDDDD',
        borderTop: showCertifiedBadge ? '3px solid #FFB400' : undefined,
        borderRadius: '4px',
        padding: '16px',
        position: 'relative',
        marginBottom: '8px',
      }}
    >
      {showCertifiedBadge && (
        <div style={{ position: 'absolute', top: '0', left: '0', backgroundColor: '#FFB400', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '0 0 4px 0', lineHeight: '20px' }}>
          ✓ aesthetiq-zertifiziert
        </div>
      )}

      <button
        onClick={() => setFavorited(!favorited)}
        style={{ position: 'absolute', top: showCertifiedBadge ? '24px' : '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
      >
        <Heart size={18} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#CCC'} />
      </button>

      <div style={{ display: 'flex', gap: '14px', marginTop: showCertifiedBadge ? '12px' : '0' }}>

        {/* Col 1: Image + Rating */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#999', marginBottom: '6px', background: 'linear-gradient(135deg, #E8EEF4 0%, #D0DCE8 100%)' }}>
            <span>📷</span>
          </div>
          <div
            style={{ position: 'relative', display: 'inline-block', cursor: 'default' }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {clinic.reviewCount < 5 ? (
              <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', maxWidth: '80px', lineHeight: 1.3 }}>Noch wenige Bewertungen</div>
            ) : (
              <>
                <Stars rating={clinic.rating} />
                <div style={{ fontWeight: 700, fontSize: '12px' }}>{clinic.rating.toFixed(1)}</div>
              </>
            )}
            {showTooltip && clinic.reviewCount >= 5 && (
              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#333', color: '#fff', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap', zIndex: 10, marginBottom: '4px' }}>
                {clinic.reviewCount} verifizierte Patientenbewertungen
              </div>
            )}
          </div>
          <a href="#" style={{ color: '#003399', fontSize: '11px', display: 'block', textDecoration: 'none' }}>
            {clinic.reviewCount} Bewertungen
          </a>
        </div>

        {/* Col 2: Clinic Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <a href="#" style={{ color: '#003399', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'block', marginBottom: '4px' }}>
            {clinic.name}
          </a>
          {clinic.freeConsultation && (
            <span style={{ display: 'inline-block', backgroundColor: '#00A651', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', marginBottom: '6px' }}>
              Kostenlose Erstberatung
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '12px', marginBottom: '3px' }}>
            <MapPin size={12} />
            <span>{clinic.address} · {clinic.distanceKm} km</span>
          </div>
          <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>
            {clinic.doctor} · {clinic.qualification}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {clinic.openToday
              ? <><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00A651', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#00A651', fontSize: '12px' }}>Heute geöffnet: {clinic.openHours}</span></>
              : <><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CC0000', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#CC0000', fontSize: '12px' }}>Heute geschlossen · {clinic.openHours}</span></>
            }
          </div>
        </div>

        {/* Col 3: Methods */}
        <div className="hidden sm:block" style={{ minWidth: '160px', maxWidth: '200px' }}>
          <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Verfügbare Methoden</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            {clinic.tags.slice(0, 3).map(tag => {
              const methodKey = TAG_TO_METHOD_KEY[tag]
              const isMethod = !!methodKey
              const isActive = isMethod && activeMethodKeys.includes(methodKey)
              return (
                <span
                  key={tag}
                  onClick={() => isMethod && onMethodClick(methodKey)}
                  style={{ backgroundColor: isActive ? '#003399' : '#F0F0F0', color: isActive ? '#fff' : '#444', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', cursor: isMethod ? 'pointer' : 'default', transition: 'background 0.15s' }}
                >
                  {tag}
                </span>
              )
            })}
          </div>
          {clinic.packagePrice && (
            <div style={{ color: '#003399', fontSize: '12px', fontStyle: 'italic', marginBottom: '4px' }}>Paketpreise ab 3 Sitzungen</div>
          )}
          {clinic.onlineBooking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00A651', fontSize: '12px', marginBottom: '4px' }}>
              <Clock size={11} />Online-Buchung verfügbar
            </div>
          )}
          {clinic.photoCount > 0 && (
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#003399', fontSize: '12px', textDecoration: 'none' }}>
              <ExternalLink size={11} />Praxis-Fotos: {clinic.photoCount} Fotos
            </a>
          )}
        </div>

        {/* Col 4: Price + CTA */}
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#888', fontSize: '11px' }}>ab</div>
            <div style={{ fontWeight: 700, fontSize: '22px', color: '#111', lineHeight: 1.1 }}>{clinic.priceFrom} €</div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>/ Sitzung</div>
            {clinic.packagePrice && (
              <div style={{ color: '#00A651', fontSize: '12px', marginBottom: '8px' }}>Paket 3x: {clinic.packagePrice} €</div>
            )}
          </div>
          <div>
            <button onClick={() => onInquire(clinic)} style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '4px', height: '36px', width: '100%', cursor: 'pointer', marginBottom: '6px' }}>
              Kostenlos anfragen
            </button>
            <button style={{ backgroundColor: '#fff', color: '#003399', fontSize: '12px', border: '1px solid #003399', borderRadius: '4px', height: '32px', width: '100%', cursor: 'pointer' }}>
              Profil ansehen
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
