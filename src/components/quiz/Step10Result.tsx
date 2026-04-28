import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { QuizAnswers, QuizLead } from '../../lib/quizState'
import { Q1_DISPLAY, Q2_DISPLAY, Q3_DISPLAY, Q4_DISPLAY, Q6_DISPLAY } from '../../lib/quizDisplayMaps'
import { getMethodRecommendation, getRanges, getRelevantMethods, getTimingHint } from '../../lib/quizRecommendations'
import { sortPraxen, getCityCenter, type ScoredPraxis } from '../../lib/quizPraxenSort'
import { useClinics } from '../../hooks/useClinics'
import { matchCity } from '../../lib/cityMatch'
import { sendEvent } from '../../lib/gtm'
import { getCTAColor, getCTAVariant } from '../../lib/ctaVariant'
import PraxisCard from './PraxisCard'
import AnfrageModal from './AnfrageModal'

interface Props {
  answers: QuizAnswers
  lead: QuizLead
  onReset: () => void
}

// Initial visible count - "Mehr anzeigen" extends in steps of 10.
const PAGE_SIZE = 12

export default function Step10Result({ answers, lead, onReset }: Props) {
  const { clinics } = useClinics()
  const [contactPraxis, setContactPraxis] = useState<ScoredPraxis | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [ctaVariant] = useState(() => getCTAVariant())
  const ctaColor = getCTAColor(ctaVariant)

  const recommendation = useMemo(() => getMethodRecommendation(answers), [answers])
  const ranges = useMemo(() => getRanges(answers), [answers])
  const timingHint = useMemo(() => getTimingHint(answers.q6_zeitziel), [answers.q6_zeitziel])

  const relevantMethods = useMemo(() => getRelevantMethods(answers), [answers])
  const userCity = useMemo(() => matchCity(lead.plz), [lead.plz])
  const userCoords = useMemo(() => getCityCenter(clinics, userCity), [clinics, userCity])
  const sortedPraxen = useMemo(
    () => sortPraxen(clinics, userCoords, relevantMethods),
    [clinics, userCoords, relevantMethods],
  )

  // FindLocation fires when the personalised practice list materialises -
  // this is the Meta-standard equivalent of "user provided a location to
  // discover businesses". One fire per session, gated by a ref-style flag
  // to avoid re-firing on every re-render.
  useEffect(() => {
    if (sortedPraxen.length === 0 && clinics.length > 0) return // still loading or empty
    sendEvent('FindLocation', {
      content_type: 'methoden_quiz',
      content_name: recommendation.primary,
      item_name: recommendation.primary,
      plz: lead.plz,
      praxen_count: sortedPraxen.length,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendation.primary])

  const visiblePraxen = sortedPraxen.slice(0, visibleCount)
  const hasMore = visibleCount < sortedPraxen.length

  const q5Real = answers.q5_versucht.filter(v => v !== 'nichts')

  return (
    <>
      {/* Plan card stays narrower than the parent container for
          readability of the long-form recommendation text. */}
      <div style={{ maxWidth: '640px', margin: '0 auto 24px', backgroundColor: '#fff', borderRadius: '8px', padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1F44', marginBottom: '14px', lineHeight: 1.2 }}>
          Dein persönlicher Beine-Plan, {lead.vorname || 'du'}
        </h2>

        <div style={{ backgroundColor: '#F4F7FF', borderRadius: '6px', padding: '14px 16px', marginBottom: '20px', fontSize: '14px', color: '#333', lineHeight: 1.7 }}>
          <strong style={{ display: 'block', fontSize: '12px', letterSpacing: '0.05em', color: '#003399', marginBottom: '6px' }}>📋 DEINE ANGABEN</strong>
          {answers.q1_lokalisation && <div>• Lokalisation: {Q1_DISPLAY[answers.q1_lokalisation]}</div>}
          {answers.q2_trigger && <div>• Aufgetreten: {Q2_DISPLAY[answers.q2_trigger]}</div>}
          {answers.q3_groesse && <div>• Ausprägung: {Q3_DISPLAY[answers.q3_groesse]}</div>}
          {answers.q4_hauttyp && <div>• Hauttyp: {Q4_DISPLAY[answers.q4_hauttyp]}</div>}
          <div>• Bisher probiert: {q5Real.length} {q5Real.length === 1 ? 'Strategie' : 'Strategien'}</div>
          {answers.q6_zeitziel && <div>• Zeitziel: {Q6_DISPLAY[answers.q6_zeitziel]}</div>}
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#003399', marginBottom: '8px' }}>
          💡 IN FRAGE KOMMENDE METHODEN
        </h3>
        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '10px' }}>
          Bei vergleichbaren Befunden kommen in der Phlebologie häufig folgende Methoden zum Einsatz:
        </p>
        <p style={{ fontSize: '17px', fontWeight: 700, color: '#0A1F44', marginBottom: '10px' }}>
          {recommendation.primary}
        </p>
        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '12px' }}>
          {recommendation.description}
        </p>
        {recommendation.alternative && (
          <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6, marginBottom: '14px', padding: '10px 12px', backgroundColor: '#FAFBFE', borderRadius: '4px', borderLeft: '3px solid #003399' }}>
            <strong>Alternative:</strong> {recommendation.alternative}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px', fontSize: '13px', color: '#333' }}>
          <div style={{ backgroundColor: '#FAFBFE', padding: '10px 12px', borderRadius: '4px' }}>
            📅 <strong>Sitzungen:</strong> {ranges.sitzungen}<br />
            <span style={{ color: '#666', fontSize: '12px' }}>üblich, über {ranges.dauer} Monate</span>
          </div>
          <div style={{ backgroundColor: '#FAFBFE', padding: '10px 12px', borderRadius: '4px' }}>
            💰 <strong>Investition:</strong> {ranges.preis}<br />
            <span style={{ color: '#666', fontSize: '12px' }}>verbindlich nennt die Praxis</span>
          </div>
        </div>

        {timingHint && (
          <p style={{ fontSize: '13px', color: '#444', marginBottom: '14px', padding: '10px 12px', backgroundColor: '#FFF8E1', borderRadius: '4px', lineHeight: 1.6 }}>
            ⏰ {timingHint}
          </p>
        )}

        <p style={{ fontSize: '12px', color: '#666', lineHeight: 1.6, marginBottom: 0 }}>
          ℹ️ Was bei dir konkret nötig und sinnvoll ist, klärst du im persönlichen Erstgespräch — nur eine Phlebologin oder ein Phlebologe kann eine echte Diagnose stellen.
        </p>
      </div>

      {/* Praxen-Liste sits directly on the gray page background -
          no white wrapper - so the homepage-style ClinicCards have
          their own visual breathing room rather than being nested in
          a box that crops them. Header + disclaimer float above and
          below as section labels. */}
      <div style={{ marginBottom: '12px', padding: '0 4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#003399', marginBottom: '4px' }}>
          📍 PRAXEN IN DEINER NÄHE {userCity ? `(${userCity})` : `(PLZ ${lead.plz})`}
        </h3>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Sortiert nach Methoden-Übereinstimmung mit deinen Angaben und Entfernung.
        </p>
      </div>

      {sortedPraxen.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#666', padding: '0 4px', marginBottom: '20px' }}>
          Wir laden gleich passende Praxen für dich…
        </p>
      ) : (
        <>
          {visiblePraxen.map((p, i) => (
            <PraxisCard
              key={p.id}
              praxis={p}
              ctaColor={ctaColor}
              onContact={setContactPraxis}
              index={i}
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

      <p style={{ fontSize: '11px', color: '#888', marginTop: '8px', marginBottom: '20px', padding: '0 4px', lineHeight: 1.5 }}>
        ℹ️ Diese Übersicht ersetzt keine ärztliche Diagnose. Die Reihenfolge basiert auf Methoden-Übereinstimmung mit deinen Angaben, Entfernung und Premium-Mitgliedschaft der Praxen.
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
          onClose={() => setContactPraxis(null)}
        />
      )}
    </>
  )
}
