import type { Clinic } from './types/clinic'

export type VariantKey = 'a' | 'b' | 'c'

export const VARIANT_KEYS: VariantKey[] = ['a', 'b', 'c']

export function parseVariant(raw: string | null): VariantKey {
  if (raw === 'b' || raw === 'c') return raw
  return 'a'
}

export interface VariantConfig {
  hero: { headline: string; subheadline: string }
  card: { subline: (c: Clinic) => string; cta: string }
}

export const VARIANTS: Record<VariantKey, VariantConfig> = {
  a: {
    hero: {
      headline: 'Endlich wieder Bein zeigen. Mit der richtigen Praxis.',
      subheadline: 'Phlebologen, Dermatologen und Venenzentren - sortiert nach Facharzt-Qualifikation und Patientenstimmen.',
    },
    card: {
      subline: c => c.headline,
      cta: 'Jetzt anfragen',
    },
  },
  b: {
    hero: {
      headline: 'Spezialisierte Besenreiser-Praxen in deiner Stadt.',
      subheadline: 'Sortiert nach Facharzt-Qualifikation und echten Patientenstimmen.',
    },
    card: {
      subline: c =>
        c.googleReviewCount
          ? `${c.googleReviewCount} echte Bewertungen · ${c.qualification}`
          : c.headline,
      cta: 'Kostenlos anfragen',
    },
  },
  c: {
    hero: {
      headline: 'Spezialisierte Besenreiser-Praxen. Transparent. Fachärztlich.',
      subheadline: 'Transparente Bewertungen, Facharzt-Qualifikation, klare Preise.',
    },
    card: {
      subline: c => c.usp[0] ?? c.headline,
      cta: 'Termin anfragen',
    },
  },
}
