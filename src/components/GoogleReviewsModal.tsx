import { useEffect, useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import { useModalDismiss } from '../lib/useModalDismiss'

interface Props {
  clinic: Clinic
  onClose: () => void
}

interface Review {
  author: string
  initial: string
  color: string
  rating: number
  date: string
  text: string
}

const AVATAR_COLORS = ['#4285F4', '#EA4335', '#34A853', '#FBBC05', '#9C27B0', '#00ACC1', '#FF7043', '#8D6E63']

function colorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatGoogleReview(r: {
  author_name?: string
  rating?: number
  relative_time_description?: string
  text?: string
}): Review {
  const author = r.author_name ?? 'Anonym'
  return {
    author,
    initial: author.charAt(0).toUpperCase(),
    color: colorForName(author),
    rating: r.rating ?? 5,
    date: r.relative_time_description ?? '',
    text: r.text ?? '',
  }
}


const DUMMY_SUMMARY = [
  'Patienten loben häufig die ausführliche Beratung und das freundliche, einfühlsame Team',
  'Deutliche Ergebnisse werden bereits nach 1–2 Sitzungen berichtet',
  'Moderne Praxis mit guter Online-Buchbarkeit - vereinzelt werden Wartezeiten erwähnt',
]

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span>{Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#FFB400' : '#DDD', fontSize: size }}>★</span>
    ))}</span>
  )
}

const GoogleLogo = () => (
  <svg width="60" height="20" viewBox="0 0 272 92" xmlns="http://www.w3.org/2000/svg">
    <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
    <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
    <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.67-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.26zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
    <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
    <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
    <path d="M35.29 41.41V32h31.91c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.71.36 15.53 16.32.07 35.5.07c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" fill="#4285F4"/>
  </svg>
)

export default function GoogleReviewsModal({ clinic, onClose }: Props) {
  const dialogRef = useModalDismiss<HTMLDivElement>(onClose)
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<string[]>(DUMMY_SUMMARY)
  const [liveRating, setLiveRating] = useState<number | null>(null)
  const [liveReviewCount, setLiveReviewCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`
  const displayRating = liveRating ?? clinic.googleRating ?? 0
  const displayReviewCount = liveReviewCount ?? clinic.googleReviewCount ?? 0

  useEffect(() => {
    if (!clinic.placeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(true)
      return
    }
    setLoading(true)
    setError(false)
    // Primary: static pre-fetched JSON (updated every 3 days via GitHub Actions)
    // Fallback: live Netlify function
    const staticUrl = `/reviews/${encodeURIComponent(clinic.placeId)}.json`
    const liveUrl = `/.netlify/functions/reviews?placeId=${encodeURIComponent(clinic.placeId)}`

    fetch(staticUrl)
      .then(r => r.ok ? r.json() : Promise.reject('no static file'))
      .catch(() => fetch(liveUrl).then(r => r.json()))
      .then((data: { reviews?: Parameters<typeof formatGoogleReview>[0][]; rating?: number; reviewCount?: number; summary?: string[] }) => {
        if (Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews.map(formatGoogleReview))
        } else {
          setError(true)
        }
        if (Array.isArray(data.summary) && data.summary.length > 0) setSummary(data.summary)
        if (data.rating) setLiveRating(data.rating)
        if (data.reviewCount) setLiveReviewCount(data.reviewCount)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [clinic.placeId])

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Google-Bewertungen" style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '540px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #EEE', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <GoogleLogo />
            <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '8px', color: '#111' }}>{clinic.name}</div>
          </div>
          <button onClick={onClose} aria-label="Bewertungen schließen" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666' }}>
            <X size={20} />
          </button>
        </div>

        {/* Rating summary */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 300, color: '#111', lineHeight: 1 }}>{displayRating.toFixed(1)}</div>
            <Stars rating={Math.round(displayRating)} size={18} />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{displayReviewCount} Bewertungen</div>
          </div>
          <div style={{ flex: 1 }}>
            {[5,4,3,2,1].map(star => {
              const pct = star === 5 ? 60 : star === 4 ? 25 : star === 3 ? 10 : star === 2 ? 3 : 2
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#666', width: '6px' }}>{star}</span>
                  <span style={{ fontSize: '11px', color: '#FFB400' }}>★</span>
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#EEE', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#FFB400', borderRadius: '4px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scrollable: summary + reviews */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 20px 8px' }}>

          {/* AI summary */}
          <div style={{ backgroundColor: '#F0F4FF', borderRadius: '8px', padding: '12px 14px', border: '1px solid #DDE5FF', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
              <Sparkles size={13} color="#4B6BCC" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#4B6BCC', letterSpacing: '0.04em', textTransform: 'uppercase' }}>KI-Zusammenfassung der Bewertungen</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {summary.map((point, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '13px', color: '#2D3A6B', lineHeight: '1.5', marginBottom: i < summary.length - 1 ? '5px' : 0 }}>
                  <span style={{ color: '#4B6BCC', fontWeight: 700, marginTop: '1px', flexShrink: 0 }}>•</span>
                  {point}
                </li>
              ))}
            </ul>
            <div style={{ fontSize: '10px', color: '#7A87B8', marginTop: '8px', lineHeight: 1.5, borderTop: '1px solid #DDE5FF', paddingTop: '6px' }}>
              Automatisch generiert aus öffentlichen Google-Bewertungen. Quelle: Google Maps – Bewertungen werden nicht von uns verifiziert.
            </div>
          </div>

          {/* Reviews */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#999', fontSize: '13px' }}>Bewertungen werden geladen…</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '32px 20px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>😔</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#444', marginBottom: '6px' }}>Bewertungen konnten nicht geladen werden</div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>Bitte direkt auf Google nachschauen.</div>
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#4285F4', textDecoration: 'none', fontWeight: 500 }}>
                Auf Google Maps ansehen ↗
              </a>
            </div>
          ) : (
            reviews.map((review, i) => (
              <div key={i} style={{ padding: '14px 0', borderBottom: i < reviews.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: review.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '15px', flexShrink: 0 }}>
                    {review.initial}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#111' }}>{review.author}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Stars rating={review.rating} size={12} />
                      <span style={{ fontSize: '11px', color: '#999' }}>{review.date}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', margin: 0 }}>{review.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer – Google attribution */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA', borderRadius: '0 0 8px 8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', color: '#BBB' }}>Bewertungen von Google</span>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: '#CCC', textDecoration: 'none' }}>
            Quelle: Google Maps ↗
          </a>
        </div>

      </div>
    </div>
  )
}
