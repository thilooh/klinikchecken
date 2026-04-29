import { useEffect, useState } from 'react'
import { X, CheckCircle2, Loader2 } from 'lucide-react'
import type { ScoredPraxis } from '../../lib/quizPraxenSort'
import type { QuizAnswers, QuizLead, ComputedProfile } from '../../lib/quizState'
import { sentryCaptureMessage } from '../../lib/sentry'
import { useModalDismiss } from '../../lib/useModalDismiss'
import { getCTAVariant } from '../../lib/ctaVariant'
import { trackPraxisModalOpen, trackPraxisAnfrage } from '../../lib/quizTracking'

interface Props {
  praxis: ScoredPraxis
  lead: QuizLead
  answers: QuizAnswers
  profile: ComputedProfile
  onClose: () => void
}

type Kontaktart = 'email' | 'telefon'

export default function AnfrageModal({ praxis, lead, answers, profile, onClose }: Props) {
  const dialogRef = useModalDismiss<HTMLDivElement>(onClose)
  const [telefon, setTelefon] = useState('')
  const [kontaktart, setKontaktart] = useState<Kontaktart>('email')
  const [nachricht, setNachricht] = useState('')
  const [consent, setConsent] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  // InitiateCheckout fires once when the modal opens. Pixel + CAPI
  // via the helper - matches the rest of the site's pairing for the
  // conversion-relevant events.
  useEffect(() => {
    trackPraxisModalOpen(
      { id: praxis.id, name: praxis.name, city: praxis.city, tier: praxis.tier },
      answers,
      getCTAVariant(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submit = async () => {
    if (!consent || loading) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/.netlify/functions/praxis-anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'praxis_anfrage',
          praxis: { id: praxis.id, name: praxis.name, email: praxis.praxis_email, tier: praxis.tier },
          lead,
          answers,
          computedProfile: profile,
          telefon: telefon.trim(),
          kontaktart,
          nachricht: nachricht.trim(),
          consent_praxis: true,
        }),
        keepalive: true,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        sentryCaptureMessage(`praxis-anfrage returned ${res.status}: ${text.slice(0, 200)}`, {
          level: 'warning',
          tags: { source: 'praxis-anfrage' },
          extra: { praxisId: praxis.id, praxisName: praxis.name },
        })
        setError(true)
        return
      }
      trackPraxisAnfrage(
        { id: praxis.id, name: praxis.name, city: praxis.city, tier: praxis.tier },
        answers,
        lead,
        lead.email,
        telefon.trim() || undefined,
        getCTAVariant(),
      )
      setSubmitted(true)
    } catch (err) {
      sentryCaptureMessage(`praxis-anfrage fetch failed: ${String(err)}`, {
        level: 'warning',
        tags: { source: 'praxis-anfrage' },
        extra: { praxisId: praxis.id },
      })
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '44px', padding: '0 12px', fontSize: '14px',
    border: '1px solid #DDE3F5', borderRadius: '6px', boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`Anfrage an ${praxis.name}`}
        style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '18px 20px 0', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1F44', margin: 0 }}>
            Anfrage an {praxis.name}
          </h2>
          <button onClick={onClose} aria-label="Schließen" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '8px 0 12px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0A7C4A', fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>
                <CheckCircle2 size={20} /> Anfrage gesendet
              </div>
              <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '12px' }}>
                Deine Anfrage ist bei <strong>{praxis.name}</strong> eingegangen. Die Praxis meldet sich üblicherweise innerhalb von 2 Werktagen.
              </p>
              <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginBottom: '20px' }}>
                Eine Bestätigung mit den Details deiner Anfrage haben wir an <strong>{lead.email}</strong> geschickt.
              </p>
              <button
                onClick={onClose}
                style={{ background: 'none', border: '1px solid #DDE3F5', color: '#003399', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
              >
                ← Zurück zur Praxen-Liste
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', lineHeight: 1.5 }}>
                Wir geben deine Quiz-Antworten und Kontaktdaten an die Praxis weiter, damit sie dir ein passendes Erstgespräch anbieten kann.
              </p>

              <div style={{ marginBottom: '12px' }}>
                <label htmlFor="anfrage-tel" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0A1F44', marginBottom: '4px' }}>
                  Telefon <span style={{ fontWeight: 400, color: '#888' }}>(optional, beschleunigt Rückruf)</span>
                </label>
                <input id="anfrage-tel" type="tel" autoComplete="tel" value={telefon} onChange={e => setTelefon(e.target.value)} style={inputStyle} placeholder="+49 …" />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0A1F44', marginBottom: '6px' }}>Bevorzugte Kontaktart</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" name="kontaktart" value="email" checked={kontaktart === 'email'} onChange={() => setKontaktart('email')} style={{ accentColor: '#003399' }} />
                    E-Mail
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" name="kontaktart" value="telefon" checked={kontaktart === 'telefon'} onChange={() => setKontaktart('telefon')} style={{ accentColor: '#003399' }} />
                    Telefon
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="anfrage-msg" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0A1F44', marginBottom: '4px' }}>
                  Nachricht an die Praxis <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>
                </label>
                <textarea
                  id="anfrage-msg" value={nachricht} onChange={e => setNachricht(e.target.value)} rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '8px 12px', resize: 'vertical' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#444', marginBottom: '16px', lineHeight: 1.5, cursor: 'pointer' }}>
                <input
                  type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                  style={{ accentColor: '#003399', flexShrink: 0, marginTop: '2px', width: '16px', height: '16px' }}
                />
                <span>
                  Ich bin damit einverstanden, dass meine Quiz-Antworten und Kontaktdaten an <strong>{praxis.name}</strong> ({praxis.address}, {praxis.city}) weitergegeben werden, damit diese mit mir Kontakt aufnehmen kann.{' '}
                  <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: '#003399' }}>Datenschutz</a>. *
                </span>
              </label>

              {error && (
                <div role="alert" style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#CC0000', marginBottom: '12px' }}>
                  Anfrage konnte nicht gesendet werden - bitte erneut versuchen.
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={onClose} style={{ background: 'none', border: '1px solid #DDE3F5', color: '#003399', padding: '11px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                  Abbrechen
                </button>
                <button
                  onClick={submit}
                  disabled={!consent || loading}
                  style={{
                    flex: 1, backgroundColor: consent && !loading ? '#003399' : '#B0B8CC', color: '#fff',
                    fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '6px', padding: '11px 14px',
                    cursor: consent && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  }}
                >
                  {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Wird gesendet…</> : 'Anfrage senden →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
