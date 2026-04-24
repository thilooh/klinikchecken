import type { Config, Context } from '@netlify/edge-functions'

export default async function handler(_request: Request, context: Context) {
  const geo = context.geo as { city?: string; postal_code?: string } | undefined
  return Response.json({
    city: geo?.city ?? '',
    postalCode: geo?.postal_code ?? '',
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export const config: Config = {
  path: '/api/geo',
}
