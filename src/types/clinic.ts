export interface Clinic {
  id: number
  name: string
  address: string
  district: string
  distanceKm: number
  doctor: string
  qualification: string
  rating: number
  reviewCount: number
  methods: string[]
  priceFrom: number
  packagePrice?: number
  openToday: boolean
  openHours: string
  freeConsultation: boolean
  onlineBooking: boolean
  eveningAppointments: boolean
  kassenpatient: boolean
  parking: boolean
  certified: boolean
  photoCount: number
  lastInquiry: string
  featured: boolean
  tags: string[]
}

export interface FilterState {
  selectedMethods: string[]
  priceRange: [number, number]
  minRating: number
  maxDistance: number
  extras: {
    freeConsultation: boolean
    onlineBooking: boolean
    evening: boolean
    kassenpatient: boolean
    parking: boolean
    certified: boolean
  }
  sortBy: 'recommended' | 'price' | 'rating' | 'distance'
  searchCity: string
}
