import { useState } from 'react'
import { MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import type { VariantConfig } from '../variants'
import { VARIANTS } from '../variants'
import GoogleReviewsModal from './GoogleReviewsModal'
import ClinicProfileModal from './ClinicProfileModal'

interface Props {
  clinic: Clinic
  onInquire: (clinic: Clinic) => void
  onMethodClick: (methodKey: string) => void
  activeMethodKeys: string[]
  cardVariant?: VariantConfig['card']
}

function getClinicBadges(clinic: Clinic, badge: string) {
  const badges: { label: string; bg: string }[] = []
  if (clinic.googleRating && clinic.googleRating >= 4.8)
    badges.push({ label: badge, bg: '#D97706' })
  return badges
}


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

function ClinicTags({ clinic, small }: { clinic: Clinic; small?: boolean }) {
  const tags = [
    clinic.freeConsultation && { label: 'Kostenlose Erstberatung', bg: '#00A651', color: '#fff' },
    clinic.kassenpatient    && { label: 'GKV möglich',             bg: '#E6F4EA', color: '#1A6B35' },
    clinic.onlineBooking    && { label: 'Online-Buchung',           bg: '#E8F0FF', color: '#003399' },
    clinic.eveningAppointments && { label: 'Abendtermine',          bg: '#FFF3E0', color: '#B45309' },
    clinic.ratenzahlung     && { label: 'Ratenzahlung',             bg: '#F3E8FF', color: '#6B21A8' },
    clinic.parking          && { label: 'Parkplätze',               bg: '#F0F0F0', color: '#444'    },
    /\bSa\b/.test(clinic.openHours) && { label: 'Sa geöffnet',      bg: '#FFF8E1', color: '#92400E' },
  ].filter(Boolean) as { label: string; bg: string; color: string }[]

  if (!tags.length) return null
  const pad = small ? '2px 7px' : '4px 10px'
  const fs = small ? '11px' : '12px'
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: small ? '8px' : '10px' }}>
      {tags.map(t => (
        <span key={t.label} style={{ backgroundColor: t.bg, color: t.color, fontSize: fs, fontWeight: 600, padding: pad, borderRadius: '4px' }}>{t.label}</span>
      ))}
    </div>
  )
}

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

export default function ClinicCard({ clinic, onInquire, onMethodClick: _onMethodClick, activeMethodKeys: _activeMethodKeys, cardVariant }: Props) {
  const vt = cardVariant ?? VARIANTS.a.card
  const [favorited, setFavorited] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [slide, setSlide] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)

  type Slide =
    | { type: 'logo'; src: string }
    | { type: 'photo'; src: string }
    | { type: 'placeholder'; bg: string; icon: string; label: string }

  const m = clinic.media
  const slides: Slide[] = [
    m?.logo
      ? { type: 'logo', src: m.logo }
      : { type: 'placeholder', bg: 'linear-gradient(135deg, #F5F7FA 0%, #E8ECF2 100%)', icon: '🏥', label: 'Logo' },
    m?.streetview
      ? { type: 'photo', src: m.streetview }
      : { type: 'placeholder', bg: 'linear-gradient(135deg, #E2EBF5 0%, #C0D2E8 100%)', icon: '📍', label: 'Außenansicht' },
    m?.map
      ? { type: 'photo', src: m.map }
      : { type: 'placeholder', bg: 'linear-gradient(135deg, #E2F0E8 0%, #B8DECE 100%)', icon: '🗺', label: 'Lageplan' },
  ]

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || touchStartY === null) return
    const diffX = touchStart - e.changedTouches[0].clientX
    const diffY = touchStartY - e.changedTouches[0].clientY
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40)
      setSlide(s => diffX > 0 ? Math.min(s + 1, slides.length - 1) : Math.max(s - 1, 0))
    setTouchStart(null)
    setTouchStartY(null)
  }

  const Dots = ({ small }: { small?: boolean }) => (
    <div style={{ display: 'flex', gap: small ? '3px' : '5px', alignItems: 'center', justifyContent: 'center' }}>
      {slides.map((_, i) => (
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
        borderRadius: '6px', position: 'relative', marginBottom: '10px', overflow: 'hidden',
      }}>

        {/* ====== MOBILE ====== */}
        <div className="block sm:hidden">
          <div style={{ position: 'relative', width: '100%', paddingTop: '56%', overflow: 'hidden', touchAction: 'pan-y' }}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <div style={{ display: 'flex', width: `calc(100% * ${slides.length})`, height: '100%', transform: `translateX(-${slide * 100 / slides.length}%)`, transition: 'transform 0.3s ease' }}>
                {slides.map((s, i) => (
                  <div key={i} style={{ width: `calc(100% / ${slides.length})`, height: '100%', flexShrink: 0 }}>
                    {s.type === 'logo'
                      ? <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                          <img src={s.src} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                      : s.type === 'photo'
                        ? <img src={s.src} alt="Praxisfoto" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', height: '100%', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '38px' }}>{s.icon}</span>
                            <span style={{ fontSize: '13px', color: '#8A9EBB', fontWeight: 500 }}>{s.label}</span>
                          </div>
                    }
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setFavorited(f => !f)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <Heart size={18} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#777'} />
            </button>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronLeft size={16} color="#333" />
              </button>
            )}
            {slide < slides.length - 1 && (
              <button onClick={() => setSlide(s => s + 1)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronRight size={16} color="#333" />
              </button>
            )}
            {getClinicBadges(clinic, vt.badge).length > 0 && (
              <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, display: 'flex', gap: '2px' }}>
                {getClinicBadges(clinic, vt.badge).map(b => (
                  <span key={b.label} style={{ backgroundColor: b.bg, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px' }}>{b.label}</span>
                ))}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 2 }}><Dots /></div>
          </div>

          <div style={{ padding: '14px 16px 10px' }}>
            <a href="#" style={{ color: '#111', fontWeight: 700, fontSize: '17px', textDecoration: 'none', display: 'block', marginBottom: '4px', lineHeight: 1.3 }}>{clinic.name}</a>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px', lineHeight: 1.5, fontStyle: 'italic' }}>{vt.subline(clinic)}</div>
            {clinic.googleRating ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <GIcon />
                  <Stars rating={clinic.googleRating} size={16} />
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>{clinic.googleRating.toFixed(1)}</span>
                </div>
                {clinic.placeId && (
                  <button onClick={() => setShowReviews(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                    <span style={{ color: '#003399', fontSize: '13px', fontWeight: 600, textDecoration: 'underline' }}>{clinic.googleReviewCount} Google-Bewertungen lesen</span>
                    <span style={{ color: '#003399', fontSize: '13px' }}>&#8250;</span>
                  </button>
                )}
              </>
            ) : (
              <div style={{ marginBottom: '10px' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', color: '#555', fontSize: '14px', marginBottom: '4px' }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} /><span style={{ lineHeight: 1.4 }}>{clinic.address} · {clinic.distanceKm} km</span>
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px', lineHeight: 1.4 }}>🎯 <span style={{ fontWeight: 600 }}>Schwerpunkt:</span> {clinic.methods.join(' · ')}</div>
            <USPs items={clinic.usp} />
            <ClinicTags clinic={clinic} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: clinic.openToday ? '#00A651' : '#CC0000', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: clinic.openToday ? '#00A651' : '#CC0000', fontSize: '13px', fontWeight: 600 }}>{clinic.openToday ? 'Heute geöffnet' : 'Heute geschlossen'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', padding: '12px 16px 16px', borderTop: '1px solid #EEEEEE' }}>
            <button onClick={() => setShowProfile(true)} style={{ flex: 1, backgroundColor: '#fff', color: '#003399', fontWeight: 600, fontSize: '15px', border: '1px solid #003399', borderRadius: '6px', padding: '14px 10px', cursor: 'pointer' }}>Profil ansehen</button>
            <button onClick={() => onInquire(clinic)} style={{ flex: 1, backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '6px', padding: '14px 10px', cursor: 'pointer' }}>{vt.cta}</button>
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
              {slides.map((s, i) => (
                <div key={i} style={{ minWidth: '220px', height: '220px', flexShrink: 0 }}>
                  {s.type === 'logo'
                    ? <div style={{ width: '220px', height: '220px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <img src={s.src} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    : s.type === 'photo'
                      ? <img src={s.src} alt="Praxisfoto" style={{ width: '220px', height: '220px', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '220px', height: '220px', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '40px' }}>{s.icon}</span>
                          <span style={{ fontSize: '13px', color: '#8A9EBB', fontWeight: 500 }}>{s.label}</span>
                        </div>
                  }
                </div>
              ))}
            </div>
            <button onClick={() => setFavorited(f => !f)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <Heart size={16} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#777'} />
            </button>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronLeft size={14} color="#333" />
              </button>
            )}
            {slide < slides.length - 1 && (
              <button onClick={() => setSlide(s => s + 1)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronRight size={14} color="#333" />
              </button>
            )}
            {getClinicBadges(clinic, vt.badge).length > 0 && (
              <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, display: 'flex', gap: '2px' }}>
                {getClinicBadges(clinic, vt.badge).map(b => (
                  <span key={b.label} style={{ backgroundColor: b.bg, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 10px' }}>{b.label}</span>
                ))}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 2 }}><Dots /></div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', gap: '0', padding: '14px 12px 14px 16px', minHeight: '200px' }}>
            {/* Col 2 – main info + all 3 USPs */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
              <a href="#" style={{ color: '#003399', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'block', marginBottom: '2px', lineHeight: 1.3 }}>{clinic.name}</a>
              <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', marginBottom: '7px', lineHeight: 1.4 }}>{vt.subline(clinic)}</div>

              {/* Single rating row: G icon · stars · score · review link · badge */}
              {clinic.googleRating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <GIcon />
                  <Stars rating={clinic.googleRating} size={14} />
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{clinic.googleRating.toFixed(1)}</span>
                  {clinic.placeId && (
                    <button onClick={() => setShowReviews(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: '#003399', fontSize: '12px', fontWeight: 600, textDecoration: 'underline' }}>{clinic.googleReviewCount} Bewertungen lesen</span>
                      <span style={{ color: '#003399', fontSize: '13px' }}>&#8250;</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '8px' }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#555', fontSize: '13px', marginBottom: '3px' }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} /><span style={{ lineHeight: 1.4 }}>{clinic.address} · {clinic.distanceKm} km</span>
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', lineHeight: 1.3 }}>🎯 <span style={{ fontWeight: 600 }}>Schwerpunkt:</span> {clinic.methods.join(' · ')}</div>
              <USPs items={clinic.usp} small />
              <ClinicTags clinic={clinic} small />
            </div>
            {/* Col 3 – opening hours + CTA */}
            <div className="flex flex-col justify-between" style={{ flexShrink: 0, textAlign: 'right', width: '160px' }}>
              <div>
                <div style={{ color: clinic.openToday ? '#00A651' : '#CC0000', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  {clinic.openToday ? 'Heute geöffnet' : 'Heute geschlossen'}
                </div>
                {clinic.openToday && (
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>
                    {clinic.openHours.split(', ').map((segment, i) => (
                      <div key={i}>{segment}</div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button onClick={() => onInquire(clinic)} style={{ backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '4px', height: '38px', width: '160px', cursor: 'pointer', marginBottom: '6px' }}>{vt.cta}</button>
                <button onClick={() => setShowProfile(true)} style={{ backgroundColor: '#fff', color: '#003399', fontSize: '13px', border: '1px solid #003399', borderRadius: '4px', height: '34px', width: '160px', cursor: 'pointer' }}>Profil ansehen</button>
              </div>
            </div>
          </div>
        </div>

      </div>
      {showReviews && <GoogleReviewsModal clinic={clinic} onClose={() => setShowReviews(false)} />}
      {showProfile && <ClinicProfileModal clinic={clinic} onClose={() => setShowProfile(false)} onInquire={onInquire} onShowReviews={() => setShowReviews(true)} />}
    </>
  )
}
