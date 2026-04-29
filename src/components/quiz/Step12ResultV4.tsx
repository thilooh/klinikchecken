// V4 result page - delivery-first instead of re-pitch.
//
// Order: Hero (specific, named) → praxen list above the fold → mini
// profile row (one line, not a card stack) → optional comparison-table
// drawer (collapsed by default). The compact PraxisCardV4 replaces the
// homepage ClinicCard so the 1×1×1×1 Mechanism/Villain-Match/Promise/
// Proof structure stays scannable. Top match gets a sparkle badge to
// kill choice paralysis.
//
// Skipped vs. brief (data not in clinic schema):
//   - "Termine ab nächster Woche" - we don't track praxis appointment slots
//   - "Antwortet im Schnitt innerhalb 24 Std" - we don't measure response times
//   - Multi-lead post-submit (modal closes back to list now; the
//     "auch andere anfragen" UX is a follow-up commit)
//
// Skipped intentionally:
//   - "Erstgespräch zahlt oft die Kasse" - Besenreiser-Behandlung ist
//     idR IGeL, das wäre UWG-Risiko. Ersatz: defensible Objection-Killer.

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import type { QuizAnswers, QuizLead, ComputedProfile } from '../../lib/quizState'
import {
  getAuspraegungLabel,
  getDringlichkeitLabel,
} from '../../lib/quizProfileCompute'
import { getRelevantMethods } from '../../lib/quizRecommendations'
import { sortPraxen, getCityCenter, type ScoredPraxis } from '../../lib/quizPraxenSort'
import { useClinics } from '../../hooks/useClinics'
import { matchCity } from '../../lib/cityMatch'
import { getCTAColor, getCTAVariant } from '../../lib/ctaVariant'
import { trackQuizFindLocation } from '../../lib/quizTracking'
import ComparisonTable from './ComparisonTable'
import PraxisCardV4 from './PraxisCardV4'
import AnfrageModal from './AnfrageModal'

interface Props {
  answers: QuizAnswers
  lead: QuizLead
  profile: ComputedProfile
  onReset: () => void
}

const PAGE_SIZE = 12

export default function Step12ResultV4({ answers, lead, profile, onReset }: Props) {
  const { clinics } = useClinics()
  const [contactPraxis, setContactPraxis] = useState<ScoredPraxis | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [ctaVariant] = useState(() => getCTAVariant())
  const ctaColor = getCTAColor(ctaVariant)

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

  const visiblePraxen = sortedPraxen.slice(0, visibleCount)
  const hasMore = visibleCount < sortedPraxen.length

  const isFace = answers.q1_lokalisation === 'gesicht'
  const matchCount = sortedPraxen.filter(p => p.isMatch).length
  const totalCount = sortedPraxen.length
  const cityLabel = userCity ?? `PLZ ${lead.plz}`
  const vorname = lead.vorname || 'Hey'

  // Hero line. Branches on data availability so we never lie about
  // numbers: matchCount=0 falls back to "nähesten Praxen", and the
  // empty-state covers the brief loading flicker.
  const heroLine1 = (() => {
    if (clinics.length === 0) return `${vorname}, wir laden gleich Praxen für dich…`
    if (matchCount === 0 && totalCount === 0) {
      return `${vorname}, in ${cityLabel} aktuell keine Praxis. Erweitere die Suche oder ruf uns an.`
    }
    if (matchCount === 0) {
      const verb = isFace ? 'arbeiten' : 'arbeiten'
      return `${vorname}, in ${cityLabel} ${verb} aktuell keine Praxen genau zu deinem Profil. Hier die nähesten ${totalCount}.`
    }
    const praxisWord = matchCount === 1 ? 'Praxis' : 'Praxen'
    const verb = matchCount === 1 ? 'arbeitet' : 'arbeiten'
    if (isFace) {
      return `${vorname}, ${matchCount} ${praxisWord} in ${cityLabel} ${verb} an der Kapillarader im Gesicht.`
    }
    return `${vorname}, ${matchCount} ${praxisWord} in ${cityLabel} ${verb} direkt an der Ader.`
  })()

  const heroLine2 = isFace
    ? 'Laser oder feinste Verödung. Sortiert nach Entfernung von dir.'
    : 'Sklerotherapie, Laser oder beides. Sortiert nach Entfernung von dir.'

  const profileSummary = [
    profile.typ,
    getAuspraegungLabel(profile.auspraegungScore).toLowerCase(),
    getDringlichkeitLabel(profile.dringlichkeitScore).split(' - ')[0].toLowerCase(),
  ].join(' · ')

  return (
    <>
      {/* Hero */}
      <div style={{ marginBottom: '16px', padding: '0 4px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0A1F44', marginBottom: '6px', lineHeight: 1.3 }}>
          {heroLine1}
        </h2>
        <p style={{ fontSize: '14px', color: '#444', marginBottom: 0, lineHeight: 1.5 }}>
          {heroLine2}
        </p>
      </div>

      {/* Inline mini-disclaimer (replaces the wall-of-text disclaimer
          box in V3). Still legally required, just less visually loud. */}
      <p style={{ fontSize: '11px', color: '#888', marginBottom: '14px', padding: '0 4px', fontStyle: 'italic', lineHeight: 1.5 }}>
        Orientierungshilfe, keine Diagnose. Eine konkrete Einschätzung erfolgt im Erstgespräch in der Praxis.
      </p>

      {/* Pivot callback - bridges Step 9 insight to Step 12 action. */}
      {matchCount > 0 && (
        <div style={{ backgroundColor: '#F4F7FF', borderLeft: '3px solid #003399', padding: '10px 14px', borderRadius: '4px', marginBottom: '12px', fontSize: '13px', color: '#0A1F44', lineHeight: 1.5 }}>
          {isFace
            ? 'Laser und feinste Verödung erreichen die Ader. Beides bekommst du nur in der Praxis.'
            : 'Sklerotherapie und Laser arbeiten an der Ader. Beides bekommst du nur in der Praxis.'}
        </div>
      )}

      {/* Anti-shame line - dissolves the avoidance pattern from Step 7
          before the inquiry click. */}
      <p style={{ fontSize: '13px', color: '#555', marginBottom: '8px', padding: '0 4px', lineHeight: 1.5 }}>
        Praxen sehen Besenreiser täglich. Für sie ist das Routine.
      </p>

      {/* Multi-Anfrage tip - lifts the "ich darf nur eine anfragen"
          ceiling. Strategically valuable: more leads per user. */}
      <p style={{ fontSize: '13px', color: '#444', backgroundColor: '#FFF8E1', border: '1px solid #F5DD8C', padding: '10px 12px', borderRadius: '4px', marginBottom: '16px', lineHeight: 1.5 }}>
        💡 <strong>Tipp:</strong> Frag bei 2-3 Praxen gleichzeitig an. Antwortzeiten und Termine variieren — Praxen erwarten das.
      </p>

      {/* Praxen list */}
      {sortedPraxen.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#666', padding: '0 4px', marginBottom: '20px' }}>
          Wir laden gleich passende Praxen für dich…
        </p>
      ) : (
        <>
          {visiblePraxen.map((p, i) => (
            <PraxisCardV4
              key={p.id}
              praxis={p}
              ctaColor={ctaColor}
              onContact={setContactPraxis}
              isTopMatch={i === 0 && p.isMatch}
            />
          ))}
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount(c => c + 10)}
              style={{ width: '100%', background: 'none', border: '1px solid #DDE3F5', color: '#003399', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', marginTop: '6px', marginBottom: '8px' }}
            >
              Mehr anzeigen ({sortedPraxen.length - visibleCount} weitere)
            </button>
          )}
        </>
      )}

      {/* Mini-profile row - single line replacing the V1/V2/V3
          two-score-bars panel. Still visible (proves the quiz mattered)
          but doesn't pull attention from the praxen above. */}
      <div style={{ backgroundColor: '#FAFBFE', border: '1px solid #DDE3F5', borderRadius: '6px', padding: '12px 14px', marginTop: '20px', marginBottom: '12px', fontSize: '13px', color: '#0A1F44', lineHeight: 1.5 }}>
        <span style={{ fontWeight: 700, color: '#003399', fontSize: '11px', letterSpacing: '0.05em', marginRight: '8px' }}>DEIN PROFIL:</span>
        {profileSummary}
      </div>

      {/* Comparison-table drawer - proof reserve, collapsed by default.
          Convinced users skip it; sceptics expand. */}
      <button
        type="button"
        onClick={() => setDrawerOpen(o => !o)}
        aria-expanded={drawerOpen}
        style={{
          width: '100%', background: '#fff', border: '1px solid #DDE3F5',
          color: '#003399', fontWeight: 600, fontSize: '13px',
          padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: drawerOpen ? '8px' : '20px',
        }}
      >
        <span>Warum diese Praxen — und nicht Cremes oder Kompression?</span>
        {drawerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {drawerOpen && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #DDE3F5', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#0A1F44', fontWeight: 600, marginBottom: '12px', lineHeight: 1.5 }}>
            Vier arbeiten an der Oberfläche. Zwei arbeiten an der Ader selbst.
          </p>
          <ComparisonTable />
        </div>
      )}

      {/* UWG-required transparency line - paid placements + sort logic. */}
      <p style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginBottom: '20px', padding: '0 4px', lineHeight: 1.5 }}>
        ℹ️ Die Reihenfolge basiert auf Methoden-Übereinstimmung mit deinen Angaben sowie Entfernung. Mit <strong>„Anzeige"</strong> markierte Praxen sind zahlende Premium-Partner — die Auswahl der gezeigten Praxen ist unabhängig vom Premium-Status.
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
