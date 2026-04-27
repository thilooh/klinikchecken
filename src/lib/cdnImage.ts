// Wrap an internal image path with Netlify Image-CDN transforms so the
// browser gets a properly sized + auto-format (AVIF in supporting browsers,
// WebP elsewhere) version. Pass through external URLs untouched.
//
// Netlify Image CDN docs: https://docs.netlify.com/image-cdn/overview/
//
// IMPORTANT: default fit is 'contain' so wide logos with surrounding
// whitespace don't get center-cropped (cover would chop a horizontal
// brand logo into a meaningless vertical strip). Only pass 'cover' for
// photos that are supposed to fill the box.

const IS_PROD = typeof window !== 'undefined' && window.location.hostname.endsWith('besenreiser-check.de')

export type ImgWidth = 80 | 120 | 160 | 200 | 240 | 320 | 400 | 600 | 800 | 1200
export type ImgFit = 'contain' | 'cover'

export function cdnImage(src: string | undefined, width: ImgWidth, fit: ImgFit = 'contain'): string | undefined {
  if (!src) return undefined
  // External URL or already-transformed → pass through
  if (/^https?:\/\//.test(src) || src.startsWith('/.netlify/images')) return src
  // Local-only build / preview deploys: skip the transform so users see
  // the original asset without the CDN dance.
  if (!IS_PROD) return src
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&fit=${fit}`
}
