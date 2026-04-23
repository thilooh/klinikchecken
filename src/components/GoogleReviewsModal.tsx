import { X } from 'lucide-react'
import type { Clinic } from '../types/clinic'

interface Props {
  clinic: Clinic
  onClose: () => void
}

const DUMMY_REVIEWS = [
  { author: 'Maria S.', initial: 'M', color: '#4285F4', rating: 5, date: 'vor 2 Wochen', text: 'Sehr professionelle Behandlung und einfühlsames Personal. Die Beratung war ausführlich, ich wurde über alle Optionen informiert. Nach 2 Sitzungen bereits deutlich sichtbare Verbesserung. Sehr empfehlenswert!' },
  { author: 'Thomas K.', initial: 'T', color: '#EA4335', rating: 4, date: 'vor 1 Monat', text: 'Kompetente Ärztin, die sich wirklich Zeit nimmt. Terminvergabe unkompliziert, auch online buchbar. Die Behandlung war effektiv und das Ergebnis überzeugend. Preis-Leistung stimmt.' },
  { author: 'Sandra M.', initial: 'S', color: '#34A853', rating: 5, date: 'vor 3 Wochen', text: 'Bin wirklich begeistert! Schon nach der ersten Sitzung sah man deutliche Verbesserungen. Das Team ist sehr freundlich und erklärt jeden Schritt genau. Absolute Empfehlung!' },
  { author: 'Andreas B.', initial: 'A', color: '#FBBC05', rating: 4, date: 'vor 2 Monaten', text: 'Moderne Praxis mit neuester Technik. Sehr saubere und angenehme Atmosphäre. Das Ergebnis ist sehr ordentlich, ich bin zufrieden und würde wiederkommen.' },
  { author: 'Julia F.', initial: 'J', color: '#9C27B0', rating: 3, date: 'vor 6 Wochen', text: 'Gute Praxis, aber die Wartezeiten könnten besser organisiert werden. Die Behandlung selbst war gut durchgeführt und das Ergebnis ist in Ordnung.' },
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
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '540px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #EEE', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <GoogleLogo />
            <div style={{ fontWeight: 700, fontSize: '15px', marginTop: '8px', color: '#111' }}>{clinic.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666' }}>
            <X size={20} />
          </button>
        </div>

        {/* Rating summary */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEE', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 300, color: '#111', lineHeight: 1 }}>{clinic.googleRating.toFixed(1)}</div>
            <Stars rating={clinic.googleRating} size={18} />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{clinic.googleReviewCount} Bewertungen</div>
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

        {/* Reviews */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px' }}>
          {DUMMY_REVIEWS.map((review, i) => (
            <div key={i} style={{ padding: '14px 0', borderBottom: i < DUMMY_REVIEWS.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
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
          ))}
        </div>

        {/* Footer – Google attribution (legally required, visually subtle) */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFA', borderRadius: '0 0 8px 8px' }}>
          <span style={{ fontSize: '11px', color: '#BBB' }}>Bewertungen von Google</span>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '10px', color: '#CCC', textDecoration: 'none' }}
          >
            Quelle: Google Maps ↗
          </a>
        </div>

      </div>
    </div>
  )
}
