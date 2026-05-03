// Termin-Wunsch widget on /auswertung. Replaces the old "Anfrage
// senden -> Praxis meldet sich"-flow with a direct slot picker:
// the user picks 1-3 wunsch-slots inline, the praxis sees them and
// confirms one. Cuts the back-and-forth from "anfrage -> termin
// -> bestätigen" down to "slots -> bestätigen", which should drag
// the modal-to-submit conversion meaningfully higher than the
// current 0% baseline.
//
// Backend: POST to /.netlify/functions/termin-buchen which writes a
// row to the GAS sheet's Termin_Anfragen tab. No email dispatch
// from this widget yet - the founder forwards manually until
// per-praxis email addresses are real.

import { useMemo, useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import type { ScoredPraxis } from '../../lib/quizPraxenSort'
import type { QuizAnswers, QuizLead, ComputedProfile } from '../../lib/quizState'
import { sentryCaptureMessage } from '../../lib/sentry'

interface Props {
  praxis: ScoredPraxis
  lead: QuizLead
  answers: QuizAnswers
  profile: ComputedProfile
}

type ZeitOfDay = 'vormittag' | 'nachmittag' | 'abend'

type Slot = {
  date: string  // YYYY-MM-DD
  zeit: ZeitOfDay
}

const ZEIT_LABEL: Record<ZeitOfDay, string> = {
  vormittag: 'Vormittag',
  nachmittag: 'Nachmittag',
  abend: 'Abend',
}

const ZEIT_HINT: Record<ZeitOfDay, string> = {
  vormittag: '9-12 Uhr',
  nachmittag: '13-17 Uhr',
  abend: '17-19 Uhr',
}

// Generate the next N weekdays (Mon-Fri only). Starts from tomorrow
// since same-day Erstgespräch is rare and tends to disappoint.
function nextWeekdays(count: number): Date[] {
  const days: Date[] = []
  const today = new Date()
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  while (days.length < count) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

const WEEKDAY_LABEL = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const MONTH_LABEL = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

function formatDayLabel(d: Date): string {
  return `${WEEKDAY_LABEL[d.getDay()]}, ${d.getDate()}. ${MONTH_LABEL[d.getMonth()]}`
}

function formatDateKey(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function slotKey(s: Slot): string {
  return `${s.date}__${s.zeit}`
}

function slotLabelShort(s: Slot, dayDate: Date): string {
  return `${WEEKDAY_LABEL[dayDate.getDay()]} ${ZEIT_LABEL[s.zeit]}`
}

export default function TerminWidget({ praxis, lead, answers, profile }: Props) {
  const days = useMemo(() => nextWeekdays(7), [])
  const [selected, setSelected] = useState<Slot[]>([])
  const [telefon, setTelefon] = useState('')
  const [notiz, setNotiz] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSelected = (s: Slot) => selected.some(x => slotKey(x) === slotKey(s))

  const toggle = (date: string, zeit: ZeitOfDay) => {
    const slot = { date, zeit }
    const key = slotKey(slot)
    if (selected.some(s => slotKey(s) === key)) {
      setSelected(selected.filter(s => slotKey(s) !== key))
      return
    }
    if (selected.length >= 3) return
    setSelected([...selected, slot])
  }

  const canSubmit = selected.length >= 1 && consent && !loading

  const submit = async () => {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/.netlify/functions/termin-buchen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'termin_anfrage',
          praxis: { id: praxis.id, name: praxis.name, city: praxis.city },
          lead,
          answers,
          computedProfile: profile,
          slots: selected,
          telefon: telefon.trim() || undefined,
          notiz: notiz.trim() || undefined,
          consent_praxis: true,
        }),
        keepalive: true,
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        sentryCaptureMessage(`termin-buchen returned ${res.status}: ${text.slice(0, 200)}`, {
          level: 'warning',
          tags: { source: 'termin-buchen' },
        })
        setError('Speichern hat nicht geklappt. Bitte erneut versuchen.')
        return
      }
      setSubmitted(true)
    } catch (err) {
      sentryCaptureMessage(`termin-buchen fetch failed: ${String(err)}`, {
        level: 'warning',
        tags: { source: 'termin-buchen' },
      })
      setError('Speichern hat nicht geklappt. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #DDE3F5', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A7C4A', fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>
          <CheckCircle2 size={22} /> Wunsch-Termin gesichert
        </div>
        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '10px' }}>
          {lead.vorname ? `${lead.vorname}, ` : ''}deine {selected.length} {selected.length === 1 ? 'Wunsch-Zeit ist' : 'Wunsch-Zeiten sind'} bei <strong>{praxis.name}</strong> eingegangen.
        </p>
        <p style={{ fontSize: '14px', color: '#444', lineHeight: 1.6, marginBottom: '10px' }}>
          Die Praxis meldet sich innerhalb von 1-2 Werktagen mit einer konkreten Termin-Bestätigung an <strong>{lead.email}</strong>.
        </p>
        <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, fontStyle: 'italic' }}>
          Du verpflichtest dich zu nichts. Falls dir der vorgeschlagene Termin nicht passt, schlägst du einen anderen vor oder antwortest gar nicht.
        </p>
      </div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '40px', padding: '0 12px', fontSize: '14px',
    border: '1px solid #DDE3F5', borderRadius: '6px', boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #DDE3F5', borderRadius: '8px', padding: '20px 18px', marginBottom: '20px' }}>
      <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0A1F44', marginTop: 0, marginBottom: '4px' }}>
        Wann passt&apos;s dir?
      </h3>
      <p style={{ fontSize: '13px', color: '#666', marginTop: 0, marginBottom: '16px', lineHeight: 1.5 }}>
        Wähl 1 bis 3 Wunsch-Zeiten. Die Praxis bestätigt einen davon innerhalb 1-2 Werktagen.
      </p>

      <div style={{ marginBottom: '14px' }}>
        {days.map(d => {
          const dateKey = formatDateKey(d)
          return (
            <div key={dateKey} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '110px', fontSize: '13px', fontWeight: 600, color: '#0A1F44' }}>
                {formatDayLabel(d)}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['vormittag', 'nachmittag', 'abend'] as ZeitOfDay[]).map(zeit => {
                  const slot: Slot = { date: dateKey, zeit }
                  const sel = isSelected(slot)
                  const disabled = !sel && selected.length >= 3
                  return (
                    <button
                      key={zeit}
                      type="button"
                      onClick={() => toggle(dateKey, zeit)}
                      disabled={disabled}
                      title={ZEIT_HINT[zeit]}
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: `1px solid ${sel ? '#003399' : '#DDE3F5'}`,
                        backgroundColor: sel ? '#003399' : disabled ? '#F4F4F4' : '#fff',
                        color: sel ? '#fff' : disabled ? '#AAA' : '#0A1F44',
                        borderRadius: '20px',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.6 : 1,
                      }}
                    >
                      {ZEIT_LABEL[zeit]}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ backgroundColor: '#F4F7FF', border: '1px solid #DDE3F5', borderRadius: '4px', padding: '10px 12px', marginBottom: '14px', fontSize: '13px', color: '#0A1F44', lineHeight: 1.5 }}>
          <strong>{selected.length} {selected.length === 1 ? 'Slot' : 'Slots'} gewählt:</strong>{' '}
          {selected.map((s, i) => {
            const dayDate = days.find(d => formatDateKey(d) === s.date)
            return (
              <span key={slotKey(s)}>
                {dayDate ? slotLabelShort(s, dayDate) : `${s.date} ${ZEIT_LABEL[s.zeit]}`}
                {i < selected.length - 1 ? ', ' : ''}
              </span>
            )
          })}
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <label htmlFor="termin-tel" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0A1F44', marginBottom: '4px' }}>
          Telefon <span style={{ fontWeight: 400, color: '#888' }}>(optional, falls die Praxis lieber zurückruft)</span>
        </label>
        <input id="termin-tel" type="tel" autoComplete="tel" value={telefon} onChange={e => setTelefon(e.target.value)} style={inputStyle} placeholder="+49 …" />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label htmlFor="termin-notiz" style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0A1F44', marginBottom: '4px' }}>
          Notiz an die Praxis <span style={{ fontWeight: 400, color: '#888' }}>(optional)</span>
        </label>
        <textarea
          id="termin-notiz" value={notiz} onChange={e => setNotiz(e.target.value)} rows={2}
          style={{ ...inputStyle, height: 'auto', padding: '8px 12px', resize: 'vertical' }}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#444', marginBottom: '14px', lineHeight: 1.5, cursor: 'pointer' }}>
        <input
          type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
          style={{ accentColor: '#003399', flexShrink: 0, marginTop: '2px', width: '16px', height: '16px' }}
        />
        <span>
          Einverstanden, dass meine Wunsch-Zeiten + Quiz-Antworten an <strong>{praxis.name}</strong> weitergegeben werden, damit die Praxis mit mir Kontakt aufnehmen kann.{' '}
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: '#003399' }}>Datenschutz</a>. *
        </span>
      </label>

      {error && (
        <div role="alert" style={{ backgroundColor: '#FFF0F0', border: '1px solid #FFCCCC', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: '#CC0000', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        style={{
          width: '100%',
          backgroundColor: canSubmit ? '#003399' : '#B0B8CC',
          color: '#fff', fontWeight: 700, fontSize: '15px',
          border: 'none', borderRadius: '6px', padding: '14px 20px',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        {loading
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Wird gesichert…</>
          : 'Wunsch-Termin sichern →'}
      </button>

      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
        <span>✓ Du verpflichtest dich zu nichts.</span>
        <span>✓ Antwort kommt direkt von der Praxis.</span>
        <span>✓ Erstgespräch kostenfrei oder im niedrigen 2-stelligen Bereich.</span>
      </div>
    </div>
  )
}
