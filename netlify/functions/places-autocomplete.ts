// Proxy for the Google Places Autocomplete + Place Details APIs.
// Keeps the API key server-side and returns either:
//   GET /?input=...           → { predictions: [...] }   (autocomplete)
//   GET /?placeId=...         → { lat, lng }             (geometry lookup)

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}

type Prediction = {
  description: string
  place_id: string
  structured_formatting?: { main_text?: string; secondary_text?: string }
  types?: string[]
}

export const handler = async (event: { queryStringParameters?: Record<string, string> }) => {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'not_configured' }) }

  const params = event.queryStringParameters ?? {}
  const placeId = params.placeId
  const input = params.input
  const sessionToken = params.sessionToken

  if (placeId) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', placeId)
    url.searchParams.set('fields', 'geometry,name,formatted_address')
    if (sessionToken) url.searchParams.set('sessiontoken', sessionToken)
    url.searchParams.set('key', key)
    const r = await fetch(url.toString())
    const d = await r.json() as { status: string; result?: { geometry?: { location?: { lat: number; lng: number } }; name?: string; formatted_address?: string } }
    if (d.status !== 'OK' || !d.result?.geometry?.location) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: d.status }) }
    }
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        lat: d.result.geometry.location.lat,
        lng: d.result.geometry.location.lng,
        name: d.result.name,
        address: d.result.formatted_address,
      }),
    }
  }

  if (!input || input.length < 2) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'input required (min 2 chars)' }) }
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', input)
  url.searchParams.set('language', 'de')
  url.searchParams.set('components', 'country:de')
  url.searchParams.set('types', 'geocode')   // cities + streets + postal codes
  if (sessionToken) url.searchParams.set('sessiontoken', sessionToken)
  url.searchParams.set('key', key)

  const r = await fetch(url.toString())
  const d = await r.json() as { status: string; predictions?: Prediction[] }
  if (d.status !== 'OK' && d.status !== 'ZERO_RESULTS') {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: d.status }) }
  }

  const predictions = (d.predictions ?? []).map(p => ({
    description: p.description,
    place_id: p.place_id,
    main_text: p.structured_formatting?.main_text ?? p.description,
    secondary_text: p.structured_formatting?.secondary_text ?? '',
    types: p.types ?? [],
  }))

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ predictions }) }
}
