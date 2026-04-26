// URL-safe German slug. Lowercase, umlauts → ae/oe/ue/ss, spaces → hyphens.
// Always appends the clinic ID so two practices with the same name still get
// distinct URLs.

const UMLAUT_MAP: Record<string, string> = {
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
  'á': 'a', 'à': 'a', 'â': 'a',
  'é': 'e', 'è': 'e', 'ê': 'e',
  'í': 'i', 'ì': 'i', 'î': 'i',
  'ó': 'o', 'ò': 'o', 'ô': 'o',
  'ú': 'u', 'ù': 'u', 'û': 'u',
  'ç': 'c', 'ñ': 'n',
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[äöüßáàâéèêíìîóòôúùûçñ]/g, ch => UMLAUT_MAP[ch] ?? ch)
    .replace(/&/g, 'und')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80)
}

export function clinicSlug(clinic: { id: number; name: string; city: string }): string {
  return `${slugify(clinic.name)}-${slugify(clinic.city)}-${clinic.id}`
}

/** Extract numeric clinic ID from a slug ending in `-<id>`. Returns null if absent. */
export function clinicIdFromSlug(slug: string): number | null {
  const m = slug.match(/-(\d+)$/)
  return m ? Number(m[1]) : null
}

export function citySlug(city: string): string {
  return slugify(city)
}
