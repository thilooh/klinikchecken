declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

function dl() {
  window.dataLayer = window.dataLayer || []
  return window.dataLayer
}

export function sendEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: { email?: string; phone?: string },
) {
  dl().push({
    event: eventName,
    ...customData,
    ...(userData?.email ? { user_email: userData.email } : {}),
    ...(userData?.phone ? { user_phone: userData.phone } : {}),
  })
}
