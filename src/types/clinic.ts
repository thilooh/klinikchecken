export interface Clinic {
  id: number
  name: string
  city: string
  address: string
  district: string
  distanceKm: number
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
}
