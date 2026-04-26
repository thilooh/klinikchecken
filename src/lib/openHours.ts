// 0=So, 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr, 6=Sa  (matches JS Date.getDay())
const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export function isAppointmentOnly(openHours: string): boolean {
  return !!openHours && /nach vereinbarung|auf anfrage|nur termin/i.test(openHours)
}

function dayIndices(token: string): number[] {
  const out: number[] = []
  for (const part of token.split(/[/+]/)) {
    const t = part.trim()
    if (t.includes('–')) {
      const [a, b] = t.split('–').map(s => DAYS.indexOf(s.trim()))
      if (a >= 0 && b >= 0) for (let i = a; i <= b; i++) out.push(i)
    } else {
      const i = DAYS.indexOf(t)
      if (i >= 0) out.push(i)
    }
  }
  return out
}

export function isOpenToday(openHours: string): boolean {
  if (!openHours) return false

  // Appointment-only → can't determine open status
  if (/nach vereinbarung|auf anfrage/i.test(openHours)) return false

  const today = new Date().getDay()
  const abbr = DAYS[today]

  // Places API format: "Mo: 08:00–18:00 Uhr, Di: geschl., ..."
  if (/\b(Mo|Di|Mi|Do|Fr|Sa|So):\s/.test(openHours)) {
    const rx = new RegExp(`\\b${abbr}:\\s*(\\S+)`)
    const m = openHours.match(rx)
    if (!m) return false         // day not listed → closed
    return !m[1].startsWith('g') // "geschl." → closed
  }

  // No day abbreviations at all → can't determine, assume closed
  if (!/\b(Mo|Di|Mi|Do|Fr|Sa|So)\b/.test(openHours)) return false

  // Manual format: segments separated by '|' or ','
  // Each segment starts with an optional day token (e.g. "Mo–Fr", "Mi+Fr", "Do")
  // followed by times. Time-only segments (e.g. "14:00–18:00") are skipped.
  for (const seg of openHours.split(/[|,]/)) {
    const trimmed = seg.trim()
    const dayToken = trimmed.split(/\s+\d/)[0].trim()
    if (dayIndices(dayToken).includes(today)) return true
  }
  return false
}
