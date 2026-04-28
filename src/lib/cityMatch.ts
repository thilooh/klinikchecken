// PLZ / city-name matcher used by the homepage geo cascade and the
// methoden-quiz. Maps ad-set names, IP-geo hits, manual searches, and
// 5-digit postal codes to one of the canonical city names that exist
// in clinics.ts. Returns null when no confident match is found - callers
// then fall back to the empty-state CityPicker.
//
// Extracted from App.tsx so the quiz can reuse the same logic.

const CITY_VARIANTS: [string[], string[]][] = [
  [['köln', 'koeln', 'koln', 'cologne'],              ['50', '51']],
  [['düsseldorf', 'duesseldorf', 'dusseldorf'],        ['40']],
  [['frankfurt', 'frankfurt am main'],                 ['60', '61', '63']],
  [['dortmund'],                                       ['44']],
  [['berlin'],                                         ['10', '12', '13', '14']],
  [['münchen', 'muenchen', 'munchen', 'munich'],       ['80', '81', '85']],
  [['hamburg'],                                        ['20', '21', '22']],
  [['leipzig'],                                        ['04']],
  [['nürnberg', 'nuernberg', 'nurnberg', 'nuremberg'], ['90', '91']],
  [['stuttgart'],                                      ['70', '71']],
  [['essen'],                                          ['45']],
  [['hannover', 'hanover'],                            ['30']],
  [['bremen'],                                         ['27', '28']],
  [['kiel'],                                           ['24']],
  [['rostock'],                                        ['18']],
  [['braunschweig', 'brunswick'],                      ['38']],
  [['magdeburg'],                                      ['39']],
  [['lübeck', 'luebeck', 'lubeck'],                   ['23']],
  [['bonn'],                                           ['53']],
  [['aachen'],                                         ['52']],
  [['münster', 'muenster', 'munster'],                 ['48']],
  [['bielefeld'],                                      ['336', '337', '338', '339']],
  [['wuppertal'],                                      ['42']],
  [['bochum'],                                         ['447', '448']],
  [['duisburg'],                                       ['47']],
  [['augsburg'],                                       ['86']],
  [['freiburg', 'freiburg im breisgau'],               ['79']],
  [['ulm'],                                            ['89']],
  [['heidelberg'],                                     ['69']],
  [['karlsruhe'],                                      ['76']],
  [['mannheim'],                                       ['68']],
  [['regensburg'],                                     ['93']],
  [['würzburg', 'wuerzburg', 'wurzburg'],              ['97']],
  [['dresden'],                                        ['01']],
  [['chemnitz'],                                       ['09']],
  [['erfurt'],                                         ['99']],
  [['potsdam'],                                        ['144', '145', '146']],
  [['wiesbaden'],                                      ['65']],
  [['mainz'],                                          ['55']],
  [['kassel'],                                         ['34']],
  [['saarbrücken', 'saarbruecken', 'saarbrucken'],     ['66']],
  [['göttingen', 'goettingen', 'gottingen'],           ['37']],
  [['halle', 'halle an der saale', 'halle saale'],     ['06']],
  [['mönchengladbach', 'moenchengladbach', 'mgladbach'],['41']],
  [['gelsenkirchen'],                                   ['459', '456', '458']],
  [['krefeld', 'crefeld'],                              ['477', '478']],
  [['oberhausen'],                                      ['460', '462']],
  [['hagen'],                                           ['58']],
  [['hamm'],                                            ['592', '593', '594']],
  [['ludwigshafen', 'ludwigshafen am rhein'],           ['67']],
  [['oldenburg'],                                       ['26']],
  [['osnabrück', 'osnabrueck', 'osnabruck'],            ['49']],
  [['leverkusen'],                                      ['513', '514']],
  [['solingen'],                                        ['427', '428']],
  [['paderborn'],                                       ['330', '331', '332']],
  [['darmstadt'],                                       ['64']],
  [['neuss'],                                           ['414']],
  [['ingolstadt'],                                      ['85']],
  [['heilbronn'],                                       ['742', '743', '744']],
  [['pforzheim'],                                       ['753', '754']],
  [['wolfsburg'],                                       ['384', '385', '386']],
  [['erlangen'],                                        ['910', '911']],
  [['reutlingen'],                                      ['721', '722']],
  [['koblenz'],                                         ['56']],
  [['jena'],                                            ['07']],
  [['trier'],                                           ['54']],
  [['schwerin'],                                        ['19']],
  [['gera'],                                            ['075', '076']],
  [['hildesheim'],                                      ['31']],
  [['siegen'],                                          ['571', '572', '573']],
  [['gütersloh', 'guetersloh', 'gutersloh'],            ['333', '334']],
  [['cottbus', 'chóśebuz'],                             ['03']],
]

const CANONICAL: string[] = [
  'Köln','Düsseldorf','Frankfurt','Dortmund','Berlin','München','Hamburg','Leipzig','Nürnberg','Stuttgart','Essen',
  'Hannover','Bremen','Kiel','Rostock','Braunschweig','Magdeburg','Lübeck',
  'Bonn','Aachen','Münster','Bielefeld','Wuppertal','Bochum','Duisburg',
  'Augsburg','Freiburg im Breisgau','Ulm','Heidelberg','Karlsruhe','Mannheim','Regensburg','Würzburg',
  'Dresden','Chemnitz','Erfurt','Potsdam',
  'Wiesbaden','Mainz','Kassel','Saarbrücken','Göttingen',
  'Halle (Saale)','Mönchengladbach','Gelsenkirchen','Krefeld','Oberhausen',
  'Hagen','Hamm','Ludwigshafen am Rhein','Oldenburg','Osnabrück',
  'Leverkusen','Solingen','Paderborn','Darmstadt','Neuss',
  'Ingolstadt','Heilbronn','Pforzheim','Wolfsburg','Erlangen',
  'Reutlingen','Koblenz','Jena','Trier','Schwerin',
  'Gera','Hildesheim','Siegen','Gütersloh','Cottbus',
]

export function matchCity(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  const norm = t.toLowerCase()
  // PLZ: 5-digit postal code - longest matching prefix wins
  if (/^\d{5}$/.test(t)) {
    let bestIdx = -1, bestLen = 0
    for (let i = 0; i < CITY_VARIANTS.length; i++) {
      for (const p of CITY_VARIANTS[i][1]) {
        if (t.startsWith(p) && p.length > bestLen) { bestIdx = i; bestLen = p.length }
      }
    }
    return bestIdx >= 0 ? CANONICAL[bestIdx] : null
  }
  // City name: exact then partial
  for (let i = 0; i < CITY_VARIANTS.length; i++) {
    if (CITY_VARIANTS[i][0].includes(norm)) return CANONICAL[i]
  }
  for (let i = 0; i < CITY_VARIANTS.length; i++) {
    if (CITY_VARIANTS[i][0].some(v => norm.startsWith(v) || v.startsWith(norm))) return CANONICAL[i]
  }
  return null
}
