// 0=So, 1=Mo, 2=Di, 3=Mi, 4=Do, 5=Fr, 6=Sa  (matches JS Date.getDay())
const DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

function dayIndices(token: string): number[] {
  const out: number[] = []
  for (const part of token.split('/')) {
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
  const today = new Date().getDay()
  const abbr = DAYS[today]

  // Format from Places API: "Mo: 08:00–18:00 Uhr, Di: geschl., ..."
  if (/\b(Mo|Di|Mi|Do|Fr|Sa|So):\s/.test(openHours)) {
    const rx = new RegExp(`\\b${abbr}:\\s*(\\S+)`)
    const m = openHours.match(rx)
    if (!m) return false          // day not listed → closed
    return !m[1].startsWith('g') // "geschl." → closed
  }

  // No day tokens at all → open every day (e.g. "9:00–18:00 Uhr")
  if (!/\b(Mo|Di|Mi|Do|Fr|Sa|So)\b/.test(openHours)) return true

  // Format from manual entry: "Mo–Do 8:00–13:00, Fr 8:00–13:00"
  for (const seg of openHours.split(',')) {
    const dayToken = seg.trim().split(/\s+\d/)[0]
    if (dayIndices(dayToken).includes(today)) return true
  }
  return false
}
