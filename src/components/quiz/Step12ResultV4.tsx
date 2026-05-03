// V4/V5 result page - calendar-first delivery surface.
//
// Pre-2026-05-03 layout was a re-pitch wall. Now: hero → ONE
// featured praxis → calendar widget → trust signals → collapsed
// drawers for everything else (other praxen, profile, comparison
// table). Apply Schwartz's Most-Aware lead-with-the-deal +
// Sugarman's slippery-slide. The visitor on this page came from a
// quiz submit or an email click - she's already bought the
// premise. Goal here is one click: pick wunsch-slots, submit.
//
// Drawer praxen still go through the legacy AnfrageModal flow as a
// fallback - those are alternatives, not the primary action. The
// calendar widget routes a separate /termin-buchen function that
// writes to the GAS Termin_Anfragen tab.

import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { ChevronDown, ChevronUp, MapPin, RotateCcw, Sparkles, Star } from 'lucide-react'
import type { QuizAnswers, QuizLead, ComputedProfile } from '../../lib/quizState'
import {
  getAuspraegungLabel,
  getDringlichkeitLabel,
  getProgressionHint,
} from '../../lib/quizProfileCompute'
import { getMethodRecommendation, getRelevantMethods } from '../../lib/quizRecommendations'
import { sortPraxen, getCityCenter, type ScoredPraxis } from '../../lib/quizPraxenSort'
import { useClinics } from '../../hooks/useClinics'
import { matchCity } from '../../lib/cityMatch'
import { isOpenToday, isAppointmentOnly } from '../../lib/openHours'
import { getCTAColor, getCTAVariant } from '../../lib/ctaVariant'
import { trackQuizFindLocation } from '../../lib/quizTracking'
import ComparisonTable from './ComparisonTable'
import PraxisCardV4 from './PraxisCardV4'
import AnfrageModal from './AnfrageModal'
import TerminWidget from './TerminWidget'

// Lazy-loaded so the modal stays out of the main bundle - only
// downloaded when the user clicks the rating row.
const GoogleReviewsModal = lazy(() => import('../GoogleReviewsModal'))

interface Props {
  answers: QuizAnswers
  lead: QuizLead
  profile: ComputedProfile
  onReset: () => void
  variant?: 'v4' | 'v5'
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

// Match-reason line - tells the visitor WHY this specific practice
// matches her profile. Without this the "DEIN MATCH" badge is just
// a claim; with it the badge has Hopkins-style reason-why backing.
// Picks the most-specific reason available given the user's quiz
// answers + the practice's methods. Returns null when nothing
// matches (rare - falls back to "DEIN MATCH" badge alone).
function matchReason(praxis: ScoredPraxis, answers: QuizAnswers): string | null {
  const isFace = answers.q1_lokalisation === 'gesicht'
  const groesse = answers.q3_groesse
  const hauttyp = answers.q4_hauttyp
  const methods = new Set(praxis.methods)

  if (!isFace && groesse === 'flaechig' && methods.has('Schaumsklerotherapie')) {
    return 'Diese Praxis bietet Schaumsklerotherapie - bei flächigen Befunden wie deinem die Methode der Wahl.'
  }
  if (hauttyp === 'dunkler' && methods.has('Laser (Nd:YAG)')) {
    return 'Diese Praxis arbeitet mit Nd:YAG (1064 nm) - der sicheren Wellenlänge für deinen Hauttyp.'
  }
  if (!isFace && groesse === 'fein' && (methods.has('Laser (Nd:YAG)') || methods.has('KTP-Laser'))) {
    return 'Diese Praxis bietet Laser-Verfahren - bei sehr feinen Adern wie deinen oft erste Wahl.'
  }
  if (!isFace && (groesse === 'mittel' || groesse === 'groesser') && methods.has('Sklerotherapie')) {
    return 'Diese Praxis bietet Sklerotherapie - bei mittleren bis größeren Adern Standard.'
  }
  if (isFace && (methods.has('Laser (Nd:YAG)') || methods.has('KTP-Laser') || methods.has('IPL'))) {
    return 'Diese Praxis arbeitet mit Laser-Verfahren, die direkt an der Kapillarader im Gesicht ansetzen.'
  }
  if (methods.has('Sklerotherapie') || methods.has('Schaumsklerotherapie')) {
    return 'Diese Praxis bietet Sklero-Verfahren, die direkt an der Ader arbeiten.'
  }
  if (methods.has('Laser (Nd:YAG)') || methods.has('KTP-Laser')) {
    return 'Diese Praxis arbeitet mit Laser-Verfahren, die direkt an der Ader arbeiten.'
  }
  return null
}

export default function Step12ResultV4({ answers, lead, profile, onReset }: Props) {
  const { clinics } = useClinics()
  const [contactPraxis, setContactPraxis] = useState<ScoredPraxis | null>(null)
  const [otherOpen, setOtherOpen] = useState(false)
  const [profilOpen, setProfilOpen] = useState(false)
  const [proofOpen, setProofOpen] = useState(false)
  const [ctaVariant] = useState(() => getCTAVariant())
  const ctaColor = getCTAColor(ctaVariant)

  const recommendation = useMemo(() => getMethodRecommendation(answers), [answers])
  const progressionHint = useMemo(() => getProgressionHint(answers), [answers])

  const relevantMethods = useMemo(() => getRelevantMethods(answers), [answers])
  const userCity = useMemo(() => matchCity(lead.plz), [lead.plz])
  const userCoords = useMemo(() => getCityCenter(clinics, userCity), [clinics, userCity])
  const sortedPraxen = useMemo(
    () => sortPraxen(clinics, userCoords, relevantMethods),
    [clinics, userCoords, relevantMethods],
  )

  useEffect(() => {
    if (sortedPraxen.length === 0 && clinics.length > 0) return
    trackQuizFindLocation(answers, lead, profile, sortedPraxen.length, ctaVariant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.typ])

  const topPraxis = sortedPraxen[0] ?? null
  const otherPraxen = sortedPraxen.slice(1, 6)
  const isFace = answers.q1_lokalisation === 'gesicht'
  const cityLabel = userCity ?? `PLZ ${lead.plz}`
  const vorname = lead.vorname || 'Hey'

  const profileSummary = [
    profile.typ,
    getAuspraegungLabel(profile.auspraegungScore).toLowerCase(),
    getDringlichkeitLabel(profile.dringlichkeitScore).split(' - ')[0].toLowerCase(),
  ].join(' · ')

  return (
    <>
      {/* Hero - outcome promise + specificity. Schwartz Most-Aware:
          lead with the deal. The visitor knows what we offer; show
          her what's 30 seconds away. */}
      <div style={{ marginBottom: '18px', padding: '0 4px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1F44', margin: '0 0 6px 0', lineHeight: 1.25 }}>
          {topPraxis
            ? `${vorname}, dein Wunsch-Termin in ${cityLabel} ist 30 Sekunden entfernt.`
            : `${vorname}, hier ist deine Auswertung.`}
        </h1>
        <p style={{ fontSize: '14px', color: '#444', margin: 0, lineHeight: 1.5 }}>
          {topPraxis
            ? `Wähl unten 1-3 Wunsch-Zeiten. ${topPraxis.name} schaut sich ${isFace ? 'deine Adern im Gesicht' : 'deine Beine'} an, sagt dir was sie sieht und macht einen konkreten Behandlungsvorschlag.`
            : 'Wir laden gleich passende Praxen für dich.'}
        </p>
      </div>

      {topPraxis && <FeaturedPraxisCard praxis={topPraxis} answers={answers} />}

      {topPraxis ? (
        <TerminWidget praxis={topPraxis} lead={lead} answers={answers} profile={profile} />
      ) : sortedPraxen.length === 0 && clinics.length > 0 ? (
        <p style={{ fontSize: '14px', color: '#666', padding: '16px 4px', marginBottom: '16px' }}>
          In {cityLabel} haben wir gerade keine matchende Praxis. Andere Optionen siehe unten.
        </p>
      ) : (
        <p style={{ fontSize: '14px', color: '#666', padding: '0 4px', marginBottom: '20px' }}>
          Wir laden gleich passende Praxen für dich.
        </p>
      )}

      {/* Other praxen drawer - alternatives if the featured one isn't
          a fit. Uses the legacy AnfrageModal flow because those
          aren't the primary action. */}
      {otherPraxen.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setOtherOpen(o => !o)}
            aria-expanded={otherOpen}
            style={{
              width: '100%', background: '#fff', border: '1px solid #DDE3F5',
              color: '#003399', fontWeight: 600, fontSize: '13px',
              padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: otherOpen ? '8px' : '12px',
            }}
          >
            <span>{topPraxis ? `Falls ${topPraxis.name} nicht passt: ${otherPraxen.length} andere in ${cityLabel}` : `${otherPraxen.length} weitere Praxen in ${cityLabel}`}</span>
            {otherOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {otherOpen && otherPraxen.map(p => (
            <PraxisCardV4
              key={p.id}
              praxis={p}
              ctaColor={ctaColor}
              onContact={setContactPraxis}
              isTopMatch={false}
            />
          ))}
        </>
      )}

      {/* Profile drawer - the auswertung as proof-on-demand. Schwartz
          Most-Aware: she doesn't need to re-read it, but we have it
          if she wants to verify the matching logic. */}
      <button
        type="button"
        onClick={() => setProfilOpen(o => !o)}
        aria-expanded={profilOpen}
        style={{
          width: '100%', background: '#fff', border: '1px solid #DDE3F5',
          color: '#003399', fontWeight: 600, fontSize: '13px',
          padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: profilOpen ? '8px' : '12px',
        }}
      >
        <span>Mein Profil im Überblick</span>
        {profilOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {profilOpen && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #DDE3F5', borderRadius: '6px', padding: '16px', marginBottom: '12px' }}>
          <p style={{ fontSize: '14px', color: '#0A1F44', margin: '0 0 10px 0', lineHeight: 1.5 }}>
            <strong>Profil:</strong> {profileSummary}
          </p>
          <p style={{ fontSize: '13px', color: '#444', margin: '0 0 10px 0', lineHeight: 1.6 }}>
            Bei vergleichbaren Befunden kommen in der {recommendation.fachgebiet} häufig folgende Methoden zum Einsatz: <strong>{recommendation.primary}</strong>. {recommendation.description}
          </p>
          {progressionHint && (
            <p style={{ fontSize: '13px', color: '#444', backgroundColor: '#FFF8E1', border: '1px solid #F5DD8C', padding: '10px 12px', borderRadius: '4px', margin: 0, lineHeight: 1.5 }}>
              <strong>Hinweis:</strong> {progressionHint}
            </p>
          )}
        </div>
      )}

      {/* Comparison-table drawer - proof reserve. Convinced users
          skip; sceptics expand. */}
      <button
        type="button"
        onClick={() => setProofOpen(o => !o)}
        aria-expanded={proofOpen}
        style={{
          width: '100%', background: '#fff', border: '1px solid #DDE3F5',
          color: '#003399', fontWeight: 600, fontSize: '13px',
          padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: proofOpen ? '8px' : '20px',
        }}
      >
        <span>Warum Sklero und Laser, und nicht Cremes?</span>
        {proofOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {proofOpen && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #DDE3F5', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#0A1F44', fontWeight: 600, marginBottom: '12px', lineHeight: 1.5 }}>
            {isFace
              ? 'Make-up legt sich über die Ader. Pflege wirkt in der Hautoberfläche. Beides erreicht das Gefäß nicht.'
              : 'Vier davon arbeiten an der Oberfläche. Zwei arbeiten an der Ader selbst.'}
          </p>
          <ComparisonTable />
        </div>
      )}

      {/* UWG transparency line - paid placements + sort logic. */}
      <p style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginBottom: '20px', padding: '0 4px', lineHeight: 1.5 }}>
        ℹ️ Diese Übersicht ist eine Orientierungshilfe und ersetzt keine ärztliche Diagnose. Die Reihenfolge basiert auf Methoden-Übereinstimmung mit deinen Angaben sowie Entfernung. Mit <strong>„Anzeige"</strong> markierte Praxen sind zahlende Premium-Partner - die Auswahl der gezeigten Praxen ist unabhängig vom Premium-Status.
      </p>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={onReset} style={{ background: 'none', border: 'none', color: '#0052CC', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
          <RotateCcw size={13} /> Quiz neu starten
        </button>
      </div>

      {contactPraxis && (
        <AnfrageModal
          praxis={contactPraxis}
          lead={lead}
          answers={answers}
          profile={profile}
          variant="v4"
          onClose={() => setContactPraxis(null)}
        />
      )}
    </>
  )
}

// Featured praxis card - hero variant of PraxisCardV4 without the
// "Erstgespräch anfragen" CTA, because the calendar widget below is
// the action surface. Visually distinct (slightly larger) so it
// reads as "your match" rather than just an item in a list.
//
// Adds vs PraxisCardV4: DEIN-MATCH badge, match-reason line that
// justifies the badge with quiz-aware specificity, Google rating
// row when available (UWG-defensible social proof, no marketing
// claim). Also dedupes doctor / qualification when they hold the
// same string and hides distance when 0 km (same-city case).
function FeaturedPraxisCard({ praxis, answers }: { praxis: ScoredPraxis; answers: QuizAnswers }) {
  const isPaidPartner = praxis.tier === 'premium_plus' || praxis.tier === 'premium'
  const openToday = isOpenToday(praxis.openHours)
  const appointmentOnly = isAppointmentOnly(praxis.openHours)
  const discipline = disciplineFor(praxis)
  const reason = matchReason(praxis, answers)
  const [showReviews, setShowReviews] = useState(false)

  // Click handler - if we have a placeId we can show the rich
  // GoogleReviewsModal (rendered text + author + time). If not we
  // fall back to opening Google Maps in a new tab so the user still
  // gets to read the reviews, just on Google's side.
  const openReviews = () => {
    if (praxis.placeId) {
      setShowReviews(true)
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(praxis.name + ' ' + (praxis.address || ''))}`,
        '_blank',
        'noopener,noreferrer',
      )
    }
  }

  const distanceText = Number.isFinite(praxis.distanceKm) && praxis.distanceKm > 0
    ? `${praxis.distanceKm} km`
    : null
  const openText = appointmentOnly
    ? 'Termin nach Vereinbarung'
    : openToday
      ? `Heute geöffnet${praxis.openHours ? ` · ${praxis.openHours.split(/,\s*/)[0]}` : ''}`
      : 'Heute geschlossen'

  // Doctor / qualification dedupe - some clinic rows have the same
  // text in both fields (e.g. "Facharzt für Innere Medizin und
  // Angiologie") which previously printed the string twice.
  const proofParts: string[] = []
  if (praxis.foundedYear) proofParts.push(`Seit ${praxis.foundedYear}`)
  const doctorTrim = (praxis.doctor || '').trim()
  const qualTrim = (praxis.qualification || '').trim()
  if (doctorTrim && qualTrim && doctorTrim !== qualTrim) {
    proofParts.push(`${doctorTrim}, ${qualTrim}`)
  } else if (doctorTrim) {
    proofParts.push(doctorTrim)
  } else if (qualTrim) {
    proofParts.push(qualTrim)
  }
  const proof = proofParts.join(' · ')

  const hasRating = praxis.googleRating && praxis.googleRating > 0 && praxis.googleReviewCount && praxis.googleReviewCount > 0

  return (
    <div style={{ marginBottom: '16px', position: 'relative' }}>
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
        border: '2px solid #003399',
        borderRadius: '8px',
        padding: '18px 20px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          backgroundColor: '#E8F0FF', color: '#003399',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
          padding: '4px 10px', borderRadius: '20px',
          marginBottom: '10px',
        }}>
          <Sparkles size={12} />
          DEIN MATCH
        </div>

        <h2 style={{ fontSize: '19px', fontWeight: 700, color: '#0A1F44', margin: '0 0 8px 0', lineHeight: 1.25 }}>
          {praxis.name}
        </h2>

        {hasRating && (
          <button
            type="button"
            onClick={openReviews}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginBottom: '12px', padding: 0, background: 'none', border: 'none',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <Star size={15} color="#FFB400" fill="#FFB400" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0A1F44' }}>{praxis.googleRating!.toFixed(1)}</span>
            <span style={{ fontSize: '12px', color: '#003399', fontWeight: 600, textDecoration: 'underline' }}>· {praxis.googleReviewCount} Google-Bewertungen lesen</span>
            <span style={{ color: '#003399', fontSize: '13px' }}>›</span>
          </button>
        )}

        {/* Match-reason directly under name+rating - Schwartz hierarchy:
            experienced-benefit before features. Reason justifies the
            DEIN-MATCH badge before the user reads methods+discipline. */}
        {reason && (
          <div style={{ fontSize: '13px', color: '#0A1F44', lineHeight: 1.5, padding: '10px 12px', backgroundColor: '#F4F7FF', border: '1px solid #DDE3F5', borderRadius: '4px', marginBottom: '12px' }}>
            ✓ {reason}
          </div>
        )}

        <div style={{ fontSize: '14px', color: '#0A1F44', fontWeight: 600, marginBottom: '4px' }}>
          {praxis.methods.join(' · ')}
        </div>

        <div style={{ fontSize: '13px', color: '#444', marginBottom: '12px', lineHeight: 1.5 }}>
          <strong>{discipline.name}</strong> - {discipline.reframe}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '13px', color: '#555', marginBottom: proof ? '6px' : '0' }}>
          <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>
            {distanceText && <>{distanceText} · </>}
            {praxis.city}{praxis.district ? ` · ${praxis.district}` : ''} · <span style={{ color: appointmentOnly ? '#0052CC' : openToday ? '#00A651' : '#CC0000', fontWeight: 600 }}>{openText}</span>
          </span>
        </div>

        {proof && (
          <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.4 }}>
            {proof}
          </div>
        )}
      </div>
      {showReviews && (
        <Suspense fallback={null}>
          <GoogleReviewsModal clinic={praxis} onClose={() => setShowReviews(false)} />
        </Suspense>
      )}
    </div>
  )
}
