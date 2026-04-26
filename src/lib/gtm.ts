declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

function dl() {
  window.dataLayer = window.dataLayer || []
  return window.dataLayer
}

function getCookie(name: string): string | undefined {
  const escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&')
  const match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : undefined
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function buildFbcFromUrl(): string | undefined {
  const fbclid = new URLSearchParams(window.location.search).get('fbclid')
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined
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
): void {
  const event_id = uuid()
  const fbp = getCookie('_fbp')
  const fbc = getCookie('_fbc') ?? buildFbcFromUrl()

  void (async () => {
    const userPayload: Record<string, string> = {}
    if (userData?.email) {
      const e = normalizeEmail(userData.email)
      userPayload.user_email = e
      userPayload.em = await sha256(e)
    }
    if (userData?.phone) {
      const p = normalizePhone(userData.phone)
      if (p) {
        userPayload.user_phone = p
        userPayload.ph = await sha256(p)
      }
    }
    if (userData?.firstName) {
      const fn = userData.firstName.trim().toLowerCase()
      userPayload.user_first_name = fn
      userPayload.fn = await sha256(fn)
    }
    if (userData?.lastName) {
      const ln = userData.lastName.trim().toLowerCase()
      userPayload.user_last_name = ln
      userPayload.ln = await sha256(ln)
    }

    dl().push({
      event: eventName,
      event_id,
      ...(fbp ? { fbp } : {}),
      ...(fbc ? { fbc } : {}),
      ...customData,
      ...userPayload,
    })
  })()
}
