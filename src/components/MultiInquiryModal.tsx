import { useState } from 'react'
import { X, Lock, CheckCircle2, Loader2, ChevronDown, ChevronUp, Star } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import type { CTAVariant } from '../lib/ctaVariant'
import { sendEvent } from '../lib/gtm'
import { generateEventId, sendCapi } from '../lib/capi'
import { submitToSheet } from '../lib/sheetSubmit'
import { useModalDismiss } from '../lib/useModalDismiss'

interface Props {
  clinics: Clinic[]
  onClose: () => void
  onClearSelection: () => void
  ctaColor?: string
  ctaVariant?: CTAVariant
}

export default function MultiInquiryModal({ clinics, onClose, onClearSelection, ctaColor = '#FF6600', ctaVariant }: Props) {
  const dialogRef = useModalDismiss<HTMLDivElement>(onClose)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    method: 'Beratung gewünscht', description: '', privacy: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  if (!clinics.length) return null

  const canSubmit = !!(form.firstName && form.email && form.privacy)
  const clinicNames = clinics.map(c => c.name).join(', ')
  const clinicCities = Array.from(new Set(clinics.map(c => c.city))).join(',')

  const validationMsg = (() => {
    if (!hasAttemptedSubmit || canSubmit) return ''
    const missing: string[] = []
    if (!form.firstName) missing.push('Vorname')
    if (!form.email) missing.push('E-Mail-Adresse')
    if (!form.privacy) missing.push('Datenschutz-Häkchen')
    return missing.length === 1
      ? `Bitte noch ${missing[0]} ergänzen, dann kann's losgehen.`
      : `Bitte noch ergänzen: ${missing.join(', ')}.`
  })()

  const handleSubmitClick = () => {
    if (loading) return
    const missing: string[] = []
    if (!form.firstName) missing.push('Vorname')
    if (!form.email) missing.push('E-Mail-Adresse')
    if (!form.privacy) missing.push('Datenschutz-Häkchen')
    sendEvent('InquirySubmitAttempted', {
      content_name: clinicNames,
      content_category: clinicCities,
      item_name: clinicNames,
      item_category: clinicCities,
      cta_variant: ctaVariant,
      multi_inquiry: true,
      inquiry_count: clinics.length,
      missing_fields: missing.join(',') || 'none',
      form_valid: missing.length === 0,
    })
    if (missing.length > 0) {
      setHasAttemptedSubmit(true)
      return
    }
    setHasAttemptedSubmit(false)
    void handleSubmit()
  }

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError(false)
    try {
      for (const clinic of clinics) {
        submitToSheet({
          clinic: clinic.name,
          clinicCity: clinic.city,
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          method: form.method || 'Erstberatung',
          description: form.description,
          multiInquiry: true,
          totalClinics: clinics.length,
        })
      }
      const leadEventId = generateEventId()
      const leadCustomData = {
        content_name: clinicNames,
        content_category: clinicCities,
        item_name: clinicNames,
        item_category: clinicCities,
        value: clinics.length,
        currency: 'EUR',
        multi_inquiry: true,
        inquiry_count: clinics.length,
        cta_variant: ctaVariant,
      }
      const leadUserData = { email: form.email, phone: form.phone }
      sendEvent('Lead', leadCustomData, leadUserData, leadEventId)
      sendCapi('Lead', leadEventId, leadCustomData, leadUserData)
      setSubmitted(true)
      onClearSelection()
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const field: React.CSSProperties = {
    width: '100%', border: '1px solid #DDD', borderRadius: '4px',
    padding: '8px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Anfrage an mehrere Praxen" style={{ backgroundColor: '#fff', borderRadius: '4px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

        {/* Header */}
        <div style={{ backgroundColor: '#003399', padding: '16px 20px', borderRadius: '4px 4px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>Anfrage an {clinics.length} Praxen gleichzeitig</div>
              <div style={{ color: '#99BBFF', fontSize: '12px', marginTop: '2px' }}>Du füllst das Formular einmal aus - wir senden parallel an alle.</div>
            </div>
            <button onClick={onClose} aria-label="Anfrage schließen" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '2px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Clinic row */}
        <div style={{ backgroundColor: '#F7F9FF', borderBottom: '1px solid #E5EAFF', padding: '12px 20px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {clinics.map(c => {
            const rating = c.googleRating ?? c.rating
            return (
              <div key={c.id} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '90px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#E8F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {c.media?.logo
                    ? <img src={c.media.logo} alt={c.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <span style={{ fontWeight: 700, fontSize: '14px', color: '#003399' }}>{c.name.charAt(0)}</span>}
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#111', textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word' }}>{c.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <Star size={10} fill="#FFB400" color="#FFB400" />
                  <span style={{ fontSize: '11px', color: '#555' }}>{rating.toFixed(1)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding: '20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '17px', color: '#333', marginBottom: '8px' }}>
                Anfrage an {clinics.length} Praxen gesendet!
              </div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '16px', lineHeight: 1.6 }}>
                Du bekommst gleich eine Bestätigung per E-Mail.<br />
                Jede Praxis meldet sich individuell bei dir.
              </div>
              <div style={{ textAlign: 'left', backgroundColor: '#F7F9FF', borderRadius: '6px', padding: '12px 16px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#333', marginBottom: '8px' }}>Anfrage gesendet an:</div>
                {clinics.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <CheckCircle2 size={13} color="#00A651" />
                    <span style={{ fontSize: '13px', color: '#333' }}>{c.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: '#777', marginBottom: '20px', lineHeight: 1.6 }}>
                <strong>Was jetzt passiert:</strong><br />
                Die Praxen melden sich direkt bei dir - per Telefon oder E-Mail.<br />
                Du vergleichst die Antworten und entscheidest, welche zu dir passt.
              </div>
              <button onClick={onClose} style={{ backgroundColor: '#003399', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}>Schließen</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Vorname *</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} style={field} placeholder="Max" />
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

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>
                  Telefonnummer <span style={{ color: '#888', fontWeight: 400 }}>(empfohlen)</span>
                </label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={field} placeholder="+49 221 …" />
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Die Praxen rufen dich für die Terminabsprache zurück.</div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Welche Methode interessiert dich?</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} style={{ ...field, backgroundColor: '#fff' }}>
                  <option value="Beratung gewünscht">Bin mir noch nicht sicher – die Praxen empfehlen mir die passende Methode</option>
                  {Array.from(new Set(clinics.flatMap(c => c.methods))).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Kurze Beschreibung (optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ ...field, resize: 'vertical' }}
                  placeholder="z.B. Besenreiser an beiden Waden seit der Schwangerschaft. Ich war noch nie bei einem Phlebologen und möchte wissen, was bei mir möglich ist."
                />
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Schon zwei Sätze helfen den Praxen, sich vorzubereiten.</div>
              </div>

              {/* Privacy consent */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '8px', lineHeight: 1.5 }}>
                  Mit dem Klick gibst du deine Anfragedaten an die ausgewählten Praxen weiter.
                </p>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.privacy} onChange={e => setForm({ ...form, privacy: e.target.checked })} style={{ marginTop: '2px', accentColor: '#003399', flexShrink: 0 }} />
                  <span style={{ color: '#333' }}>
                    Ich willige ein, dass meine Anfrage an die ausgewählten Praxen weitergeleitet wird.{' '}
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
                    Ich willige ein, dass meine Anfragedaten (Name, Kontaktdaten, gewünschte Behandlung) zur Weiterleitung an die ausgewählten Kliniken verarbeitet werden.
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

              {validationMsg && (
                <div role="alert" style={{ backgroundColor: '#FFF7E6', border: '1px solid #F5C97C', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#8A5300', marginBottom: '12px' }}>
                  {validationMsg}
                </div>
              )}

              <button
                onClick={handleSubmitClick}
                aria-disabled={!canSubmit || loading}
                style={{ backgroundColor: ctaColor, opacity: canSubmit && !loading ? 1 : 0.5, color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '4px', height: '44px', width: '100%', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading
                  ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Wird gesendet…</>
                  : `Jetzt an ${clinics.length} Praxen anfragen`}
              </button>

              <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={13} color="#00A651" style={{ flexShrink: 0 }} />
                <span>Antwort meist binnen 24 h von jeder Praxis. Die Anfrage ist für dich kostenlos.</span>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#999', fontSize: '11px' }}>
                  <Lock size={11} />Daten SSL-verschlüsselt
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
