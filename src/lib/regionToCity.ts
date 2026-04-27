// Map a German Bundesland (ISO 3166-2 subdivision code returned by
// Netlify Edge) to the largest LISTED city in that Bundesland.
//
// Source list of cities: src/data/clinics-meta.ts ALL_CITIES.
// Picked by approximate population priority among the cities we list.
//
// Used as a fallback when exact-city IP-Geo fails (most mobile carrier
// IPs land you on a regional gateway that mis-detects the city).

const REGION_TO_CITY: Record<string, string> = {
  'DE-BW': 'Stuttgart',          // Baden-Württemberg
  'DE-BY': 'München',            // Bayern
  'DE-BE': 'Berlin',             // Berlin
  'DE-BB': 'Potsdam',            // Brandenburg
  'DE-HB': 'Bremen',             // Bremen
  'DE-HH': 'Hamburg',            // Hamburg
  'DE-HE': 'Frankfurt',          // Hessen
  'DE-MV': 'Rostock',            // Mecklenburg-Vorpommern
  'DE-NI': 'Hannover',           // Niedersachsen
  'DE-NW': 'Köln',               // Nordrhein-Westfalen (largest listed)
  'DE-RP': 'Mainz',              // Rheinland-Pfalz
  'DE-SL': 'Saarbrücken',        // Saarland
  'DE-SN': 'Dresden',            // Sachsen
  'DE-ST': 'Magdeburg',          // Sachsen-Anhalt
  'DE-SH': 'Kiel',               // Schleswig-Holstein
  'DE-TH': 'Erfurt',             // Thüringen
}

export function cityForRegion(subdivisionCode: string | undefined | null): string | null {
  if (!subdivisionCode) return null
  return REGION_TO_CITY[subdivisionCode.toUpperCase()] ?? null
}

/** All cities listed in the region map — used by CityPicker quick-pick row. */
export const REGION_FALLBACK_CITIES = Array.from(new Set(Object.values(REGION_TO_CITY)))
