// Wrap an internal image path with Netlify Image-CDN transforms so the
// browser gets a properly sized + auto-format (AVIF in supporting browsers,
// WebP elsewhere) version. Pass through external URLs untouched.
//
// Netlify Image CDN docs: https://docs.netlify.com/image-cdn/overview/
//
// Costs nothing on Netlify's free tier (1000 source images, unlimited
// transforms). Generates a unique CDN-cacheable URL per (src, width).

const IS_PROD = typeof window !== 'undefined' && window.location.hostname.endsWith('besenreiser-check.de')

export type ImgWidth = 80 | 120 | 160 | 200 | 240 | 320 | 400 | 600 | 800 | 1200

export function cdnImage(src: string | undefined, width: ImgWidth): string | undefined {
  if (!src) return undefined
  // External URL or already-transformed → pass through
  if (/^https?:\/\//.test(src) || src.startsWith('/.netlify/images')) return src
  // Local-only build / preview deploys: skip the transform so users see
  // the original asset without the CDN dance.
  if (!IS_PROD) return src
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fit=cover`
}

/** Produce a srcset string at multiple widths for responsive <img> usage. */
export function cdnSrcSet(src: string | undefined, widths: ImgWidth[]): string | undefined {
  if (!src || !IS_PROD || /^https?:\/\//.test(src)) return undefined
  return widths.map(w => `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&fit=cover ${w}w`).join(', ')
}
