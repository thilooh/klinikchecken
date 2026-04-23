import { useState } from 'react'
import { MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import GoogleReviewsModal from './GoogleReviewsModal'

interface Props {
  clinic: Clinic
  onInquire: (clinic: Clinic) => void
  onMethodClick: (methodKey: string) => void
  activeMethodKeys: string[]
  showCertifiedBadge: boolean
}

const SLIDES = [
  { bg: 'linear-gradient(135deg, #E2EBF5 0%, #C0D2E8 100%)', label: 'Praxis-Fotos' },
  { bg: 'linear-gradient(135deg, #F0EBE3 0%, #E0CDB8 100%)', label: 'Empfangsbereich' },
  { bg: 'linear-gradient(135deg, #E2F0E8 0%, #B8DECE 100%)', label: 'Behandlungsraum' },
]

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return <span>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < full || (i === full && half) ? '#FFB400' : '#DDD', fontSize: size }}>★</span>)}</span>
}

const GIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

function USPs({ items, small }: { items: string[]; small?: boolean }) {
  return (
    <div style={{ marginBottom: small ? '6px' : '10px' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: small ? '3px' : '4px' }}>
          <span style={{ color: '#00A651', flexShrink: 0, fontWeight: 700, fontSize: small ? '12px' : '14px', lineHeight: small ? '18px' : '20px' }}>✓</span>
          <span style={{ fontSize: small ? '12px' : '14px', color: '#444', lineHeight: 1.45 }}>{item}</span>
        </div>
      ))}
    </div>
  )
}

export default function ClinicCard({ clinic, onInquire, onMethodClick: _onMethodClick, activeMethodKeys: _activeMethodKeys, showCertifiedBadge }: Props) {
  const [favorited, setFavorited] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [slide, setSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) setSlide(s => diff > 0 ? Math.min(s + 1, SLIDES.length - 1) : Math.max(s - 1, 0))
    setTouchStart(null)
  }

  const Dots = ({ small }: { small?: boolean }) => (
    <div style={{ display: 'flex', gap: small ? '3px' : '5px', alignItems: 'center', justifyContent: 'center' }}>
      {SLIDES.map((_, i) => (
        <button key={i} onClick={() => setSlide(i)} style={{
          width: small ? '5px' : (i === slide ? '16px' : '6px'), height: small ? '5px' : '6px',
          borderRadius: small ? '50%' : '3px',
          backgroundColor: i === slide ? (small ? '#003399' : '#fff') : (small ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.5)'),
          border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s', flexShrink: 0,
        }} />
      ))}
    </div>
  )

  return (
    <>
      <div className="card-hover fade-in p-0" style={{
        backgroundColor: clinic.featured ? '#FFFDF0' : '#fff',
        border: clinic.featured ? '1px solid #DDC' : '1px solid #DDDDDD',
        borderTop: showCertifiedBadge ? '3px solid #FFB400' : undefined,
        borderRadius: '6px', position: 'relative', marginBottom: '10px', overflow: 'hidden',
      }}>

        {/* ====== MOBILE ====== */}
        <div className="block sm:hidden">
          <div style={{ position: 'relative', width: '100%', paddingTop: '56%', overflow: 'hidden' }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ display: 'flex', height: '100%', transform: `translateX(-${slide * 100}%)`, transition: 'transform 0.3s ease' }}>
                {SLIDES.map((s, i) => (
                  <div key={i} style={{ minWidth: '100%', height: '100%', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '38px' }}>📷</span>
                    <span style={{ fontSize: '13px', color: '#8A9EBB', fontWeight: 500 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {showCertifiedBadge && (
              <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#FFB400', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 12px', zIndex: 2 }}>✓ Zertifiziert</div>
            )}
            <button onClick={() => setFavorited(f => !f)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <Heart size={18} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#777'} />
            </button>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronLeft size={16} color="#333" />
              </button>
            )}
            {slide < SLIDES.length - 1 && (
              <button onClick={() => setSlide(s => s + 1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronRight size={16} color="#333" />
              </button>
            )}
            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 2 }}><Dots /></div>
          </div>

          <div style={{ padding: '14px 16px 10px' }}>
            <a href="#" style={{ color: '#111', fontWeight: 700, fontSize: '17px', textDecoration: 'none', display: 'block', marginBottom: '4px', lineHeight: 1.3 }}>{clinic.name}</a>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px', lineHeight: 1.5, fontStyle: 'italic' }}>{clinic.headline}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <GIcon />
              <Stars rating={clinic.googleRating} size={16} />
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>{clinic.googleRating.toFixed(1)}</span>
            </div>
            <button onClick={() => setShowReviews(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
              <span style={{ color: '#003399', fontSize: '13px', fontWeight: 600, textDecoration: 'underline' }}>{clinic.googleReviewCount} Google-Bewertungen lesen</span>
              <span style={{ color: '#003399', fontSize: '13px' }}>&#8250;</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', color: '#555', fontSize: '14px', marginBottom: '4px' }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} /><span style={{ lineHeight: 1.4 }}>{clinic.address} · {clinic.distanceKm} km</span>
            </div>
            <div style={{ color: '#777', fontSize: '13px', marginBottom: '10px', lineHeight: 1.4 }}>{clinic.doctor} · {clinic.qualification}</div>
            <USPs items={clinic.usp} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {clinic.freeConsultation && <span style={{ backgroundColor: '#00A651', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '4px 10px', borderRadius: '4px' }}>Kostenlose Erstberatung</span>}
              {clinic.onlineBooking && <span style={{ backgroundColor: '#E8F0FF', color: '#003399', fontSize: '12px', padding: '4px 10px', borderRadius: '4px' }}>Online-Buchung</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {clinic.openToday
                ? <><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00A651', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#00A651', fontSize: '13px' }}>Heute geöffnet: {clinic.openHours}</span></>
                : <><span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#CC0000', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#CC0000', fontSize: '13px' }}>Heute geschlossen</span></>}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 16px', borderTop: '1px solid #EEEEEE' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '13px', color: '#888' }}>ab</span>
                <span style={{ fontWeight: 700, fontSize: '26px', color: '#111', whiteSpace: 'nowrap' }}> {clinic.priceFrom} €</span>
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '-2px' }}>/ Sitzung</div>
              {clinic.packagePrice && <div style={{ fontSize: '12px', color: '#00A651', marginTop: '2px', whiteSpace: 'nowrap' }}>3x: {clinic.packagePrice} €</div>}
            </div>
            <button onClick={() => onInquire(clinic)} style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '16px', border: 'none', borderRadius: '6px', padding: '14px 22px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Jetzt anfragen</button>
          </div>
        </div>

        {/* ====== DESKTOP ====== */}
        <div className="hidden sm:flex">
          {/* Image carousel – fixed 220x220 square */}
          <div
            style={{ flexShrink: 0, width: '220px', height: '220px', alignSelf: 'flex-start', position: 'relative', overflow: 'hidden' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div style={{ position: 'absolute', inset: 0, display: 'flex', transform: `translateX(-${slide * 220}px)`, transition: 'transform 0.3s ease' }}>
              {SLIDES.map((s, i) => (
                <div key={i} style={{ minWidth: '220px', height: '220px', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '40px' }}>📷</span>
                  <span style={{ fontSize: '13px', color: '#8A9EBB', fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>
            {showCertifiedBadge && (
              <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#FFB400', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '4px 10px', zIndex: 2 }}>✓ Zertifiziert</div>
            )}
            <button onClick={() => setFavorited(f => !f)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <Heart size={16} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#777'} />
            </button>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronLeft size={14} color="#333" />
              </button>
            )}
            {slide < SLIDES.length - 1 && (
              <button onClick={() => setSlide(s => s + 1)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronRight size={14} color="#333" />
              </button>
            )}
            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 2 }}><Dots /></div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', gap: '0', padding: '14px 12px 14px 16px', minHeight: '200px' }}>
            {/* Col 2 – main info + all 3 USPs */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
              <a href="#" style={{ color: '#003399', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'block', marginBottom: '2px', lineHeight: 1.3 }}>{clinic.name}</a>
              <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', marginBottom: '7px', lineHeight: 1.4 }}>{clinic.headline}</div>

              {/* Single rating row: G icon · stars · score · review link · badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <GIcon />
                <Stars rating={clinic.googleRating} size={14} />
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{clinic.googleRating.toFixed(1)}</span>
                <button onClick={() => setShowReviews(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ color: '#003399', fontSize: '12px', fontWeight: 600, textDecoration: 'underline' }}>{clinic.googleReviewCount} Bewertungen lesen</span>
                  <span style={{ color: '#003399', fontSize: '13px' }}>&#8250;</span>
                </button>
                {clinic.freeConsultation && <span style={{ backgroundColor: '#00A651', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px' }}>Kostenlose Erstberatung</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#555', fontSize: '13px', marginBottom: '3px' }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} /><span style={{ lineHeight: 1.4 }}>{clinic.address} · {clinic.distanceKm} km</span>
              </div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '8px', lineHeight: 1.3 }}>{clinic.doctor} · {clinic.qualification}</div>
              <USPs items={clinic.usp} small />
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {clinic.openToday
                  ? <><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00A651', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#00A651', fontSize: '13px' }}>Heute geöffnet: {clinic.openHours}</span></>
                  : <><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#CC0000', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#CC0000', fontSize: '13px' }}>Heute geschlossen</span></>}
              </div>
            </div>
            {/* Col 3 – price + CTA */}
            <div className="flex flex-col justify-between" style={{ flexShrink: 0, textAlign: 'right', minWidth: '148px' }}>
              <div>
                <div style={{ color: '#888', fontSize: '12px' }}>ab</div>
                <div style={{ fontWeight: 700, fontSize: '24px', color: '#111', lineHeight: 1.1 }}>{clinic.priceFrom} €</div>
                <div style={{ color: '#888', fontSize: '13px', marginBottom: '4px' }}>/ Sitzung</div>
                {clinic.packagePrice && <div style={{ color: '#00A651', fontSize: '13px', marginBottom: '8px' }}>Paket 3x: {clinic.packagePrice} €</div>}
              </div>
              <div>
                <button onClick={() => onInquire(clinic)} style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '4px', height: '38px', width: '100%', cursor: 'pointer', marginBottom: '6px' }}>Jetzt anfragen</button>
                <button style={{ backgroundColor: '#fff', color: '#003399', fontSize: '13px', border: '1px solid #003399', borderRadius: '4px', height: '34px', width: '100%', cursor: 'pointer' }}>Profil ansehen</button>
              </div>
            </div>
          </div>
        </div>

      </div>
      {showReviews && <GoogleReviewsModal clinic={clinic} onClose={() => setShowReviews(false)} />}
    </>
  )
}
