import type { Clinic } from './types/clinic'

export type VariantKey = 'a' | 'b' | 'c'

export const VARIANT_KEYS: VariantKey[] = ['a', 'b', 'c']

export function parseVariant(raw: string | null): VariantKey {
  if (raw === 'b' || raw === 'c') return raw
  return 'a'
}

export interface VariantConfig {
  hero: { headline: string; subheadline: string }
  card: { subline: (c: Clinic) => string; cta: string; badge: string }
}

export const VARIANTS: Record<VariantKey, VariantConfig> = {
  a: {
    hero: {
      headline: 'Die richtige Praxis für deine Besenreiser. Ohne Pfusch.',
      subheadline: 'Wir haben 100+ Phlebologen, Dermatologen und Venenzentren geprüft.',
    },
    card: {
      subline: c => c.headline,
      cta: 'Jetzt anfragen',
      badge: '★ Top-Bewertung',
    },
  },
  b: {
    hero: {
      headline: 'Besenreiser weg — für immer. Geprüfte Spezialisten in deiner Stadt.',
      subheadline: 'Nur Praxen mit nachgewiesener Fachexpertise und echten Patientenstimmen.',
    },
    card: {
      subline: c =>
        c.googleReviewCount
          ? `${c.googleReviewCount} echte Bewertungen · ${c.qualification}`
          : c.headline,
      cta: 'Kostenlos anfragen',
      badge: '★ Top-Bewertung',
    },
  },
  c: {
    hero: {
      headline: 'Kein Pfusch. Kein Versteckspiel. Nur geprüfte Besenreiser-Praxen.',
      subheadline: 'Transparente Bewertungen, echte Facharzt-Qualifikation, klare Preise.',
    },
    card: {
      subline: c => c.usp[0] ?? c.headline,
      cta: 'Termin anfragen',
      badge: '★ Top-Bewertung',
    },
  },
}
