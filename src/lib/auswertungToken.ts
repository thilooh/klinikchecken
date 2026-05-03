// Compact base64url-encoded snapshot of the quiz state, used in
// transactional email CTAs so the user lands directly on her
// auswertung instead of having to re-traverse /methoden-quiz.
//
// Encoding: stable JSON.stringify of {answers, lead, profile} →
// UTF-8 bytes → base64url (no padding, URL-safe alphabet). Round-
// trips identical state.
//
// Privacy: the token contains the same data the user just submitted
// (vorname, email, plz, quiz answers, computed profile). It's the
// content of the email itself - opening the URL recovers what she
// already has in her inbox. Worst case if the link is shared: the
// recipient sees a stranger's quiz answers + email + plz. That's
// acceptable for this use case but worth noting before we ever
// route financial / consent-revoke actions through tokens.

import type { QuizAnswers, QuizLead, ComputedProfile } from './quizState'

export type AuswertungSnapshot = {
  answers: QuizAnswers
  lead: QuizLead
  profile: ComputedProfile
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  const b64 = btoa(binary)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeSnapshot(s: AuswertungSnapshot): string {
  const json = JSON.stringify(s)
  const bytes = new TextEncoder().encode(json)
  return bytesToBase64Url(bytes)
}

export function decodeSnapshot(token: string): AuswertungSnapshot | null {
  try {
    const bytes = base64UrlToBytes(token)
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json) as AuswertungSnapshot
    if (!parsed?.answers || !parsed?.lead || !parsed?.profile) return null
    return parsed
  } catch {
    return null
  }
}
