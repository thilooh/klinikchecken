const VARIANTS = {
  orange: '#FF6600',
  blue:   '#2563EB',
  green:  '#059669',
} as const

export type CTAVariant = keyof typeof VARIANTS
const SESSION_KEY = 'cta_variant'

export function getCTAVariant(): CTAVariant {
  const param = new URLSearchParams(window.location.search).get('ctab')
  if (param && param in VARIANTS) {
    sessionStorage.setItem(SESSION_KEY, param)
    return param as CTAVariant
  }
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored && stored in VARIANTS) return stored as CTAVariant
  const keys = Object.keys(VARIANTS) as CTAVariant[]
  const picked = keys[Math.floor(Math.random() * keys.length)]
  sessionStorage.setItem(SESSION_KEY, picked)
  return picked
}

export function getCTAColor(variant: CTAVariant): string {
  return VARIANTS[variant]
}
