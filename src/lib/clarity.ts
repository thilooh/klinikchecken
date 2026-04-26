declare global {
  interface Window {
    clarity: ((...args: unknown[]) => void) & { q?: unknown[] }
  }
}

// ── Replace with your real Clarity project ID from clarity.microsoft.com ──
export const CLARITY_PROJECT_ID = 'whoyubc0gl'

export function loadClarity(): void {
  if (!CLARITY_PROJECT_ID || CLARITY_PROJECT_ID.startsWith('REPLACE')) return
  if (document.getElementById('clarity-script')) return

  // Queue API calls before script loads
  window.clarity = window.clarity || function (...args) {
    (window.clarity.q = window.clarity.q || []).push(args)
  }

  const s = document.createElement('script')
  s.id = 'clarity-script'
  s.async = true
  s.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`
  document.head.appendChild(s)
}

export function clarityEvent(name: string, value?: string): void {
  if (typeof window.clarity !== 'function') return
  if (value !== undefined) {
    window.clarity('set', name, value)
  } else {
    window.clarity('event', name)
  }
}
