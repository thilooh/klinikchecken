export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getCookie(name: string): string | undefined {
  return document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=')
}

export function sendCapi(
  eventName: string,
  eventId: string,
  customData?: Record<string, unknown>,
  userData?: { email?: string; phone?: string },
): void {
  fetch('/.netlify/functions/meta-capi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
      email: userData?.email,
      phone: userData?.phone,
      customData,
    }),
  }).catch(() => {})
}
