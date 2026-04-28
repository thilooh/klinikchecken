import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { QuizLead, QuizAnswers, ComputedProfile } from '../../lib/quizState'
import { sentryCaptureMessage } from '../../lib/sentry'
import { computeProfile } from '../../lib/quizProfileCompute'
import { getCTAVariant } from '../../lib/ctaVariant'
import { trackQuizLead } from '../../lib/quizTracking'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PLZ_RE = /^\d{5}$/

function validate(form: { vorname: string; email: string; plz: string; consent_data: boolean }) {
  const errors: Record<string, string> = {}
  if (form.vorname.trim().length < 2) errors.vorname = 'Bitte deinen Vornamen eingeben.'
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Bitte gültige E-Mail eingeben.'
  if (!PLZ_RE.test(form.plz.trim())) errors.plz = 'Fünfstellige PLZ eingeben.'
  if (!form.consent_data) errors.consent_data = 'Bitte Einwilligung bestätigen.'
  return errors
}

interface Props {
  initial: QuizLead
  answers: QuizAnswers
  onSubmitted: (lead: QuizLead, profile: ComputedProfile) => void
}

export default function Step11Capture({ initial, answers, onSubmitted }: Props) {
  const [form, setForm] = useState<QuizLead>(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState(false)

  const liveErrors = touched ? validate(form) : errors
  const canSubmit = Object.keys(validate(form)).length === 0 && !loading

  const update = <K extends keyof QuizLead>(key: K, val: QuizLead[K]) => {
    setForm(f => ({ ...f, [key]: val }))
    if (touched && errors[key as string]) {
      const next = { ...errors }
      delete next[key as string]
      setErrors(next)
    }
  }

  const submit = async () => {
    const errs = validate(form)
    setErrors(errs)
    setTouched(true)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    setServerError(false)
    // Compute the profile here so it's available to send and to the
    // Lead/CAPI events even when the sheet write fails.
    const computedProfile = computeProfile(answers)
    try {
      const res = await fetch('/.netlify/functions/quiz-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quiz_lead', lead: form, answers, computedProfile }),
        keepalive: true,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        sentryCaptureMessage(`quiz-submit returned ${res.status}: ${text.slice(0, 200)}`, {
          level: 'warning',
          tags: { source: 'quiz-submit' },
        })
        setServerError(true)
      }
    } catch (err) {
      sentryCaptureMessage(`quiz-submit fetch failed: ${String(err)}`, {
        level: 'warning',
        tags: { source: 'quiz-submit' },
      })
      setServerError(true)
    } finally {
      setLoading(false)
      // Lead event fires regardless of sheet outcome - the user did
      // submit, Meta should know about it. Graceful degradation
      // also lets users continue to step 12 even when storage fails.
      // Pixel + CAPI via the shared helper so it dedups correctly
      // and includes consistent quiz_path / cta_variant params.
      trackQuizLead(answers, form, computedProfile, getCTAVariant())
      onSubmitted(form, computedProfile)
    }
  }

  const fieldStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%', height: '44px', padding: '0 12px', fontSize: '15px',
    border: `1px solid ${hasError ? '#CC0000' : '#DDE3F5'}`, borderRadius: '6px',
    boxSizing: 'border-box', outline: 'none',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '13px', color: '#0A1F44', fontWeight: 700, marginBottom: '6px',
  }

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#E5F4ED', color: '#0A7C4A', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
        ✓ Deine Quiz-Auswertung ist fertig
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '8px', lineHeight: 1.3 }}>
        Wohin schicken wir dein Orientierungsprofil?
      </h2>
      <p style={{ fontSize: '14px', color: '#444', marginBottom: '12px', lineHeight: 1.5 }}>
        Auf Basis deiner 8 Antworten haben wir dein persönliches Orientierungsprofil zusammengestellt - Typ, Ausprägung und passende Methoden.
      </p>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px', lineHeight: 1.5 }}>
        Das Profil ist eine Orientierungshilfe und keine ärztliche Diagnose.
      </p>

      <div style={{ marginBottom: '14px' }}>
        <label htmlFor="capture-vorname" style={labelStyle}>Vorname</label>
        <input
          id="capture-vorname" type="text" autoComplete="given-name" maxLength={50}
          value={form.vorname} onChange={e => update('vorname', e.target.value)}
          style={fieldStyle(!!liveErrors.vorname)}
        />
        {liveErrors.vorname && <div role="alert" style={{ fontSize: '12px', color: '#CC0000', marginTop: '4px' }}>{liveErrors.vorname}</div>}
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label htmlFor="capture-email" style={labelStyle}>E-Mail</label>
        <input
          id="capture-email" type="email" autoComplete="email"
          value={form.email} onChange={e => update('email', e.target.value)}
          style={fieldStyle(!!liveErrors.email)}
        />
        {liveErrors.email && <div role="alert" style={{ fontSize: '12px', color: '#CC0000', marginTop: '4px' }}>{liveErrors.email}</div>}
      </div>

      <div style={{ marginBottom: '18px' }}>
        <label htmlFor="capture-plz" style={labelStyle}>PLZ <span style={{ color: '#888', fontWeight: 400 }}>(für Praxen in deiner Nähe)</span></label>
        <input
          id="capture-plz" type="text" inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code"
          value={form.plz}
          onChange={e => update('plz', e.target.value.replace(/\D/g, ''))}
          style={{ ...fieldStyle(!!liveErrors.plz), maxWidth: '140px' }}
          placeholder="z.B. 10115"
        />
        {liveErrors.plz && <div role="alert" style={{ fontSize: '12px', color: '#CC0000', marginTop: '4px' }}>{liveErrors.plz}</div>}
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#444', marginBottom: '12px', lineHeight: 1.5, cursor: 'pointer' }}>
        <input
          type="checkbox" checked={form.consent_data} onChange={e => update('consent_data', e.target.checked)}
          style={{ accentColor: '#003399', flexShrink: 0, marginTop: '2px', width: '16px', height: '16px' }}
        />
        <span>
          Ich willige ein, dass meine Quiz-Antworten zur Erstellung meines Profils verarbeitet werden. Wenn ich eine Praxis kontaktiere, dürfen meine Angaben an diese Praxis weitergegeben werden.
          {' '}<a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: '#003399' }}>Datenschutz</a>. *
        </span>
      </label>
      {liveErrors.consent_data && <div role="alert" style={{ fontSize: '12px', color: '#CC0000', marginBottom: '10px' }}>{liveErrors.consent_data}</div>}

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#444', marginBottom: '20px', lineHeight: 1.5, cursor: 'pointer' }}>
        <input
          type="checkbox" checked={form.consent_marketing} onChange={e => update('consent_marketing', e.target.checked)}
          style={{ accentColor: '#003399', flexShrink: 0, marginTop: '2px', width: '16px', height: '16px' }}
        />
        <span>
          Optional: Ich möchte zusätzlich max. 3 hilfreiche Mails zur Vorbereitung auf das Erstgespräch erhalten. Abbestellung in jeder Mail möglich.
        </span>
      </label>

      {serverError && (
        <div role="alert" style={{ backgroundColor: '#FFF7E6', border: '1px solid #F5C97C', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#8A5300', marginBottom: '12px' }}>
          Speichern hat einen Moment nicht geklappt - wir bringen dich trotzdem zur Auswertung. Falls du die Mail nicht erhältst, melde dich bitte.
        </div>
      )}

      <button
        type="button" onClick={submit} disabled={!canSubmit}
        style={{
          width: '100%', backgroundColor: canSubmit ? '#003399' : '#B0B8CC',
          color: '#fff', fontWeight: 700, fontSize: '15px', border: 'none', borderRadius: '6px',
          padding: '14px 20px', cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Wird gesendet…</>
          : 'Auswertung ansehen + Praxen in der Nähe →'}
      </button>

      <p style={{ fontSize: '12px', color: '#888', marginTop: '12px', textAlign: 'center' }}>
        Du bekommst dein Orientierungsprofil auch per Mail - praktisch, wenn du es später nochmal ansehen willst.
      </p>
    </div>
  )
}
