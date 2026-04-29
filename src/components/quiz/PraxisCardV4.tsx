// V4 result-page card. Strips the homepage ClinicCard's image carousel
// and three-column layout in favour of an info-dense 1×1×1×1 grid:
//
//   Mechanism      - methods the praxis offers (Sklerotherapie, Laser, ...)
//   Villain-Match  - discipline + reframe anchor (Phlebologie / Dermatologie)
//   Promise        - distance + opening today
//   Proof          - founding year + doctor + qualification
//
// Plus a Top-Match badge on the first praxis (highest match score)
// to kill choice-paralysis. UWG: a paid Premium-Partner badge still
// renders on top of the card when applicable - that's a legal
// requirement and independent of medical fit.

import { MapPin, Sparkles } from 'lucide-react'
import type { ScoredPraxis } from '../../lib/quizPraxenSort'
import { isOpenToday, isAppointmentOnly } from '../../lib/openHours'

interface Props {
  praxis: ScoredPraxis
  ctaColor: string
  onContact: (p: ScoredPraxis) => void
  isTopMatch: boolean
}

const FACE_HINTS = /(dermat|gesicht|haut|kapillar)/i
const PHLEB_HINTS = /(phleb|venen|krampf|sklero)/i

function disciplineFor(praxis: ScoredPraxis): { name: string; reframe: string } {
  const haystack = `${praxis.qualification} ${praxis.methods.join(' ')} ${praxis.headline ?? ''}`
  if (PHLEB_HINTS.test(haystack)) {
    return { name: 'Phlebologie', reframe: 'arbeitet an der Ader, nicht an der Haut' }
  }
  if (FACE_HINTS.test(haystack)) {
    return { name: 'Dermatologie', reframe: 'arbeitet an der Kapillarader im Gesicht' }
  }
  return { name: 'Phlebologie / Dermatologie', reframe: 'arbeitet an der Ader' }
}

export default function PraxisCardV4({ praxis, ctaColor, onContact, isTopMatch }: Props) {
  const isPaidPartner = praxis.tier === 'premium_plus' || praxis.tier === 'premium'
  const openToday = isOpenToday(praxis.openHours)
  const appointmentOnly = isAppointmentOnly(praxis.openHours)
  const discipline = disciplineFor(praxis)

  const distanceText = Number.isFinite(praxis.distanceKm) ? `${praxis.distanceKm} km` : null
  const openText = appointmentOnly
    ? 'Termin nach Vereinbarung'
    : openToday
      ? `Heute geöffnet${praxis.openHours ? ` · ${praxis.openHours.split(/,\s*/)[0]}` : ''}`
      : 'Heute geschlossen'

  const proofParts: string[] = []
  if (praxis.foundedYear) proofParts.push(`Seit ${praxis.foundedYear}`)
  if (praxis.doctor) {
    proofParts.push(praxis.qualification ? `${praxis.doctor}, ${praxis.qualification}` : praxis.doctor)
  } else if (praxis.qualification) {
    proofParts.push(praxis.qualification)
  }
  const proof = proofParts.join(' · ')

  return (
    <div style={{ marginBottom: '14px', position: 'relative' }}>
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
      <div style={{
        backgroundColor: '#fff',
        border: isTopMatch ? '2px solid #003399' : '1px solid #DDDDDD',
        borderRadius: '6px',
        padding: '14px 16px',
        position: 'relative',
      }}>
        {isTopMatch && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#E8F0FF', color: '#003399',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
            padding: '4px 10px', borderRadius: '20px',
            marginBottom: '8px',
          }}>
            <Sparkles size={12} />
            BESTE ÜBEREINSTIMMUNG MIT DEINEM PROFIL
          </div>
        )}

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0A1F44', margin: '0 0 6px 0', lineHeight: 1.3 }}>
          {praxis.name}
        </h3>

        {/* Mechanism */}
        <div style={{ fontSize: '13px', color: '#0A1F44', fontWeight: 600, marginBottom: '4px' }}>
          {praxis.methods.join(' · ')}
        </div>

        {/* Villain-Match - discipline + reframe anchor */}
        <div style={{ fontSize: '13px', color: '#444', marginBottom: '10px', lineHeight: 1.4 }}>
          <strong>{discipline.name}</strong> — {discipline.reframe}
        </div>

        {/* Promise - distance + opening */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555', marginBottom: proof ? '4px' : '12px' }}>
          <MapPin size={13} style={{ flexShrink: 0 }} />
          <span>
            {distanceText && <>{distanceText} · </>}
            <span style={{ color: appointmentOnly ? '#0052CC' : openToday ? '#00A651' : '#CC0000', fontWeight: 600 }}>{openText}</span>
          </span>
        </div>

        {/* Proof */}
        {proof && (
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px', lineHeight: 1.4 }}>
            {proof}
          </div>
        )}

        <button
          onClick={() => onContact(praxis)}
          style={{
            width: '100%', backgroundColor: ctaColor, color: '#fff',
            fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '6px',
            padding: '12px 16px', cursor: 'pointer',
          }}
        >
          Erstgespräch anfragen →
        </button>

        <div style={{ fontSize: '11px', color: '#888', textAlign: 'center', marginTop: '6px', fontStyle: 'italic' }}>
          Du verpflichtest dich zu nichts.
        </div>
      </div>
    </div>
  )
}
