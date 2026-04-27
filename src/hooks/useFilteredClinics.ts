import { useMemo } from 'react'
import type { Clinic, FilterState } from '../types/clinic'
import { haversineKm } from '../lib/geo'

// Maps each filter UI label to the substrings that should match clinic.methods
// entries. Using an explicit table avoids the previous split('(')[0] heuristic
// which silently let "Laser (KTP)" match Nd:YAG/Diode listings.
const METHOD_KEYWORDS: Record<string, string[]> = {
  'Verödung (Sklerotherapie)':  ['verödung', 'sklerotherapie', 'sklerosierung', 'mikrosklerotherapie', 'schaumverödung', 'schaumsklerotherapie'],
  'Laser (Nd:YAG)':             ['nd:yag', 'ndyag'],
  'Laser (KTP)':                ['ktp'],
  'IPL-Behandlung':             ['ipl'],
  'Mikroschaum-Sklerotherapie': ['mikroschaum'],
  'Endovenöse Lasertherapie':   ['endovenös', 'endovenose', 'elves'],
  'Radiofrequenztherapie':      ['radiofrequenz', 'radiowellen', 'rfa', 'venefit'],
}

function clinicMatchesMethod(clinic: Clinic, filterLabel: string): boolean {
  const keywords = METHOD_KEYWORDS[filterLabel]
  if (!keywords) return false
  return clinic.methods.some(cm => {
    const lower = cm.toLowerCase()
    return keywords.some(kw => lower.includes(kw))
  })
}

export function useFilteredClinics(clinics: Clinic[], filters: FilterState): Clinic[] {
  return useMemo(() => {
    const { userLat, userLng } = filters
    const hasUserCoords = userLat != null && userLng != null

    let result: Clinic[]
    if (hasUserCoords) {
      // Distance-based view: drop clinics without coordinates entirely -
      // their stale distanceKm (distance to their own city centre) would
      // otherwise let them rank above real near-by practices.
      result = clinics
        .filter(c => c.lat != null && c.lng != null)
        .map(c => ({ ...c, distanceKm: Math.round(haversineKm(userLat, userLng, c.lat as number, c.lng as number) * 10) / 10 }))
    } else {
      result = clinics
    }

    if (filters.searchCity && !hasUserCoords) {
      result = result.filter(c =>
        c.city.toLowerCase() === filters.searchCity.toLowerCase()
      )
    }

    if (filters.selectedMethods.length > 0) {
      result = result.filter(c => filters.selectedMethods.some(m => clinicMatchesMethod(c, m)))
    }

    if (filters.minRating > 0) {
      result = result.filter(c => c.rating >= filters.minRating)
    }

    if (filters.maxDistance < 999) {
      result = result.filter(c => c.distanceKm <= filters.maxDistance)
    }

    if (filters.extras.freeConsultation) result = result.filter(c => c.freeConsultation)
    if (filters.extras.onlineBooking) result = result.filter(c => c.onlineBooking)
    if (filters.extras.evening) result = result.filter(c => c.eveningAppointments)
    if (filters.extras.kassenpatient) result = result.filter(c => c.kassenpatient)
    if (filters.extras.ratenzahlung) result = result.filter(c => c.ratenzahlung)
    if (filters.extras.parking) result = result.filter(c => c.parking)
    if (filters.extras.certified) result = result.filter(c => c.certified)

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'recommended': {
          if (a.featured !== b.featured) return a.featured ? -1 : 1
          const scoreA = a.rating > 0 && a.reviewCount > 0 ? a.rating * Math.log(a.reviewCount) : 0
          const scoreB = b.rating > 0 && b.reviewCount > 0 ? b.rating * Math.log(b.reviewCount) : 0
          return scoreB - scoreA
        }
        case 'rating':
          if (b.rating !== a.rating) return b.rating - a.rating
          return b.reviewCount - a.reviewCount
        case 'distance':
          return a.distanceKm - b.distanceKm
        default:
          return 0
      }
    })

    return result
  }, [clinics, filters])
}
