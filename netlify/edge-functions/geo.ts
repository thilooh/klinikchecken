import type { Config, Context } from '@netlify/edge-functions'

/**
 * Best-effort visitor geo from the Netlify Edge.
 * - city / postalCode: exact match attempts first
 * - subdivisionCode: ISO 3166-2 (e.g. 'DE-NW' for NRW). Carrier-Mobile-IPs
 *   route through gateways that mis-detect the city, but the Bundesland
 *   stays accurate ~95% of the time → great fallback signal.
 */
export default async function handler(_request: Request, context: Context) {
  const geo = context.geo as {
    city?: string
    postal_code?: string
    subdivision?: { code?: string; name?: string }
  } | undefined
  return Response.json({
    city: geo?.city ?? '',
    postalCode: geo?.postal_code ?? '',
    subdivisionCode: geo?.subdivision?.code ?? '',
    subdivisionName: geo?.subdivision?.name ?? '',
  }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

export const config: Config = {
  path: '/api/geo',
}
