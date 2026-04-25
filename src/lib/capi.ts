function getCookie(name: string) {
  return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1]
}

function getUserData(email?: string, phone?: string) {
  // Build fbc from fbclid URL param; persist in sessionStorage across navigations
  const params = new URLSearchParams(window.location.search)
  const fbclid = params.get('fbclid')
  if (fbclid && !sessionStorage.getItem('_fbc'))
    sessionStorage.setItem('_fbc', `fb.1.${Date.now()}.${fbclid}`)

  return {
    fbc: getCookie('_fbc') || sessionStorage.getItem('_fbc') || undefined,
    fbp: getCookie('_fbp') || undefined,
    pageUrl: window.location.href,
    email,
    phone,
  }
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function sendEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: { email?: string; phone?: string },
) {
  const eventId = `${eventName.toLowerCase()}_${uid()}`
  fetch('/.netlify/functions/capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId,
      userData: getUserData(userData?.email, userData?.phone),
      customData,
    }),
  }).catch(() => {})
  return eventId
}
