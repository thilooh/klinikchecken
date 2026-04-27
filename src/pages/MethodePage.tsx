import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Star, Check, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useClinics } from '../hooks/useClinics'
import { clinicSlug } from '../lib/slug'
import { useSeo, SITE_URL } from '../lib/seo'

// Drafted content for each method. Expandable - copy a block, fill in.
type MethodInfo = {
  slug: string
  name: string
  shortDescription: string
  intro: string
  pros: string[]
  cons: string[]
  bestFor: string
  duration: string
  sessions: string
  matchKeywords: string[]   // used to filter relevant clinics
}

const METHODS: MethodInfo[] = [
  {
    slug: 'verodung',
    name: 'Verödung (Sklerotherapie)',
    shortDescription: 'Bewährtes Standardverfahren - kleine Adern werden mit einem Verödungsmittel zum Verschluss gebracht.',
    intro: 'Die Sklerotherapie ist seit Jahrzehnten der Goldstandard bei der Besenreiser-Behandlung. Ein flüssiges oder schaumartiges Verödungsmittel wird in die betroffene Vene injiziert. Diese reizt die Gefäßwand, woraufhin sich das Gefäß verschließt und vom Körper abgebaut wird.',
    pros: [
      'Seit Langem bewährt - sehr gut erforscht',
      'Auch für tiefer liegende Gefäße geeignet',
      'Keine Hautverbrennungen wie bei Laser möglich',
      'Meist günstiger als Laser-Behandlungen',
    ],
    cons: [
      'Mehrere Sitzungen nötig',
      'Kompressionsstrümpfe für 1-2 Wochen nach Behandlung',
      'Selten: kleine Pigmentflecken oder Narben',
    ],
    bestFor: 'Mittelgroße bis größere Besenreiser und retikuläre Venen, vor allem an den Beinen.',
    duration: '15-30 Minuten pro Sitzung',
    sessions: '3-6 Sitzungen, je nach Befund',
    matchKeywords: ['verödung', 'sklerotherapie', 'sklerosierung'],
  },
  {
    slug: 'laser',
    name: 'Laser (Nd:YAG / KTP)',
    shortDescription: 'Lichtenergie zerstört gezielt Besenreiser ohne Nadel - ideal für sehr feine, oberflächliche Gefäße.',
    intro: 'Bei der Laser-Behandlung werden die Besenreiser durch gebündeltes Licht erhitzt und verschlossen. Der Nd:YAG-Laser dringt tiefer und ist gut für dunklere Hauttypen geeignet, der KTP-Laser eignet sich für sehr feine oberflächliche Gefäße im Gesicht.',
    pros: [
      'Keine Injektion - keine Nadel',
      'Sehr präzise auch bei feinen Gefäßen im Gesicht',
      'Keine Kompressionsstrümpfe nötig',
      'Schnelle Sitzungen',
    ],
    cons: [
      'Mehr Sitzungen als bei Verödung',
      'Bei dunkler Haut: Risiko von Pigmentveränderungen',
      'Teurer pro Sitzung',
      'Leichte Schmerzen / Kribbeln während der Behandlung',
    ],
    bestFor: 'Sehr feine, oberflächliche Besenreiser, vor allem im Gesicht und an den Wangen.',
    duration: '15-30 Minuten pro Sitzung',
    sessions: '3-5 Sitzungen, je nach Befund',
    matchKeywords: ['nd:yag', 'ktp', 'laser'],
  },
  {
    slug: 'ipl',
    name: 'IPL-Behandlung',
    shortDescription: 'Intensives gepulstes Licht - gute Wahl für rote, feine Gefäße im Gesicht.',
    intro: 'IPL nutzt ein breites Lichtspektrum. Es wird vor allem für rote, oberflächliche Besenreiser im Gesicht eingesetzt. Im Vergleich zum Laser ist es weniger gezielt, dafür aber günstiger.',
    pros: [
      'Sanfte Methode, geringe Schmerzen',
      'Auch für größere Hautareale geeignet',
      'Verbessert oft gleichzeitig den Hautteint',
    ],
    cons: [
      'Weniger effektiv bei tiefen oder größeren Gefäßen',
      'Mehrere Sitzungen erforderlich',
      'Sonneneinstrahlung muss vor und nach der Behandlung gemieden werden',
    ],
    bestFor: 'Feine Besenreiser im Gesicht, oft kombiniert mit Hautverjüngungs-Behandlungen.',
    duration: '20-40 Minuten pro Sitzung',
    sessions: '3-6 Sitzungen',
    matchKeywords: ['ipl'],
  },
]

export default function MethodePage() {
  const { clinics } = useClinics()
  const { method: methodSlug = '' } = useParams<{ method: string }>()
  const method = METHODS.find(m => m.slug === methodSlug.toLowerCase())

  const offering = useMemo(() => {
    if (!method) return []
    return clinics.filter(c =>
      c.methods.some(cm => method.matchKeywords.some(kw => cm.toLowerCase().includes(kw))),
    ).slice(0, 12)
  }, [method, clinics])

  useSeo({
    title: method
      ? `${method.name} bei Besenreisern – Methode, Kosten & Spezialisten | Besenreiser-Check.de`
      : 'Methode nicht gefunden | Besenreiser-Check.de',
    description: method?.shortDescription,
    canonical: method ? `${SITE_URL}/methode/${method.slug}` : undefined,
    ogType: 'article',
    jsonLd: method ? {
      '@context': 'https://schema.org',
      '@type': 'MedicalProcedure',
      'name': method.name,
      'description': method.intro,
      'bodyLocation': 'Beine, Gesicht',
      'preparation': 'Erstberatung mit Phlebologen, individuelle Indikationsprüfung',
    } : undefined,
  })

  if (!method) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1, padding: '60px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: '#003399' }}>Methode nicht gefunden</h1>
          <p><Link to="/" style={{ color: '#0052CC', textDecoration: 'underline' }}>Zur Startseite</Link></p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '20px 0 40px' }}>
        <div className="max-w-[800px] mx-auto px-4">
          <nav style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            <Link to="/" style={{ color: '#0052CC' }}>Start</Link>
            <span style={{ margin: '0 6px' }}>›</span>
            <span style={{ color: '#333' }}>{method.name}</span>
          </nav>

          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0A1F44', marginBottom: '8px', lineHeight: 1.2 }}>
            {method.name} bei Besenreisern
          </h1>
          <p style={{ fontSize: '17px', color: '#444', lineHeight: 1.5, marginBottom: '24px', fontStyle: 'italic' }}>
            {method.shortDescription}
          </p>

          {/* Intro */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>So funktioniert {method.name}</h2>
            <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7 }}>{method.intro}</p>
          </div>

          {/* Quick facts */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>Auf einen Blick</h2>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', margin: 0 }}>
              <dt style={{ fontWeight: 700, color: '#666' }}>Geeignet für</dt>
              <dd style={{ margin: 0 }}>{method.bestFor}</dd>
              <dt style={{ fontWeight: 700, color: '#666' }}>Dauer</dt>
              <dd style={{ margin: 0 }}>{method.duration}</dd>
              <dt style={{ fontWeight: 700, color: '#666' }}>Sitzungen</dt>
              <dd style={{ margin: 0 }}>{method.sessions}</dd>
            </dl>
          </div>

          {/* Pros / Cons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0A7C4A', marginBottom: '12px' }}>Vorteile</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {method.pros.map((p, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', padding: '5px 0', fontSize: '14px' }}>
                    <Check size={16} color="#0A7C4A" style={{ flexShrink: 0, marginTop: '2px' }} /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#B5305A', marginBottom: '12px' }}>Nachteile</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {method.cons.map((c, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', padding: '5px 0', fontSize: '14px' }}>
                    <X size={16} color="#B5305A" style={{ flexShrink: 0, marginTop: '2px' }} /> {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Clinics offering this method */}
          {offering.length > 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px 24px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0A1F44', marginBottom: '12px' }}>
                Praxen die {method.name} anbieten
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {offering.map(c => (
                  <Link key={c.id} to={`/praxis/${clinicSlug(c)}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', backgroundColor: '#F8F9FC', textDecoration: 'none', color: '#222' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{c.city}</div>
                    </div>
                    {c.googleRating && c.googleReviewCount ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Star size={12} fill="#FFB400" color="#FFB400" /> {c.googleRating.toFixed(1)}
                      </div>
                    ) : null}
                    <ChevronRight size={18} color="#0052CC" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div style={{ backgroundColor: '#003399', color: '#fff', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Welche Praxis passt zu mir?</h2>
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>Vergleiche Bewertungen, Fachärzte und Kosten in unserer Übersicht.</p>
            <Link to="/" style={{ display: 'inline-block', backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, padding: '13px 28px', borderRadius: '6px', textDecoration: 'none' }}>
              Praxis in meiner Stadt finden →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
