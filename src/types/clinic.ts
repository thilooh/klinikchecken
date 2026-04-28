export type ClinicTier = 'basic' | 'premium' | 'premium_plus'

export interface Clinic {
  id: number
  name: string
  city: string
  address: string
  district: string
  distanceKm: number
  lat?: number
  lng?: number
  doctor: string
  qualification: string
  rating: number
  reviewCount: number
  googleRating?: number
  googleReviewCount?: number
  placeId?: string
  methods: string[]
  openToday: boolean
  openHours: string
  freeConsultation: boolean
  onlineBooking: boolean
  eveningAppointments: boolean
  kassenpatient: boolean
  ratenzahlung: boolean
  parking: boolean
  certified: boolean
  foundedYear?: number
  media?: {
    logo?: string
    streetview?: string
    map?: string
  }
  photoCount: number
  lastInquiry: string
  featured: boolean
  tags: string[]
  headline: string
  usp: string[]
  treatmentInfo?: {
    intro?: string
    methodDetails?: { method: string; description: string }[]
    processSteps?: string[]
    phlebologist?: { name: string; title: string; bio: string }
  }
  // Quiz/Praxis-Anfrage related (added 2026-04 for the Quiz redesign).
  // tier defaults to 'basic' for all entries until premium contracts ship.
  // praxis_email is a placeholder while we collect real contact addresses.
  // webseite is optional; basic-tier cards show it instead of the inquiry CTA.
  tier: ClinicTier
  praxis_email: string
  webseite?: string
}

export interface FilterState {
  selectedMethods: string[]
  minRating: number
  maxDistance: number
  extras: {
    freeConsultation: boolean
    onlineBooking: boolean
    evening: boolean
    kassenpatient: boolean
    ratenzahlung: boolean
    parking: boolean
    certified: boolean
  }
  sortBy: 'recommended' | 'rating' | 'distance'
  searchCity: string
  userLat?: number
  userLng?: number
}
