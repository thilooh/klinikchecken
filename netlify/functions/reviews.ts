type Event = {
  queryStringParameters: Record<string, string> | null
}

type Response = {
  statusCode: number
  headers?: Record<string, string>
  body: string
}

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 's-maxage=86400',
}

export const handler = async (event: Event): Promise<Response> => {
  const placeId = event.queryStringParameters?.placeId
  if (!placeId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'placeId required' }) }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) }
  }

  try {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${encodeURIComponent(placeId)}` +
      `&fields=reviews,rating,user_ratings_total,name` +
      `&language=de` +
      `&reviews_sort=newest` +
      `&key=${apiKey}`

    const res = await fetch(url)
    const data = await res.json() as {
      status: string
      result?: {
        reviews?: unknown[]
        rating?: number
        user_ratings_total?: number
      }
    }

    if (data.status !== 'OK') {
      return { statusCode: 422, headers: CORS, body: JSON.stringify({ error: data.status }) }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        reviews: data.result?.reviews ?? [],
        rating: data.result?.rating,
        reviewCount: data.result?.user_ratings_total,
      }),
    }
  } catch {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'fetch failed' }) }
  }
}
