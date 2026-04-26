import { useState } from 'react'
import { X, Lock, CheckCircle2, Loader2, ChevronDown, ChevronUp, Star, ChevronLeft } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import { sendEvent } from '../lib/gtm'
import { generateEventId, sendCapi } from '../lib/capi'

interface Props {
  clinic: Clinic | null
  onClose: () => void
  ctaColor?: string
  ctaVariant?: string
}

const SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL as string | undefined

export default function InquiryModal({ clinic, onClose, ctaColor = '#FF6600', ctaVariant }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    method: '', description: '', privacy: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  if (!clinic) return null

  const canContinueFromStep1 = true   // step 1 is purely informational, no required fields
  const canSubmit = !!(form.firstName && form.email && form.privacy)
  const rating = clinic.googleRating ?? clinic.rating
  const reviewCount = clinic.googleReviewCount ?? clinic.reviewCount

  const goToStep2 = () => {
    sendEvent('InquiryStep1Complete', { content_name: clinic.name, content_category: clinic.city })
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError(false)
    try {
      if (SHEET_URL) {
        await fetch(SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinic: clinic.name,
            clinicCity: clinic.city,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            method: form.method || 'Erstberatung',
            description: form.description,
          }),
        })
      }
      const leadEventId = generateEventId()
      const leadCustomData = {
        content_name: clinic.name,
        content_category: clinic.city,
        item_name: clinic.name,
        item_category: clinic.city,
        value: 1,
        currency: 'EUR',
        cta_variant: ctaVariant,
      }
      const leadUserData = { email: form.email, phone: form.phone }
      sendEvent('Lead', leadCustomData, leadUserData, leadEventId)
      sendCapi('Lead', leadEventId, leadCustomData, leadUserData)
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const field: React.CSSProperties = {
    width: '100%', border: '1px solid #DDD', borderRadius: '4px',
    padding: '10px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: '4px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ backgroundColor: '#003399', padding: '14px 20px 0', borderRadius: '4px 4px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Anfrage senden – kostenlos & unverbindlich</div>
              {!submitted && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '2px' }}>Schritt {step} von 2</div>}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '2px' }}>
              <X size={20} />
            </button>
          </div>
          {/* Progress bar */}
          {!submitted && (
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', marginTop: '12px', marginLeft: '-20px', marginRight: '-20px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: step === 1 ? '50%' : '100%', backgroundColor: '#FF6600', transition: 'width 0.3s ease' }} />
            </div>
          )}
        </div>

        {/* Clinic mini-card */}
        <div style={{ backgroundColor: '#F7F9FF', borderBottom: '1px solid #E5EAFF', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {clinic.media?.logo && (
            <img src={clinic.media.logo} alt={clinic.name} loading="lazy" decoding="async" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            {clinic.doctor && clinic.doctor !== 'siehe Website' && (
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{clinic.doctor}</div>
            )}
            <div style={{ fontSize: '12px', color: '#555', marginTop: '1px' }}>{clinic.qualification}</div>
          </div>
          {rating > 0 && reviewCount > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Star size={12} fill="#FFB400" color="#FFB400" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{rating.toFixed(1)}</span>
                <span style={{ fontSize: '12px', color: '#888' }}>({reviewCount})</span>
              </div>
              <div style={{ fontSize: '11px', color: '#00A651', marginTop: '2px', fontWeight: 600 }}>Antwortet meist binnen 24 h</div>
            </div>
          )}
        </div>

        <div style={{ padding: '20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#333', marginBottom: '8px' }}>Anfrage gesendet!</div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '4px' }}>Du bekommst gleich eine Bestätigung per E-Mail.</div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Die Praxis meldet sich innerhalb von 24 Stunden.</div>
              <button onClick={onClose} style={{ backgroundColor: '#003399', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}>Schließen</button>
            </div>
          ) : step === 1 ? (
            <>
              <div style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>
                Erstmal kurz: <strong>was möchtest du wissen?</strong> Keine persönlichen Daten — die kommen im 2. Schritt.
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#333', fontWeight: 700, marginBottom: '6px' }}>Welche Methode interessiert dich?</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} style={{ ...field, backgroundColor: '#fff' }}>
                  <option value="">Bin mir noch nicht sicher – Praxis empfiehlt</option>
                  {clinic.methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#333', fontWeight: 700, marginBottom: '6px' }}>
                  Kurze Beschreibung <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  style={{ ...field, resize: 'vertical' }}
                  placeholder="z.B. Besenreiser an beiden Waden seit der Schwangerschaft. Ich war noch nie bei einem Phlebologen und möchte wissen, was bei mir möglich ist."
                />
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Schon zwei Sätze helfen der Praxis sich vorzubereiten.</div>
              </div>

              <button
                onClick={goToStep2}
                disabled={!canContinueFromStep1}
                style={{ backgroundColor: ctaColor, color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '4px', height: '46px', width: '100%', cursor: 'pointer', marginBottom: '12px' }}
              >
                Weiter zu Kontakt →
              </button>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#999', fontSize: '11px' }}>
                  <Lock size={11} />SSL-verschlüsselt
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#999', fontSize: '11px' }}>
                  <CheckCircle2 size={11} color="#CCC" />Kostenlos & unverbindlich
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#0052CC', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '14px' }}
              >
                <ChevronLeft size={14} /> zurück
              </button>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Vorname *</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={field} placeholder="Max" autoFocus />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Nachname</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} style={field} placeholder="Mustermann" />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>E-Mail-Adresse *</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={field} placeholder="max@beispiel.de" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>
                  Telefonnummer <span style={{ color: '#888', fontWeight: 400 }}>(empfohlen)</span>
                </label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={field} placeholder="+49 221 …" />
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Die Praxis ruft dich für die Terminabsprache zurück.</div>
              </div>

              {/* Privacy consent */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.privacy} onChange={e => setForm({ ...form, privacy: e.target.checked })} style={{ marginTop: '2px', accentColor: '#003399', flexShrink: 0 }} />
                  <span style={{ color: '#333' }}>
                    Ich willige ein, dass meine Anfrage an die Praxis weitergeleitet wird.{' '}
                    <button
                      type="button"
                      onClick={() => setPrivacyOpen(o => !o)}
                      style={{ background: 'none', border: 'none', padding: 0, color: '#003399', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                    >
                      Datenschutz-Hinweis
                      {privacyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {' '}*
                  </span>
                </label>
                {privacyOpen && (
                  <div style={{ marginTop: '8px', marginLeft: '20px', fontSize: '11px', color: '#666', lineHeight: 1.6, backgroundColor: '#F9F9F9', padding: '10px 12px', borderRadius: '4px', border: '1px solid #EEE' }}>
                    Ich willige ein, dass meine Anfragedaten (Name, Kontaktdaten, gewünschte Behandlung) zur Weiterleitung an die ausgewählte Klinik verarbeitet werden.
                    Sofern ich im Beschreibungsfeld gesundheitsbezogene Angaben mache, erkläre ich meine ausdrückliche Einwilligung in die Verarbeitung dieser Daten gemäß Art. 9 Abs. 2 lit. a DSGVO.
                    Es gelten die{' '}
                    <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: '#003399' }}>Datenschutzerklärung</a>
                    {' '}und die{' '}
                    <a href="/agb" target="_blank" rel="noopener noreferrer" style={{ color: '#003399' }}>AGB</a>.
                  </div>
                )}
              </div>

              {error && (
                <div style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#CC0000', marginBottom: '12px' }}>
                  Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                style={{ backgroundColor: ctaColor, opacity: canSubmit && !loading ? 1 : 0.5, color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '4px', height: '46px', width: '100%', cursor: canSubmit && !loading ? 'pointer' : 'not-allowed', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Wird gesendet…</> : 'Jetzt anfragen – die Praxis meldet sich'}
              </button>

              <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#00A651" style={{ flexShrink: 0 }} />
                <span>Antwort innerhalb von 24h. Die Anfrage ist für dich kostenlos.</span>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#999', fontSize: '11px' }}>
                  <Lock size={11} />SSL-verschlüsselt
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#999', fontSize: '11px' }}>
                  <CheckCircle2 size={11} color="#CCC" />Kostenlos & unverbindlich
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
