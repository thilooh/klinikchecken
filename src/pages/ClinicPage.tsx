import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, MapPin, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import InquiryModal from '../components/InquiryModal'
const GoogleReviewsModal = lazy(() => import('../components/GoogleReviewsModal'))
import { useClinics } from '../hooks/useClinics'
import { clinicIdFromSlug, citySlug } from '../lib/slug'
import { useSeo, SITE_URL } from '../lib/seo'
import { sendEvent } from '../lib/gtm'
import { generateEventId, sendCapi } from '../lib/capi'
import { getCTAVariant } from '../lib/ctaVariant'
import type { Clinic } from '../types/clinic'

export default function ClinicPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { clinics, loading } = useClinics()
  const id = clinicIdFromSlug(slug)
  const clinic = id != null ? clinics.find(c => c.id === id) : undefined

  // Always called - useSeo never throws when given placeholder strings.
  useSeo({
    title: clinic
      ? `${clinic.name} – Besenreiser-Behandlung in ${clinic.city} | Besenreiser-Check.de`
      : 'Praxis nicht gefunden | Besenreiser-Check.de',
    description: clinic
      ? `${clinic.name}, ${clinic.address}. ${clinic.googleRating && clinic.googleReviewCount ? `${clinic.googleRating.toFixed(1)}★ (${clinic.googleReviewCount} Google-Bewertungen). ` : ''}Methoden: ${clinic.methods.length ? clinic.methods.join(', ') : 'auf Anfrage'}. Kostenlos anfragen.`
      : undefined,
    canonical: clinic ? `${SITE_URL}/praxis/${slug}` : undefined,
    ogImage: clinic?.media?.logo ? `${SITE_URL}${clinic.media.logo}` : undefined,
    ogType: 'article',
    jsonLd: clinic ? {
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      'name': clinic.name,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': clinic.address,
        'addressLocality': clinic.city,
        'addressCountry': 'DE',
      },
      ...(clinic.lat != null && clinic.lng != null ? {
        'geo': { '@type': 'GeoCoordinates', 'latitude': clinic.lat, 'longitude': clinic.lng },
      } : {}),
      ...(clinic.googleRating && clinic.googleReviewCount ? {
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': clinic.googleRating,
          'reviewCount': clinic.googleReviewCount,
        },
      } : {}),
      'medicalSpecialty': 'Phlebology',
      'availableService': clinic.methods.map(m => ({
        '@type': 'MedicalProcedure',
        'name': m,
      })),
    } : undefined,
  })

  const [showInquiry, setShowInquiry] = useState(false)
  const [showReviews, setShowReviews] = useState(false)

  // Direct landing on /praxis/:slug should fire ViewContent for SEO
  // attribution - same event the home-page card opens fire from
  // ClinicCard.openProfile(). Skip if clinic isn't found yet.
  useEffect(() => {
    if (!clinic) return
    sendEvent('ViewContent', {
      content_type: 'clinic',
      content_name: clinic.name,
      content_category: clinic.city,
      item_name: clinic.name,
      item_category: clinic.city,
    })
  }, [clinic])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '60px 20px', textAlign: 'center', color: '#888' }}>Lade Praxis…</main>
        <Footer />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', color: '#003399', marginBottom: '12px' }}>Praxis nicht gefunden</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>Diese Praxis-Seite existiert nicht (mehr).</p>
            <Link to="/" style={{ color: '#0052CC', textDecoration: 'underline' }}>Zurück zur Startseite</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const onInquire = (c: Clinic) => {
    const eventId = generateEventId()
    const data = { content_name: c.name, content_category: c.city, item_name: c.name, item_category: c.city, value: 1, currency: 'EUR', cta_variant: getCTAVariant() }
    sendEvent('InitiateCheckout', data, undefined, eventId)
    sendCapi('InitiateCheckout', eventId, data)
    setShowInquiry(true)
  }

  const openReviews = () => {
    if (clinic.placeId) setShowReviews(true)
    else window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '20px 0 40px' }}>
        <div className="max-w-[1000px] mx-auto px-4">
          {/* Breadcrumb */}
          <nav style={{ fontSize: '13px', color: '#666', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link to="/" style={{ color: '#0052CC' }}>Start</Link>
            <span>›</span>
            <Link to={`/besenreiser/${citySlug(clinic.city)}`} style={{ color: '#0052CC' }}>Besenreiser {clinic.city}</Link>
            <span>›</span>
            <span style={{ color: '#333' }}>{clinic.name}</span>
          </nav>

          <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#0052CC', fontSize: '13px', cursor: 'pointer', padding: 0, marginBottom: '12px' }}>
            <ChevronLeft size={14} /> zurück
          </button>

          {/* Header card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {clinic.media?.logo && (
                <div style={{ width: '120px', height: '120px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={clinic.media.logo} alt={`${clinic.name} Logo`} width={120} height={120} loading="eager" decoding="async" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: '260px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0A1F44', marginBottom: '6px', lineHeight: 1.2 }}>{clinic.name}</h1>
                <p style={{ fontSize: '15px', color: '#555', marginBottom: '12px' }}>
                  {clinic.doctor} · {clinic.qualification}
                </p>

                {clinic.googleRating && clinic.googleReviewCount ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#FFF8E1', padding: '4px 10px', borderRadius: '4px', fontSize: '14px', fontWeight: 700 }}>
                      <Star size={14} fill="#FFB400" color="#FFB400" /> {clinic.googleRating.toFixed(1)}
                    </span>
                    <button onClick={openReviews} style={{ background: 'none', border: 'none', color: '#003399', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                      {clinic.googleReviewCount} Google-Bewertungen lesen
                    </button>
                  </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#444', fontSize: '14px', marginBottom: '6px' }}>
                  <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> {clinic.address}
                </div>
                {clinic.openHours && (
                  <div style={{ color: '#444', fontSize: '14px', marginBottom: '12px' }}>
                    <strong>Öffnungszeiten:</strong> {clinic.openHours}
                  </div>
                )}

                <button onClick={() => onInquire(clinic)} style={{
                  backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '16px',
                  border: 'none', borderRadius: '6px', padding: '13px 28px', cursor: 'pointer',
                }}>
                  Kostenlos anfragen
                </button>
              </div>
            </div>
          </div>

          {/* USPs */}
          {clinic.usp && clinic.usp.length > 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>Highlights</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {clinic.usp.map((u, i) => (
                  <li key={i} style={{ padding: '6px 0', fontSize: '15px', color: '#333', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#00A651', fontWeight: 700 }}>✓</span>{u}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Methods */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>Behandlungsmethoden</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {clinic.methods.map((m, i) => (
                <span key={i} style={{ backgroundColor: '#EEF4FF', color: '#003399', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>{m}</span>
              ))}
            </div>
            {clinic.treatmentInfo?.intro && (
              <p style={{ marginTop: '14px', fontSize: '15px', color: '#444', lineHeight: 1.6 }}>{clinic.treatmentInfo.intro}</p>
            )}
            {clinic.treatmentInfo?.methodDetails && clinic.treatmentInfo.methodDetails.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                {clinic.treatmentInfo.methodDetails.map((md, i) => (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0A1F44', marginBottom: '4px' }}>{md.method}</h3>
                    <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.6, margin: 0 }}>{md.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick info grid */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>Auf einen Blick</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {[
                { label: 'Kostenlose Erstberatung', val: clinic.freeConsultation },
                { label: 'Online-Terminbuchung',   val: clinic.onlineBooking },
                { label: 'Abendtermine',           val: clinic.eveningAppointments },
                { label: 'Kassenpatienten',        val: clinic.kassenpatient },
                { label: 'Ratenzahlung',           val: clinic.ratenzahlung },
                { label: 'Parkmöglichkeit',        val: clinic.parking },
                { label: 'Zertifiziert',           val: clinic.certified },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: val ? '#222' : '#999' }}>
                  <span style={{ color: val ? '#00A651' : '#CC0000' }}>{val ? '✓' : '✕'}</span>{label}
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div style={{ backgroundColor: '#003399', color: '#fff', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Direkt mit {clinic.name} Kontakt aufnehmen</h2>
            <p style={{ fontSize: '14px', opacity: 0.85, marginBottom: '16px' }}>Beschreib kurz dein Anliegen - die Praxis meldet sich für die Terminabsprache.</p>
            <button onClick={() => onInquire(clinic)} style={{
              backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, fontSize: '16px',
              border: 'none', borderRadius: '6px', padding: '13px 32px', cursor: 'pointer',
            }}>
              Kostenlos anfragen →
            </button>
          </div>

          {/* HWG-Disclaimer */}
          <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: '#fff', border: '1px solid #DDD', borderRadius: '6px', fontSize: '12px', color: '#666', lineHeight: 1.6 }}>
            <strong>Hinweis:</strong> Die hier dargestellten Praxis- und Methodeninformationen dienen der Orientierung und ersetzen keine ärztliche Beratung. Wirksamkeit, Risiken und Eignung einer Behandlung müssen im Einzelfall vom behandelnden Arzt beurteilt werden. Bewertungen stammen von Google und spiegeln subjektive Patientenerfahrungen wider.
          </div>
        </div>
      </main>
      <Footer />

      <InquiryModal clinic={showInquiry ? clinic : null} onClose={() => setShowInquiry(false)} />
      {showReviews && (
        <Suspense fallback={null}>
          <GoogleReviewsModal clinic={clinic} onClose={() => setShowReviews(false)} />
        </Suspense>
      )}
    </div>
  )
}
