import { useState } from 'react'
import { X, Lock, CheckCircle2, Loader2 } from 'lucide-react'
import type { Clinic } from '../types/clinic'
import { sendEvent } from '../lib/gtm'

interface Props {
  clinic: Clinic | null
  onClose: () => void
}

const SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL as string | undefined

export default function InquiryModal({ clinic, onClose }: Props) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    method: '', description: '', privacy: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  if (!clinic) return null

  const canSubmit = !!(form.firstName && form.email && form.privacy)

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
      sendEvent('Lead',
        { content_name: clinic.name, content_category: clinic.city, value: 1, currency: 'EUR' },
        { email: form.email, phone: form.phone }
      )
      setSubmitted(true)
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
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: '4px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

        <div style={{ backgroundColor: '#003399', padding: '16px 20px', borderRadius: '4px 4px 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>{clinic.name}</div>
              <div style={{ color: '#99BBFF', fontSize: '12px', marginTop: '2px' }}>Erstberatung anfragen – kostenlos & unverbindlich</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: '2px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#333', marginBottom: '8px' }}>Anfrage gesendet!</div>
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Die Klinik wird sich innerhalb von 24 Stunden bei Ihnen melden.</div>
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
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Telefonnummer</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={field} placeholder="+49 221 …" />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Welche Methode interessiert Sie?</label>
                <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} style={{ ...field, backgroundColor: '#fff' }}>
                  <option value="">Bitte wählen…</option>
                  <option value="erstberatung">💬 Erstberatung – ich bin noch unsicher</option>
                  {clinic.methods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Nicht sicher? Wählen Sie „Erstberatung" – der Arzt empfiehlt die passende Methode.</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Kurze Beschreibung (optional)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...field, resize: 'vertical' }} placeholder="z.B. Besenreiser an beiden Beinen, ca. seit 3 Jahren…" />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                <input type="checkbox" checked={form.privacy} onChange={e => setForm({ ...form, privacy: e.target.checked })} style={{ marginTop: '2px', accentColor: '#003399', flexShrink: 0 }} />
                <span>
                  Ich willige ein, dass meine Anfragedaten (Name, Kontaktdaten, gewünschte Behandlung) zur Weiterleitung an die ausgewählte Klinik verarbeitet werden.
                  Sofern ich im Beschreibungsfeld gesundheitsbezogene Angaben mache, erkläre ich meine ausdrückliche Einwilligung in die Verarbeitung dieser Daten gemäß Art. 9 Abs. 2 lit. a DSGVO.
                  Es gelten die{' '}
                  <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: '#003399' }}>Datenschutzerklärung</a>
                  {' '}und die{' '}
                  <a href="/agb" target="_blank" rel="noopener noreferrer" style={{ color: '#003399' }}>AGB</a>. *
                </span>
              </label>

              {error && (
                <div style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#CC0000', marginBottom: '12px' }}>
                  Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || loading}
                style={{ backgroundColor: canSubmit && !loading ? '#FF6600' : '#FFAA77', color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none', borderRadius: '4px', height: '44px', width: '100%', cursor: canSubmit && !loading ? 'pointer' : 'not-allowed', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Wird gesendet…</> : 'Erstberatung kostenfrei anfragen'}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                  <Lock size={12} />Ihre Daten sind sicher · SSL-verschlüsselt
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                  <CheckCircle2 size={12} color="#00A651" />Klinik antwortet in der Regel innerhalb von 24h
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                  <CheckCircle2 size={12} color="#00A651" />Kostenlos & unverbindlich
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
