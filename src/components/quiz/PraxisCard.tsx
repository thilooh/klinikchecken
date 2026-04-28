import { Star, MapPin } from 'lucide-react'
import type { ScoredPraxis } from '../../lib/quizPraxenSort'

interface Props {
  praxis: ScoredPraxis
  onContact: (p: ScoredPraxis) => void
}

// "Empfohlen für deinen Befund" badge fires only when premium_plus
// AND the practice actually offers a method matching the quiz answers.
// Premium-plus alone is not enough - that would be UWG-§5a hidden
// advertising risk.
export default function PraxisCard({ praxis, onContact }: Props) {
  const showRecommendedBadge = praxis.tier === 'premium_plus' && praxis.isMatch
  const isContactable = praxis.tier !== 'basic'
  const rating = praxis.googleRating ?? praxis.rating
  const reviewCount = praxis.googleReviewCount ?? praxis.reviewCount

  // Compact basic-tier card: no contact CTA, just an external link
  // to the practice website. Per § 31 MBO-Ä framing - we don't
  // mediate paid leads, so non-paying practices get a directory
  // listing rather than a click-to-contact button.
  if (!isContactable) {
    return (
      <div style={{ backgroundColor: '#fff', borderRadius: '6px', padding: '12px 14px', marginBottom: '8px', border: '1px solid #E5E9F2', fontSize: '13px' }}>
        <div style={{ fontWeight: 700, color: '#0A1F44' }}>{praxis.name}</div>
        <div style={{ color: '#666', fontSize: '12px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <MapPin size={12} aria-hidden="true" />
          {praxis.distance_km < Number.POSITIVE_INFINITY ? `${praxis.distance_km.toFixed(1)} km · ` : ''}
          {praxis.address}
          {praxis.webseite && (
            <a href={praxis.webseite} target="_blank" rel="noopener noreferrer" style={{ color: '#0052CC', marginLeft: '4px' }}>
              Zur Webseite ↗
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '16px 18px',
      marginBottom: '12px',
      border: showRecommendedBadge ? '2px solid #003399' : '1px solid #DDE3F5',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {showRecommendedBadge && (
        <div style={{ display: 'inline-block', backgroundColor: '#EEF4FF', color: '#003399', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '4px', marginBottom: '8px' }}>
          ⭐ EMPFOHLEN FÜR DEINEN BEFUND
        </div>
      )}
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0A1F44', marginBottom: '4px' }}>{praxis.name}</h3>
      {rating > 0 && reviewCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#444', marginBottom: '4px' }}>
          <Star size={14} fill="#FFB400" stroke="none" />
          <strong>{rating.toFixed(1)}</strong>
          <span style={{ color: '#888' }}>({reviewCount} Bewertungen)</span>
        </div>
      )}
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MapPin size={13} aria-hidden="true" />
        {praxis.distance_km < Number.POSITIVE_INFINITY ? `${praxis.distance_km.toFixed(1)} km · ` : ''}
        {praxis.address}
      </div>
      {praxis.methods.length > 0 && (
        <div style={{ fontSize: '13px', color: '#444', marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {praxis.methods.slice(0, 4).map(m => (
            <span key={m} style={{ backgroundColor: '#EEF4FF', color: '#003399', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{m}</span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => onContact(praxis)}
        style={{
          width: '100%', backgroundColor: '#FF6600', color: '#fff', fontWeight: 700,
          fontSize: '14px', border: 'none', borderRadius: '6px', padding: '11px 14px', cursor: 'pointer',
        }}
      >
        Diese Praxis kontaktieren →
      </button>
    </div>
  )
}
