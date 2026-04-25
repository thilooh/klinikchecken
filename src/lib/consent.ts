const KEY = 'cookie_consent'

export type ConsentState = 'accepted' | 'declined'

export function getConsent(): ConsentState | null {
  const v = localStorage.getItem(KEY)
  if (v === 'accepted' || v === 'declined') return v
  return null
}

export function setConsent(state: ConsentState): void {
  localStorage.setItem(KEY, state)
}

export function loadGTM(): void {
  if (document.getElementById('gtm-script')) return
  const id = 'GTM-54CWZDL7'
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
  const s = document.createElement('script')
  s.id = 'gtm-script'
  s.async = true
  s.src = `https://www.googletagmanager.com/gtm.js?id=${id}`
  document.head.appendChild(s)
}
