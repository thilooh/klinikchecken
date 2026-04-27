import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, MapPin, Star } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useClinics } from '../hooks/useClinics'
import { ALL_CITIES as ALL_CITIES_RAW } from '../data/clinics-meta'
import { clinicSlug, citySlug } from '../lib/slug'
import { useSeo, SITE_URL } from '../lib/seo'

const ALL_CITIES = [...ALL_CITIES_RAW].sort()

export default function CityPage() {
  const { clinics, loading } = useClinics()
  const { city: citySlugParam = '' } = useParams<{ city: string }>()

  const city = useMemo(
    () => ALL_CITIES.find(c => citySlug(c) === citySlugParam.toLowerCase()),
    [citySlugParam],
  )

  const cityClinics = useMemo(
    () => city ? clinics.filter(c => c.city === city)
      .sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1
        const sA = a.googleRating && a.googleReviewCount ? a.googleRating * Math.log(a.googleReviewCount) : 0
        const sB = b.googleRating && b.googleReviewCount ? b.googleRating * Math.log(b.googleReviewCount) : 0
        return sB - sA
      }) : [],
    [city, clinics],
  )

  useSeo({
    title: city
      ? `Besenreiser entfernen ${city} – ${cityClinics.length} geprüfte Praxen 2026 | Besenreiser-Check.de`
      : 'Stadt nicht gefunden | Besenreiser-Check.de',
    description: city
      ? `${cityClinics.length} geprüfte Phlebologen, Dermatologen und Venenzentren in ${city}. Echte Patientenbewertungen, Methodenvergleich, kostenlose Anfrage.`
      : undefined,
    canonical: city ? `${SITE_URL}/besenreiser/${citySlug(city)}` : undefined,
    ogType: 'website',
    jsonLd: city ? {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': `Besenreiser-Praxen in ${city}`,
      'numberOfItems': cityClinics.length,
      'itemListElement': cityClinics.slice(0, 20).map((c, i) => ({
        '@type': 'ListItem',
        'position': i + 1,
        'url': `${SITE_URL}/praxis/${clinicSlug(c)}`,
        'name': c.name,
      })),
    } : undefined,
  })

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '60px 20px', textAlign: 'center', color: '#888' }}>Lade Praxen…</main>
        <Footer />
      </div>
    )
  }

  if (!city) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: '#003399', marginBottom: '12px' }}>Stadt nicht gefunden</h1>
          <p style={{ color: '#555', marginBottom: '20px' }}>Wir haben aktuell keine Praxen für diese Stadt.</p>
          <Link to="/" style={{ color: '#0052CC', textDecoration: 'underline' }}>Zur Praxis-Suche</Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '20px 0 40px' }}>
        <div className="max-w-[1000px] mx-auto px-4">
          <nav style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            <Link to="/" style={{ color: '#0052CC' }}>Start</Link>
            <span style={{ margin: '0 6px' }}>›</span>
            <span style={{ color: '#333' }}>Besenreiser {city}</span>
          </nav>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0A1F44', marginBottom: '8px', lineHeight: 1.2 }}>
            Besenreiser entfernen in {city}
          </h1>
          <p style={{ fontSize: '15px', color: '#555', marginBottom: '24px', lineHeight: 1.6 }}>
            {cityClinics.length} geprüfte Phlebologen, Dermatologen und Venenzentren in {city} -
            sortiert nach Patientenbewertungen und Behandlungsvolumen.
          </p>

          {/* Top clinics list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {cityClinics.map((c, idx) => (
              <Link key={c.id} to={`/praxis/${clinicSlug(c)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  backgroundColor: '#fff', borderRadius: '8px', padding: '16px 20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', gap: '16px',
                  alignItems: 'center', cursor: 'pointer', transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)')}>
                  <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '50%', backgroundColor: '#003399', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{idx + 1}</div>
                  {c.media?.logo && (
                    <div style={{ width: '60px', height: '60px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', backgroundColor: '#F8F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={c.media.logo} alt="" loading="lazy" decoding="async" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: '#0A1F44', marginBottom: '4px' }}>{c.name}</div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {c.address}
                    </div>
                    {c.googleRating && c.googleReviewCount ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#444' }}>
                        <Star size={12} fill="#FFB400" color="#FFB400" /> <strong>{c.googleRating.toFixed(1)}</strong> ({c.googleReviewCount} Bewertungen)
                      </div>
                    ) : null}
                  </div>
                  <ChevronRight size={20} color="#0052CC" style={{ flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>

          {/* SEO content */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>
              Welche Methoden gibt es zur Besenreiser-Behandlung in {city}?
            </h2>
            <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7, marginBottom: '14px' }}>
              In {city} bieten Phlebologen und Dermatologen typischerweise drei Hauptmethoden zur
              Behandlung von Besenreisern an: <strong>Verödung (Sklerotherapie)</strong>,
              <strong> Laser-Therapie</strong> (häufig Nd:YAG) und <strong>IPL-Behandlung</strong>.
              Die richtige Methode hängt von Größe, Tiefe und Anzahl der betroffenen Gefäße ab.
              Erfahrene Phlebologen kombinieren oft mehrere Verfahren.
            </p>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginTop: '20px', marginBottom: '12px' }}>
              Was kostet die Besenreiser-Entfernung in {city}?
            </h2>
            <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7 }}>
              Die Behandlungskosten variieren nach Methode und Aufwand pro Sitzung. Verödungen sind
              typischerweise günstiger als Laser-Behandlungen. Da Besenreiser meist als kosmetisch
              eingestuft werden, übernimmt die gesetzliche Krankenkasse die Kosten in der Regel
              nicht. Frag bei deiner Wunsch-Praxis vorab den genauen Preis ab - das geht
              kostenlos über unser Anfrage-Formular.
            </p>
          </div>

          <Link to="/" style={{ display: 'inline-block', backgroundColor: '#003399', color: '#fff', fontWeight: 700, padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' }}>
            Alle Praxen in der bundesweiten Übersicht
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
