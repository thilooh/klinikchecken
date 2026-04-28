// Practice ranking for the quiz result page. Match-first sort
// (UWG-conservative) - clinics that actually offer a method relevant
// to the quiz answers always rank above premium-tier clinics that
// don't, so the "passend zu deinem Befund" framing isn't misleading.

import type { Clinic } from '../types/clinic'
import { haversineKm } from './geo'
import { QUIZ_METHOD_TO_CANONICAL, type QuizMethodKey } from './quizRecommendations'

export type ScoredPraxis = Clinic & {
  isMatch: boolean
  distance_km: number
}

export function isMethodMatch(clinic: Clinic, relevantQuizMethods: QuizMethodKey[]): boolean {
  const canonicalSet = new Set(relevantQuizMethods.flatMap(k => QUIZ_METHOD_TO_CANONICAL[k]))
  return clinic.methods.some(m => canonicalSet.has(m))
}

const TIER_RANK: Record<Clinic['tier'], number> = {
  premium_plus: 0,
  premium: 1,
  basic: 2,
}

const MAX_DISTANCE_KM = 50

export function sortPraxen(
  clinics: Clinic[],
  userCoords: { lat: number; lng: number } | null,
  relevantQuizMethods: QuizMethodKey[],
): ScoredPraxis[] {
  return clinics
    .filter(c => c.lat != null && c.lng != null)
    .map(c => ({
      ...c,
      isMatch: isMethodMatch(c, relevantQuizMethods),
      distance_km: userCoords
        ? Math.round(haversineKm(userCoords.lat, userCoords.lng, c.lat as number, c.lng as number) * 10) / 10
        : Number.POSITIVE_INFINITY,
    }))
    .filter(p => !userCoords || p.distance_km <= MAX_DISTANCE_KM)
    .sort((a, b) => {
      // 1. Match first (UWG-safer than tier-first - the "passend"
      //    framing on the result page must reflect actual fit)
      if (a.isMatch !== b.isMatch) return a.isMatch ? -1 : 1
      // 2. Tier
      if (TIER_RANK[a.tier] !== TIER_RANK[b.tier]) {
        return TIER_RANK[a.tier] - TIER_RANK[b.tier]
      }
      // 3. Distance
      return a.distance_km - b.distance_km
    })
}

// Derive PLZ coordinates from the existing clinic dataset rather than
// shipping a separate PLZ-coords table. Returns the median lat/lng of
// all clinics in the matched city, which is accurate enough for the
// 50 km filter and ranking. Returns null when matchCity didn't yield
// a city or when no clinic in that city has coordinates.
export function getCityCenter(
  clinics: Clinic[],
  cityName: string | null,
): { lat: number; lng: number } | null {
  if (!cityName) return null
  const inCity = clinics.filter(
    c => c.city === cityName && c.lat != null && c.lng != null,
  )
  if (inCity.length === 0) return null
  const lats = inCity.map(c => c.lat as number).sort((a, b) => a - b)
  const lngs = inCity.map(c => c.lng as number).sort((a, b) => a - b)
  const mid = Math.floor(lats.length / 2)
  return { lat: lats[mid], lng: lngs[mid] }
}
