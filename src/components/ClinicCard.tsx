import { useState } from 'react'
import { MapPin, Heart, Clock, ExternalLink } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import GoogleReviewsModal from './GoogleReviewsModal'

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

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < full || (i === full && half) ? '#FFB400' : '#DDD', fontSize: size }}>★</span>
      ))}
    </span>
  )
}

export default function ClinicCard({ clinic, onInquire, onMethodClick, activeMethodKeys, showCertifiedBadge }: Props) {
  const [favorited, setFavorited] = useState(false)
  const [showReviews, setShowReviews] = useState(false)

  return (
    <>
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
          <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#FFB400', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '0 0 4px 0', lineHeight: '20px' }}>
            ✓ aesthetiq-zertifiziert
          </div>
        )}

        <button onClick={() => setFavorited(!favorited)} style={{ position: 'absolute', top: showCertifiedBadge ? '24px' : '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          <Heart size={18} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#CCC'} />
        </button>

        <div style={{ display: 'flex', gap: '14px', marginTop: showCertifiedBadge ? '12px' : '0' }}>

          {/* Col 1: Image + Google Rating */}
          <div style={{ flexShrink: 0, textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', background: 'linear-gradient(135deg, #E8EEF4 0%, #D0DCE8 100%)' }}>
              <span style={{ fontSize: '22px' }}>📷</span>
            </div>

            {/* Google rating */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <Stars rating={clinic.googleRating} size={11} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>{clinic.googleRating.toFixed(1)}</div>
            <button
              onClick={() => setShowReviews(true)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#003399', fontSize: '11px', textDecoration: 'underline' }}
            >
              {clinic.googleReviewCount} Bew.
            </button>
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
              <MapPin size={12} /><span>{clinic.address} · {clinic.distanceKm} km</span>
            </div>
            <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px' }}>{clinic.doctor} · {clinic.qualification}</div>
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
                  <span key={tag} onClick={() => isMethod && onMethodClick(methodKey)} style={{ backgroundColor: isActive ? '#003399' : '#F0F0F0', color: isActive ? '#fff' : '#444', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', cursor: isMethod ? 'pointer' : 'default', transition: 'background 0.15s' }}>
                    {tag}
                  </span>
                )
              })}
            </div>
            {clinic.packagePrice && <div style={{ color: '#003399', fontSize: '12px', fontStyle: 'italic', marginBottom: '4px' }}>Paketpreise ab 3 Sitzungen</div>}
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
              {clinic.packagePrice && <div style={{ color: '#00A651', fontSize: '12px', marginBottom: '8px' }}>Paket 3x: {clinic.packagePrice} €</div>}
            </div>
            <div>
              <button onClick={() => onInquire(clinic)} style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '4px', height: '36px', width: '100%', cursor: 'pointer', marginBottom: '6px' }}>Kostenlos anfragen</button>
              <button style={{ backgroundColor: '#fff', color: '#003399', fontSize: '12px', border: '1px solid #003399', borderRadius: '4px', height: '32px', width: '100%', cursor: 'pointer' }}>Profil ansehen</button>
            </div>
          </div>

        </div>
      </div>

      {showReviews && (
        <GoogleReviewsModal clinic={clinic} onClose={() => setShowReviews(false)} />
      )}
    </>
  )
}
