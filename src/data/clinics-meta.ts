// Constants used by the filter UI. Stays bundled with the app because it
// must be available immediately, before the clinic data finishes loading.
//
// IMPORTANT: keep these in sync with src/data/clinics.ts. The
// scripts/extract-clinics-json.mjs build step verifies that every
// clinic.city is present in ALL_CITIES.

export const ALL_METHODS = [
  'Verödung (Sklerotherapie)',
  'Laser (Nd:YAG)',
  'Laser (KTP)',
  'IPL-Behandlung',
  'Mikroschaum-Sklerotherapie',
  'Endovenöse Lasertherapie',
  'Radiofrequenztherapie',
]

export const ALL_CITIES = [
  'Köln', 'Düsseldorf', 'Frankfurt', 'Dortmund', 'Berlin', 'München', 'Hamburg',
  'Leipzig', 'Nürnberg', 'Stuttgart', 'Essen', 'Hannover', 'Bremen', 'Kiel',
  'Rostock', 'Braunschweig', 'Magdeburg', 'Lübeck', 'Bonn', 'Aachen', 'Münster',
  'Bielefeld', 'Wuppertal', 'Bochum', 'Duisburg', 'Augsburg',
  'Freiburg im Breisgau', 'Ulm', 'Heidelberg', 'Karlsruhe', 'Mannheim',
  'Regensburg', 'Würzburg', 'Dresden', 'Chemnitz', 'Erfurt', 'Potsdam',
  'Wiesbaden', 'Mainz', 'Kassel', 'Saarbrücken', 'Göttingen', 'Halle (Saale)',
  'Mönchengladbach', 'Gelsenkirchen', 'Krefeld', 'Oberhausen', 'Hagen', 'Hamm',
  'Ludwigshafen am Rhein', 'Oldenburg', 'Osnabrück', 'Leverkusen', 'Solingen',
  'Paderborn', 'Darmstadt', 'Neuss', 'Ingolstadt', 'Heilbronn', 'Pforzheim',
  'Wolfsburg', 'Erlangen', 'Reutlingen', 'Koblenz', 'Jena', 'Trier', 'Schwerin',
  'Gera', 'Hildesheim', 'Siegen', 'Gütersloh', 'Cottbus',
]
