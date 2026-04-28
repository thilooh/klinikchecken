import ClinicCard from '../ClinicCard'
import type { ScoredPraxis } from '../../lib/quizPraxenSort'

interface Props {
  praxis: ScoredPraxis
  ctaColor: string
  onContact: (p: ScoredPraxis) => void
  index: number
}

// Reuses the homepage ClinicCard so the result page looks identical
// to the rest of the site. Premium-plus clinics get a "Premium-Partner"
// badge with a clearly visible "(Anzeige)" label - UWG §5a requires
// paid placements to be marked as advertising regardless of how good
// the match is. The badge is intentionally NOT framed as "empfohlen
// für deinen Befund" so we don't conflate paid relationship with
// medical fit.
//
// TODO: once the tier system carries real contracts, restore the
// compact basic-tier directory listing (no inquiry CTA, just a link
// to the practice website) per the original brief. Currently every
// clinic is tier='basic' as the placeholder default, so showing the
// compact variant here would mean showing it for everyone, which
// looks like a phone book rather than a clinic-finder.
export default function PraxisCard({ praxis, ctaColor, onContact, index }: Props) {
  const isPaidPartner = praxis.tier === 'premium_plus' || praxis.tier === 'premium'

  return (
    <div style={{ marginBottom: '12px' }}>
      {isPaidPartner && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#003399', color: '#fff',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
          padding: '4px 10px', borderRadius: '4px 4px 0 0',
          marginBottom: '-1px', position: 'relative', zIndex: 1,
        }}>
          <span>PREMIUM-PARTNER</span>
          <span style={{ fontWeight: 400, opacity: 0.85, fontSize: '10px', letterSpacing: '0.04em' }}>· ANZEIGE</span>
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
