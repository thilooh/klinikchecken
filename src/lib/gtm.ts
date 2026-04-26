declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

function dl() {
  window.dataLayer = window.dataLayer || []
  return window.dataLayer
}

function newEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export interface UserData {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
}

export function sendEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: UserData,
): string {
  const event_id = newEventId()
  dl().push({
    event: eventName,
    event_id,
    ...customData,
    ...(userData?.email ? { user_email: userData.email.trim().toLowerCase() } : {}),
    ...(userData?.phone ? { user_phone: userData.phone.replace(/[^\d+]/g, '') } : {}),
    ...(userData?.firstName ? { user_first_name: userData.firstName.trim().toLowerCase() } : {}),
    ...(userData?.lastName ? { user_last_name: userData.lastName.trim().toLowerCase() } : {}),
  })
  return event_id
}
