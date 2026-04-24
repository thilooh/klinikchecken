import type { Config, Context } from '@netlify/edge-functions'

export default async function handler(_request: Request, context: Context) {
  const city = (context.geo as { city?: string })?.city ?? ''
  return Response.json({ city }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export const config: Config = {
  path: '/api/geo',
}
