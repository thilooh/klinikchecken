import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import type { QuizAnswers, QuizLead, ComputedProfile } from '../../lib/quizState'
import { Q1_DISPLAY, Q2_DISPLAY } from '../../lib/quizDisplayMaps'
import {
  getAuspraegungLabel,
  getDringlichkeitLabel,
  getProgressionHint,
} from '../../lib/quizProfileCompute'
import { getMethodRecommendation, getRanges, getRelevantMethods, getTimingHint } from '../../lib/quizRecommendations'
import { sortPraxen, getCityCenter, type ScoredPraxis } from '../../lib/quizPraxenSort'
import { useClinics } from '../../hooks/useClinics'
import { matchCity } from '../../lib/cityMatch'
import { getCTAColor, getCTAVariant } from '../../lib/ctaVariant'
import { trackQuizFindLocation } from '../../lib/quizTracking'
import ScoreBar from './ScoreBar'
import ComparisonTable from './ComparisonTable'
import PraxisCard from './PraxisCard'
import AnfrageModal from './AnfrageModal'
import Step12ResultV4 from './Step12ResultV4'

interface Props {
  answers: QuizAnswers
  lead: QuizLead
  profile: ComputedProfile
  onReset: () => void
  variant?: 'v1' | 'v2' | 'v3' | 'v4'
}

const PAGE_SIZE = 12

export default function Step12Result({ answers, lead, profile, onReset, variant = 'v1' }: Props) {
  // V4 has a structurally different layout (delivery-first, no
  // re-pitch wall). Dispatch to its own component so this file
  // stays focused on V1/V2/V3.
  if (variant === 'v4') {
    return <Step12ResultV4 answers={answers} lead={lead} profile={profile} onReset={onReset} />
  }
  const { clinics } = useClinics()
  const [contactPraxis, setContactPraxis] = useState<ScoredPraxis | null>(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [ctaVariant] = useState(() => getCTAVariant())
  const ctaColor = getCTAColor(ctaVariant)

  const recommendation = useMemo(() => getMethodRecommendation(answers), [answers])
  const ranges = useMemo(() => getRanges(answers), [answers])
  const timingHint = useMemo(() => getTimingHint(answers.q8_zeitziel), [answers.q8_zeitziel])
  const progressionHint = useMemo(() => getProgressionHint(answers), [answers])

  const relevantMethods = useMemo(() => getRelevantMethods(answers), [answers])
  const userCity = useMemo(() => matchCity(lead.plz), [lead.plz])
  const userCoords = useMemo(() => getCityCenter(clinics, userCity), [clinics, userCity])
  const sortedPraxen = useMemo(
    () => sortPraxen(clinics, userCoords, relevantMethods),
    [clinics, userCoords, relevantMethods],
  )

  // FindLocation fires when the personalised practice list
  // materialises. Pixel + CAPI via the helper so it dedups and
  // carries consistent quiz_path / cta_variant params.
  useEffect(() => {
    if (sortedPraxen.length === 0 && clinics.length > 0) return
    trackQuizFindLocation(answers, lead, profile, sortedPraxen.length, ctaVariant)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.typ])

  const visiblePraxen = sortedPraxen.slice(0, visibleCount)
  const hasMore = visibleCount < sortedPraxen.length

  const sectionTitle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em',
    color: '#003399', marginBottom: '10px', textTransform: 'uppercase' as const,
  }

  return (
    <>
      {/* Plan card stays narrower than the parent container for
          readability of the long-form recommendation text. */}
      <div style={{ maxWidth: '640px', margin: '0 auto 24px', backgroundColor: '#fff', borderRadius: '8px', padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0A1F44', marginBottom: '12px', lineHeight: 1.2 }}>
          Dein Orientierungsprofil, {lead.vorname || 'du'}
        </h2>

        {/* Anpassung B: prominent disclaimer above the profile card,
            not just buried in the footer. */}
        <p style={{ fontSize: '13px', color: '#444', backgroundColor: '#FAFBFE', borderLeft: '3px solid #003399', padding: '10px 14px', borderRadius: '4px', marginBottom: '20px', lineHeight: 1.5 }}>
          Diese Quiz-Auswertung ist eine Orientierungshilfe - keine medizinische Diagnose. Eine Einschätzung deines konkreten Befunds erfolgt im Erstgespräch in der Praxis.
        </p>

        <div style={sectionTitle}>📊 Deine Quiz-Auswertung</div>
        <div style={{ backgroundColor: '#FAFBFE', border: '1px solid #DDE3F5', borderRadius: '6px', padding: '16px 18px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '2px' }}>Typ</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#0A1F44' }}>{profile.typ}</div>
          </div>

          {answers.q2_trigger && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '2px' }}>Auslöser</div>
              <div style={{ fontSize: '14px', color: '#333' }}>{Q2_DISPLAY[answers.q2_trigger]}</div>
            </div>
          )}

          {answers.q1_lokalisation && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '2px' }}>Lokalisation</div>
              <div style={{ fontSize: '14px', color: '#333' }}>{Q1_DISPLAY[answers.q1_lokalisation]}</div>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '6px' }}>Ausprägung</div>
            <ScoreBar value={profile.auspraegungScore} max={8} label={getAuspraegungLabel(profile.auspraegungScore)} />
          </div>

          <div style={{ marginBottom: progressionHint ? '14px' : 0 }}>
            <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '6px' }}>Dein Behandlungswunsch</div>
            <ScoreBar value={profile.dringlichkeitScore} max={6} label={getDringlichkeitLabel(profile.dringlichkeitScore)} />
          </div>

          {progressionHint && (
            <div style={{ fontSize: '13px', color: '#444', backgroundColor: '#FFF8E1', border: '1px solid #F5DD8C', padding: '10px 12px', borderRadius: '4px', lineHeight: 1.6 }}>
              <strong>Hinweis:</strong> {progressionHint}
            </div>
          )}
        </div>

        {/* Comparison table */}
        <div style={sectionTitle}>⚖️ Was bei Besenreisern funktioniert - und was nicht</div>
        {variant === 'v2' && (
          <p style={{ fontSize: '15px', color: '#0A1F44', fontWeight: 600, lineHeight: 1.5, marginBottom: '12px' }}>
            Erinnerst du dich, was du probiert hast? Hier ist, warum es nicht reichen konnte.
          </p>
        )}
        {variant === 'v3' && (
          <p style={{ fontSize: '15px', color: '#0A1F44', fontWeight: 600, lineHeight: 1.5, marginBottom: '12px' }}>
            Vier arbeiten an der Oberfläche. Zwei arbeiten an der Ader selbst.
          </p>
        )}
        <div style={{ marginBottom: '24px' }}>
          <ComparisonTable />
        </div>

        {/* Method recommendation */}
        <div style={sectionTitle}>💡 In Frage kommende Methoden</div>
        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '10px' }}>
          Bei vergleichbaren Befunden kommen in der {recommendation.fachgebiet} häufig folgende Methoden zum Einsatz:
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
          ℹ️ Was bei dir konkret nötig und sinnvoll ist, klärst du im persönlichen Erstgespräch. Nur eine Ärztin oder ein Arzt kann eine medizinische Diagnose stellen - diese Quiz-Auswertung ist eine Orientierungshilfe.
        </p>
      </div>

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
          onClose={() => setContactPraxis(null)}
        />
      )}
    </>
  )
}
