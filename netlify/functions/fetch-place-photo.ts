// Temporary proxy used to fetch Google Place Photos. Returns the
// binary image bytes plus content-type so the caller can write the
// file. Used by a one-off sync run; safe to delete afterwards.

const CORS = { 'Access-Control-Allow-Origin': '*' }

export const handler = async (event: { queryStringParameters?: Record<string, string> }) => {
  const placeId = event.queryStringParameters?.placeId
  const maxwidth = event.queryStringParameters?.maxwidth ?? '800'
  if (!placeId) return { statusCode: 400, headers: CORS, body: 'placeId required' }

  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) return { statusCode: 500, headers: CORS, body: 'GOOGLE_PLACES_API_KEY not set' }

  const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=photos,website&key=${key}`
  const detailRes = await fetch(detailUrl)
  const detail = await detailRes.json() as { status: string; result?: { photos?: { photo_reference: string }[]; website?: string } }
  if (detail.status !== 'OK') return { statusCode: 502, headers: CORS, body: `Details: ${detail.status}` }

  const photoRef = detail.result?.photos?.[0]?.photo_reference
  if (!photoRef) {
    return {
      statusCode: 404,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'no photos', website: detail.result?.website ?? null }),
    }
  }

  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${encodeURIComponent(photoRef)}&key=${key}`
  const photoRes = await fetch(photoUrl, { redirect: 'follow' })
  if (!photoRes.ok) return { statusCode: 502, headers: CORS, body: `Photo: HTTP ${photoRes.status}` }

  const buf = Buffer.from(await photoRes.arrayBuffer())
  const ct = photoRes.headers.get('content-type') ?? 'image/jpeg'
  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': ct, 'X-Website': detail.result?.website ?? '' },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  }
}
