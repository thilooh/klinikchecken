import { useState } from 'react'
import { MapPin, Heart, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
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
  'Verödung': 'verödung', 'Nd:YAG Laser': 'nd:yag', 'IPL-Behandlung': 'ipl',
  'Radiofrequenz': 'radiofrequenz', 'Diode Laser': 'diode',
}

const SLIDES = [
  { bg: 'linear-gradient(135deg, #E2EBF5 0%, #C0D2E8 100%)', label: 'Praxis-Fotos' },
  { bg: 'linear-gradient(135deg, #F0EBE3 0%, #E0CDB8 100%)', label: 'Empfangsbereich' },
  { bg: 'linear-gradient(135deg, #E2F0E8 0%, #B8DECE 100%)', label: 'Behandlungsraum' },
]

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return <span>{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < full || (i === full && half) ? '#FFB400' : '#DDD', fontSize: size }}>★</span>)}</span>
}

const GIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function ClinicCard({ clinic, onInquire, onMethodClick, activeMethodKeys, showCertifiedBadge }: Props) {
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
      <div className="card-hover fade-in p-0 sm:p-3" style={{
        backgroundColor: clinic.featured ? '#FFFDF0' : '#fff',
        border: clinic.featured ? '1px solid #DDC' : '1px solid #DDDDDD',
        borderTop: showCertifiedBadge ? '3px solid #FFB400' : undefined,
        borderRadius: '6px', position: 'relative', marginBottom: '10px', overflow: 'hidden',
      }}>

        {/* ====== MOBILE ====== */}
        <div className="block sm:hidden">
          {/* Carousel */}
          <div style={{ position: 'relative', width: '100%', paddingTop: '56%', overflow: 'hidden' }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ display: 'flex', height: '100%', transform: `translateX(-${slide * 100}%)`, transition: 'transform 0.3s ease' }}>
                {SLIDES.map((s, i) => (
                  <div key={i} style={{ minWidth: '100%', height: '100%', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '38px' }}>📷</span>
                    <span style={{ fontSize: '12px', color: '#8A9EBB', fontWeight: 500 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {showCertifiedBadge && (
              <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#FFB400', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 12px', zIndex: 2 }}>
                ✓ aesthetiq-zertifiziert
              </div>
            )}
            <button onClick={() => setFavorited(f => !f)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <Heart size={17} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#777'} />
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

          {/* Info */}
          <div style={{ padding: '12px 14px 8px' }}>
            <a href="#" style={{ color: '#111', fontWeight: 700, fontSize: '16px', textDecoration: 'none', display: 'block', marginBottom: '5px', lineHeight: 1.3 }}>{clinic.name}</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <GIcon />
              <Stars rating={clinic.googleRating} size={14} />
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{clinic.googleRating.toFixed(1)}</span>
              <button onClick={() => setShowReviews(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#003399', fontSize: '12px', textDecoration: 'underline' }}>
                {clinic.googleReviewCount} Bewertungen
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#666', fontSize: '13px', marginBottom: '3px' }}>
              <MapPin size={13} style={{ flexShrink: 0, marginTop: '1px' }} /><span>{clinic.address} · {clinic.distanceKm} km</span>
            </div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>{clinic.doctor} · {clinic.qualification}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {clinic.freeConsultation && <span style={{ backgroundColor: '#00A651', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>Kostenlose Erstberatung</span>}
              {clinic.onlineBooking && <span style={{ backgroundColor: '#E8F0FF', color: '#003399', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>Online-Buchung</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {clinic.openToday
                ? <><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00A651', display: 'inline-block' }} /><span style={{ color: '#00A651', fontSize: '12px' }}>Heute geöffnet: {clinic.openHours}</span></>
                : <><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#CC0000', display: 'inline-block' }} /><span style={{ color: '#CC0000', fontSize: '12px' }}>Heute geschlossen</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 14px', borderTop: '1px solid #EEEEEE' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: '#888' }}>ab</span>
                <span style={{ fontWeight: 700, fontSize: '24px', color: '#111', whiteSpace: 'nowrap' }}> {clinic.priceFrom} €</span>
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '-2px' }}>/ Sitzung</div>
              {clinic.packagePrice && <div style={{ fontSize: '11px', color: '#00A651', marginTop: '2px', whiteSpace: 'nowrap' }}>3x: {clinic.packagePrice} €</div>}
            </div>
            <button onClick={() => onInquire(clinic)} style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '4px', padding: '13px 22px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Jetzt anfragen</button>
          </div>
        </div>

        {/* ====== DESKTOP ====== */}
        <div className="hidden sm:block">
          {showCertifiedBadge && <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#FFB400', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '0 0 4px 0', lineHeight: '20px', zIndex: 1 }}>✓ aesthetiq-zertifiziert</div>}
          <button onClick={() => setFavorited(f => !f)} style={{ position: 'absolute', top: showCertifiedBadge ? '26px' : '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', zIndex: 1 }}>
            <Heart size={18} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#CCC'} />
          </button>
          <div style={{ display: 'flex', gap: '12px', marginTop: showCertifiedBadge ? '14px' : '0' }}>
            {/* Col 1 */}
            <div style={{ flexShrink: 0, textAlign: 'center', width: '80px' }}>
              <div style={{ width: '80px', height: '72px', borderRadius: '4px', overflow: 'hidden', position: 'relative', marginBottom: '4px' }}
                onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <div style={{ display: 'flex', height: '100%', transform: `translateX(-${slide * 80}px)`, transition: 'transform 0.3s ease' }}>
                  {SLIDES.map((s, i) => (
                    <div key={i} style={{ minWidth: '80px', height: '72px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '22px' }}>📷</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '4px' }}><Dots small /></div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginBottom: '1px' }}>
                <GIcon /><Stars rating={clinic.googleRating} size={10} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', lineHeight: 1.2 }}>{clinic.googleRating.toFixed(1)}</div>
              <button onClick={() => setShowReviews(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#003399', fontSize: '11px', textDecoration: 'underline' }}>{clinic.googleReviewCount} Bew.</button>
            </div>
            {/* Col 2 */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: '26px' }}>
              <a href="#" style={{ color: '#003399', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'block', marginBottom: '3px', lineHeight: 1.3 }}>{clinic.name}</a>
              {clinic.freeConsultation && <span style={{ display: 'inline-block', backgroundColor: '#00A651', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', marginBottom: '4px' }}>Kostenlose Erstberatung</span>}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#666', fontSize: '12px', marginBottom: '2px' }}>
                <MapPin size={11} style={{ flexShrink: 0, marginTop: '1px' }} /><span style={{ lineHeight: 1.3 }}>{clinic.address} · {clinic.distanceKm} km</span>
              </div>
              <div style={{ color: '#666', fontSize: '12px', marginBottom: '4px', lineHeight: 1.3 }}>{clinic.doctor} · {clinic.qualification}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {clinic.openToday
                  ? <><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#00A651', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#00A651', fontSize: '12px' }}>Heute geöffnet: {clinic.openHours}</span></>
                  : <><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#CC0000', display: 'inline-block', flexShrink: 0 }} /><span style={{ color: '#CC0000', fontSize: '12px' }}>Heute geschlossen</span></>}
              </div>
            </div>
            {/* Col 3 */}
            <div style={{ minWidth: '150px', maxWidth: '190px' }}>
              <div style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Verfügbare Methoden</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {clinic.tags.slice(0, 3).map(tag => {
                  const methodKey = TAG_TO_METHOD_KEY[tag]
                  const isActive = !!methodKey && activeMethodKeys.includes(methodKey)
                  return <span key={tag} onClick={() => methodKey && onMethodClick(methodKey)} style={{ backgroundColor: isActive ? '#003399' : '#F0F0F0', color: isActive ? '#fff' : '#444', fontSize: '11px', padding: '3px 7px', borderRadius: '4px', cursor: methodKey ? 'pointer' : 'default', transition: 'background 0.15s' }}>{tag}</span>
                })}
              </div>
              {clinic.packagePrice && <div style={{ color: '#003399', fontSize: '11px', fontStyle: 'italic', marginBottom: '4px' }}>Paketpreise ab 3 Sitzungen</div>}
              {clinic.onlineBooking && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00A651', fontSize: '12px', marginBottom: '4px' }}><Clock size={11} />Online-Buchung</div>}
              {clinic.photoCount > 0 && <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#003399', fontSize: '12px', textDecoration: 'none' }}><ExternalLink size={11} />{clinic.photoCount} Praxis-Fotos</a>}
            </div>
            {/* Col 4 */}
            <div className="flex flex-col justify-between" style={{ flexShrink: 0, textAlign: 'right', minWidth: '148px' }}>
              <div>
                <div style={{ color: '#888', fontSize: '11px' }}>ab</div>
                <div style={{ fontWeight: 700, fontSize: '22px', color: '#111', lineHeight: 1.1 }}>{clinic.priceFrom} €</div>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>/ Sitzung</div>
                {clinic.packagePrice && <div style={{ color: '#00A651', fontSize: '12px', marginBottom: '8px' }}>Paket 3x: {clinic.packagePrice} €</div>}
              </div>
              <div>
                <button onClick={() => onInquire(clinic)} style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '4px', height: '36px', width: '100%', cursor: 'pointer', marginBottom: '6px' }}>Jetzt anfragen</button>
                <button style={{ backgroundColor: '#fff', color: '#003399', fontSize: '12px', border: '1px solid #003399', borderRadius: '4px', height: '32px', width: '100%', cursor: 'pointer' }}>Profil ansehen</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showReviews && <GoogleReviewsModal clinic={clinic} onClose={() => setShowReviews(false)} />}
    </>
  )
}
