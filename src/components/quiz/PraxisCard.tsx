import ClinicCard from '../ClinicCard'
import type { ScoredPraxis } from '../../lib/quizPraxenSort'

interface Props {
  praxis: ScoredPraxis
  ctaColor: string
  onContact: (p: ScoredPraxis) => void
  index: number
}

// Reuses the homepage ClinicCard so the result page looks identical
// to the rest of the site. The "Empfohlen für deinen Befund" badge
// sits above the card and only fires when the tier is premium_plus
// AND the clinic's methods actually match the quiz answers (UWG §5a
// defence-in-depth - badge can't appear on a non-matching clinic).
//
// TODO: once the tier system carries real contracts, restore the
// compact basic-tier directory listing (no inquiry CTA, just a link
// to the practice website) per the original brief. Currently every
// clinic is tier='basic' as the placeholder default, so showing the
// compact variant here would mean showing it for everyone, which
// looks like a phone book rather than a clinic-finder.
export default function PraxisCard({ praxis, ctaColor, onContact, index }: Props) {
  const showRecommendedBadge = praxis.tier === 'premium_plus' && praxis.isMatch

  return (
    <div style={{ marginBottom: '12px' }}>
      {showRecommendedBadge && (
        <div style={{
          display: 'inline-block',
          backgroundColor: '#003399', color: '#fff',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
          padding: '4px 10px', borderRadius: '4px 4px 0 0',
          marginBottom: '-1px', position: 'relative', zIndex: 1,
        }}>
          ⭐ EMPFOHLEN FÜR DEINEN BEFUND
        </div>
      )}
      <ClinicCard
        clinic={praxis}
        onInquire={() => onContact(praxis)}
        ctaColor={ctaColor}
        hasUserCoords={Number.isFinite(praxis.distanceKm)}
        index={index}
      />
    </div>
  )
}
