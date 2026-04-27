import { lazy, Suspense, useState } from 'react'
import { MapPin, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import type { VariantConfig } from '../variants'
import { VARIANTS } from '../variants'
// Modals are heavy and only mounted on user interaction. Lazy-loaded to keep
// them out of the main bundle (saves ~15 KB gzip from index.js).
const GoogleReviewsModal  = lazy(() => import('./GoogleReviewsModal'))
const ClinicProfileModal  = lazy(() => import('./ClinicProfileModal'))
import { clarityEvent } from '../lib/clarity'
import { sendEvent } from '../lib/gtm'
import { generateEventId, sendCapi } from '../lib/capi'
import { isOpenToday, isAppointmentOnly } from '../lib/openHours'
import { cdnImage } from '../lib/cdnImage'

interface Props {
  clinic: Clinic
  onInquire: (clinic: Clinic) => void
  cardVariant?: VariantConfig['card']
  isSelected?: boolean
  onToggleSelect?: () => void
  ctaColor?: string
  /** True if the user has a real geo position; otherwise distanceKm is just
   *  the distance to the clinic's own city centre and is hidden in the UI. */
  hasUserCoords?: boolean
  /** 0-based position in the result list - first 3 are eager-loaded, rest lazy. */
  index?: number
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

function Dots({ slides, slide, setSlide, small }: { slides: unknown[]; slide: number; setSlide: (n: number) => void; small?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: small ? '3px' : '5px', alignItems: 'center', justifyContent: 'center' }}>
      {slides.map((_, i) => (
        <button key={i} onClick={() => setSlide(i)} aria-label={`Bild ${i + 1} von ${slides.length}`} aria-current={i === slide} style={{
          width: small ? '5px' : (i === slide ? '16px' : '6px'), height: small ? '5px' : '6px',
          borderRadius: small ? '50%' : '3px',
          backgroundColor: i === slide ? (small ? '#003399' : '#fff') : (small ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.5)'),
          border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s', flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

function USPs({ items, small }: { items: string[]; small?: boolean }) {
  if (!items.length) return null
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

export default function ClinicCard({ clinic, onInquire, cardVariant, isSelected = false, onToggleSelect, ctaColor = '#FF6600', hasUserCoords = false, index = 99 }: Props) {
  const eagerLoad = index < 3
  const imgLoading = eagerLoad ? 'eager' as const : 'lazy' as const
  const imgFetchPriority = index === 0 ? 'high' as const : 'auto' as const
  const vt = cardVariant ?? VARIANTS.a.card
  const openToday = isOpenToday(clinic.openHours)
  const appointmentOnly = isAppointmentOnly(clinic.openHours)
  const [favorited, setFavorited] = useState(false)
  const [showReviews, setShowReviews] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const openProfile = () => {
    setShowProfile(true)
    clarityEvent('profile_view')
    const eventId = generateEventId()
    const data = { content_type: 'clinic', content_name: clinic.name, content_category: clinic.city, item_name: clinic.name, item_category: clinic.city }
    sendEvent('ViewContent', data, undefined, eventId)
    sendCapi('ViewContent', eventId, data)
  }
  const openReviews = () => {
    if (clinic.placeId) {
      setShowReviews(true)
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`,
        '_blank',
        'noopener,noreferrer',
      )
    }
  }
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



  return (
    <>
      <div className="card-hover fade-in p-0" style={{
        backgroundColor: '#fff',
        border: '1px solid #DDDDDD',
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
                          <img src={cdnImage(s.src, 320)} alt={`${clinic.name} Logo`} width={320} height={180} loading={imgLoading} decoding="async" fetchPriority={imgFetchPriority} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size:32px">🏥</span>' }} />
                        </div>
                      : s.type === 'photo'
                        ? <img src={cdnImage(s.src, 600, 'cover')} alt={`${clinic.name} Praxisfoto`} width={600} height={338} loading={imgLoading} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { const el = e.target as HTMLImageElement; el.style.display = 'none'; el.parentElement!.style.background = 'linear-gradient(135deg,#E2EBF5,#C0D2E8)'; el.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px"><span style="font-size:38px">📍</span><span style="font-size:13px;color:#8A9EBB;font-weight:500">Foto folgt</span></div>' }} />
                        : <div style={{ width: '100%', height: '100%', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '38px' }}>{s.icon}</span>
                            <span style={{ fontSize: '13px', color: '#8A9EBB', fontWeight: 500 }}>{s.label}</span>
                          </div>
                    }
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2 }}>
              <button onClick={() => setFavorited(f => !f)} aria-label={favorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'} aria-pressed={favorited} style={{ background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Heart size={18} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#777'} />
              </button>
            </div>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} aria-label="Vorheriges Bild" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronLeft size={16} color="#333" />
              </button>
            )}
            {slide < slides.length - 1 && (
              <button onClick={() => setSlide(s => s + 1)} aria-label="Nächstes Bild" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronRight size={16} color="#333" />
              </button>
            )}
            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 2 }}><Dots slides={slides} slide={slide} setSlide={setSlide} /></div>
          </div>

          <div style={{ padding: '14px 16px 10px' }}>
            <button onClick={openProfile} style={{ color: '#111', fontWeight: 700, fontSize: '17px', textDecoration: 'none', display: 'block', marginBottom: '4px', lineHeight: 1.3, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}>{clinic.name}</button>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px', lineHeight: 1.5, fontStyle: 'italic' }}>{vt.subline(clinic)}</div>
            {clinic.googleRating && clinic.googleReviewCount ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <GIcon />
                  <Stars rating={clinic.googleRating} size={16} />
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#111' }}>{clinic.googleRating.toFixed(1)}</span>
                </div>
                <button onClick={openReviews} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                  <span style={{ color: '#003399', fontSize: '13px', fontWeight: 600, textDecoration: 'underline' }}>{clinic.googleReviewCount} Google-Bewertungen lesen</span>
                  <span style={{ color: '#003399', fontSize: '13px' }}>&#8250;</span>
                </button>
              </>
            ) : (
              <div style={{ marginBottom: '10px' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', color: '#555', fontSize: '14px', marginBottom: '4px' }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }} /><span style={{ lineHeight: 1.4 }}>{clinic.address}{hasUserCoords ? ` · ${clinic.distanceKm} km` : ''}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px', lineHeight: 1.4 }}>🎯 <span style={{ fontWeight: 600 }}>Schwerpunkt:</span> {clinic.methods.join(' · ')}</div>
            <USPs items={clinic.usp} />
            <ClinicTags clinic={clinic} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: appointmentOnly ? '#0052CC' : openToday ? '#00A651' : '#CC0000', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: appointmentOnly ? '#0052CC' : openToday ? '#00A651' : '#CC0000', fontSize: '13px', fontWeight: 600 }}>{appointmentOnly ? 'Nur nach Vereinbarung' : openToday ? 'Heute geöffnet' : 'Heute geschlossen'}</span>
            </div>
          </div>

          {onToggleSelect && (
            <button
              onClick={onToggleSelect}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                backgroundColor: isSelected ? '#EEF4FF' : '#FAFAFA',
                border: 'none', borderTop: `1.5px solid ${isSelected ? '#003399' : '#E8E8E8'}`,
                padding: '11px 16px', cursor: 'pointer',
                color: isSelected ? '#003399' : '#555', fontSize: '14px', fontWeight: isSelected ? 700 : 500,
                textAlign: 'left',
              }}
            >
              <span style={{
                width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                border: `2px solid ${isSelected ? '#003399' : '#BBB'}`,
                backgroundColor: isSelected ? '#003399' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isSelected && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
              </span>
              {isSelected ? 'Ausgewählt - tippen zum Entfernen' : 'Zur Vergleichs-Anfrage hinzufügen'}
            </button>
          )}
          <div style={{ display: 'flex', gap: '8px', padding: '12px 16px 16px', borderTop: '1px solid #EEEEEE' }}>
            <button onClick={openProfile} style={{ flex: 1, backgroundColor: '#fff', color: '#666', fontWeight: 500, fontSize: '15px', border: '1px solid #CCC', borderRadius: '6px', padding: '14px 10px', cursor: 'pointer' }}>Profil ansehen</button>
            <button onClick={() => onInquire(clinic)} style={{ flex: 1, backgroundColor: ctaColor, color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '6px', padding: '14px 10px', cursor: 'pointer' }}>{vt.cta}</button>
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
                        <img src={cdnImage(s.src, 240)} alt={`${clinic.name} Logo`} width={220} height={220} loading={imgLoading} decoding="async" fetchPriority={imgFetchPriority} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    : s.type === 'photo'
                      ? <img src={cdnImage(s.src, 400, 'cover')} alt={`${clinic.name} Praxisfoto`} width={220} height={220} loading={imgLoading} decoding="async" style={{ width: '220px', height: '220px', objectFit: 'cover', display: 'block' }} />
                      : <div style={{ width: '220px', height: '220px', background: s.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '40px' }}>{s.icon}</span>
                          <span style={{ fontSize: '13px', color: '#8A9EBB', fontWeight: 500 }}>{s.label}</span>
                        </div>
                  }
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2 }}>
              <button onClick={() => setFavorited(f => !f)} aria-label={favorited ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'} aria-pressed={favorited} style={{ background: 'rgba(255,255,255,0.88)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Heart size={16} fill={favorited ? '#e33' : 'none'} color={favorited ? '#e33' : '#777'} />
              </button>
            </div>
            {slide > 0 && (
              <button onClick={() => setSlide(s => s - 1)} aria-label="Vorheriges Bild" style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronLeft size={14} color="#333" />
              </button>
            )}
            {slide < slides.length - 1 && (
              <button onClick={() => setSlide(s => s + 1)} aria-label="Nächstes Bild" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
                <ChevronRight size={14} color="#333" />
              </button>
            )}
            <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, zIndex: 2 }}><Dots slides={slides} slide={slide} setSlide={setSlide} /></div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, display: 'flex', gap: '0', padding: '14px 12px 14px 16px', minHeight: '200px' }}>
            {/* Col 2 – main info + all 3 USPs */}
            <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
              <button onClick={openProfile} style={{ color: '#003399', fontWeight: 700, fontSize: '15px', textDecoration: 'none', display: 'block', marginBottom: '2px', lineHeight: 1.3, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>{clinic.name}</button>
              <div style={{ fontSize: '12px', color: '#555', fontStyle: 'italic', marginBottom: '7px', lineHeight: 1.4 }}>{vt.subline(clinic)}</div>

              {/* Single rating row: G icon · stars · score · review link · badge */}
              {clinic.googleRating && clinic.googleReviewCount ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <GIcon />
                  <Stars rating={clinic.googleRating} size={14} />
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>{clinic.googleRating.toFixed(1)}</span>
                  <button onClick={openReviews} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ color: '#003399', fontSize: '12px', fontWeight: 600, textDecoration: 'underline' }}>{clinic.googleReviewCount} Bewertungen lesen</span>
                    <span style={{ color: '#003399', fontSize: '13px' }}>&#8250;</span>
                  </button>
                </div>
              ) : (
                <div style={{ marginBottom: '8px' }} />
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: '#555', fontSize: '13px', marginBottom: '3px' }}>
                <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} /><span style={{ lineHeight: 1.4 }}>{clinic.address}{hasUserCoords ? ` · ${clinic.distanceKm} km` : ''}</span>
              </div>
              <div style={{ fontSize: '13px', color: '#555', marginBottom: '8px', lineHeight: 1.3 }}>🎯 <span style={{ fontWeight: 600 }}>Schwerpunkt:</span> {clinic.methods.join(' · ')}</div>
              <USPs items={clinic.usp} small />
              <ClinicTags clinic={clinic} small />
            </div>
            {/* Col 3 – opening hours + CTA */}
            <div className="flex flex-col justify-between" style={{ flexShrink: 0, textAlign: 'right', width: '160px' }}>
              <div>
                <div style={{ color: appointmentOnly ? '#0052CC' : openToday ? '#00A651' : '#CC0000', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  {appointmentOnly ? 'Nur nach Vereinbarung' : openToday ? 'Heute geöffnet' : 'Heute geschlossen'}
                </div>
                {openToday && (
                  <div style={{ fontSize: '11px', color: '#555', lineHeight: 1.6 }}>
                    {(clinic.openHours ?? '').split(/,\s*/).filter(Boolean).map((segment, i) => (
                      <div key={i}>{segment}</div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button onClick={() => onInquire(clinic)} style={{ backgroundColor: ctaColor, color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '4px', height: '38px', width: '160px', cursor: 'pointer', marginBottom: '6px' }}>{vt.cta}</button>
                <button onClick={openProfile} style={{ backgroundColor: '#fff', color: '#666', fontSize: '13px', border: '1px solid #CCC', borderRadius: '4px', height: '34px', width: '160px', cursor: 'pointer', marginBottom: onToggleSelect ? '6px' : '0' }}>Profil ansehen</button>
                {onToggleSelect && (
                  <button
                    onClick={onToggleSelect}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      width: '160px', height: '32px',
                      backgroundColor: isSelected ? '#003399' : '#fff',
                      color: isSelected ? '#fff' : '#555',
                      fontSize: '12px', fontWeight: isSelected ? 700 : 500,
                      border: `1.5px solid ${isSelected ? '#003399' : '#CCC'}`,
                      borderRadius: '4px', cursor: 'pointer',
                    }}
                  >
                    <span style={{
                      width: '14px', height: '14px', borderRadius: '3px', flexShrink: 0,
                      border: `1.5px solid ${isSelected ? '#fff' : '#999'}`,
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: '9px', fontWeight: 900, lineHeight: 1 }}>✓</span>}
                    </span>
                    {isSelected ? 'Ausgewählt' : 'Vergleichen'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
      {(showReviews || showProfile) && (
        <Suspense fallback={null}>
          {showReviews && <GoogleReviewsModal clinic={clinic} onClose={() => setShowReviews(false)} />}
          {showProfile && <ClinicProfileModal clinic={clinic} onClose={() => setShowProfile(false)} onInquire={onInquire} onShowReviews={() => setShowReviews(true)} hasUserCoords={hasUserCoords} />}
        </Suspense>
      )}
    </>
  )
}
