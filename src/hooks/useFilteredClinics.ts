import { useMemo } from 'react'
import type { Clinic, FilterState } from '../types/clinic'

export function useFilteredClinics(clinics: Clinic[], filters: FilterState): Clinic[] {
  return useMemo(() => {
    let result = [...clinics]

    if (filters.searchCity) {
      result = result.filter(c =>
        c.city.toLowerCase() === filters.searchCity.toLowerCase()
      )
    }

    if (filters.selectedMethods.length > 0) {
      result = result.filter(c =>
        filters.selectedMethods.some(m => {
          const mLower = m.toLowerCase()
          return c.methods.some(cm => cm.toLowerCase().includes(mLower.replace('verödung (sklerotherapie)', 'verödung').replace('laser (nd:yag)', 'nd:yag').replace('laser (diode)', 'diode').split('(')[0].trim()))
        })
      )
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
        case 'recommended':
          if (a.featured !== b.featured) return a.featured ? -1 : 1
          return (b.rating * Math.log(b.reviewCount)) - (a.rating * Math.log(a.reviewCount))
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
