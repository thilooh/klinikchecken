import { useState } from 'react'
import { X, Lock, CheckCircle2 } from 'lucide-react'
import type { Clinic } from '../types/clinic'

interface Props {
  clinic: Clinic | null
  onClose: () => void
}

export default function InquiryModal({ clinic, onClose }: Props) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    method: '', description: '', privacy: false, newsletter: false,
  })
  const [submitted, setSubmitted] = useState(false)

  if (!clinic) return null

  const handleSubmit = () => {
    if (form.firstName && form.email && form.privacy) {
      setSubmitted(true)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '4px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        {/* Header */}
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
              <div style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
                Die Klinik wird sich innerhalb von 24 Stunden bei Ihnen melden.
              </div>
              <button
                onClick={onClose}
                style={{ backgroundColor: '#003399', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 24px', cursor: 'pointer', fontWeight: 700 }}
              >
                Schließen
              </button>
            </div>
          ) : (
            <>
              {/* Name row */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Vorname *</label>
                  <input
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    style={{ width: '100%', border: '1px solid #DDD', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Max"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Nachname *</label>
                  <input
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    style={{ width: '100%', border: '1px solid #DDD', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>E-Mail-Adresse *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', border: '1px solid #DDD', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="max@beispiel.de"
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Telefonnummer</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={{ width: '100%', border: '1px solid #DDD', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  placeholder="+49 221 ..."
                />
              </div>

              {/* Method */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Welche Methode interessiert Sie?</label>
                <select
                  value={form.method}
                  onChange={e => setForm({ ...form, method: e.target.value })}
                  style={{ width: '100%', border: '1px solid #DDD', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="">Bitte wählen...</option>
                  <option value="erstberatung">💬 Erstberatung – ich bin noch unsicher</option>
                  {clinic.methods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>Nicht sicher? Wählen Sie einfach „Erstberatung“ – der Arzt empfiehlt die passende Methode.</div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#333', fontWeight: 700, marginBottom: '4px' }}>Kurze Beschreibung (optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', border: '1px solid #DDD', borderRadius: '4px', padding: '8px 10px', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  placeholder="z.B. Besenreiser an beiden Beinen, ca. seit 3 Jahren..."
                />
              </div>

              {/* Checkboxes */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={form.privacy}
                  onChange={e => setForm({ ...form, privacy: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#003399' }}
                />
                <span>Ich stimme der <a href="#" style={{ color: '#003399' }}>Datenschutzerklärung</a> zu *</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={form.newsletter}
                  onChange={e => setForm({ ...form, newsletter: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#003399' }}
                />
                <span>Ich möchte Angebote von ähnlichen Kliniken erhalten</span>
              </label>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                style={{
                  backgroundColor: form.firstName && form.email && form.privacy ? '#FF6600' : '#FFAA77',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  border: 'none',
                  borderRadius: '4px',
                  height: '44px',
                  width: '100%',
                  cursor: form.firstName && form.email && form.privacy ? 'pointer' : 'not-allowed',
                  marginBottom: '16px',
                }}
              >
                Erstberatung kostenfrei anfragen
              </button>

              {/* Trust signals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                  <Lock size={12} />
                  Ihre Daten sind sicher · SSL-verschlüsselt
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                  <CheckCircle2 size={12} color="#00A651" />
                  Klinik antwortet in der Regel innerhalb von 24h
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                  <CheckCircle2 size={12} color="#00A651" />
                  Kostenlos & unverbindlich
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
