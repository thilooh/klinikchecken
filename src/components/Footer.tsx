import { clinics } from '../data/clinics'
import { citySlug } from '../lib/slug'

const ALL_CITIES = Array.from(new Set(clinics.map(c => c.city))).sort()
const TOP_CITIES = [
  'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt',
  'Düsseldorf', 'Stuttgart', 'Dortmund', 'Essen', 'Leipzig',
  'Bremen', 'Hannover', 'Nürnberg', 'Mannheim',
].filter(c => ALL_CITIES.includes(c))

export default function Footer() {
  const cols = [
    {
      title: 'Über Besenreiser-Check.de',
      text: 'Das Vergleichsportal für Besenreiser-Behandlungen in Deutschland - handverlesene Praxen, echte Bewertungen.',
      links: [
        { label: 'Über uns', href: '/ueber-uns' },
        { label: 'Ratgeber', href: '/ratgeber' },
        { label: 'Methode-Check', href: '/methoden-quiz' },
      ],
    },
    {
      title: 'Methoden',
      links: [
        { label: 'Verödung (Sklerotherapie)', href: '/methode/verodung' },
        { label: 'Laser (Nd:YAG / KTP)',      href: '/methode/laser' },
        { label: 'IPL-Behandlung',            href: '/methode/ipl' },
      ],
    },
    {
      title: 'Top-Städte',
      links: TOP_CITIES.map(c => ({ label: c, href: `/besenreiser/${citySlug(c)}` })),
    },
    {
      title: 'Rechtliches',
      links: [
        { label: 'Datenschutz', href: '/datenschutz' },
        { label: 'Impressum',   href: '/impressum' },
        { label: 'AGB',         href: '/agb' },
      ],
    },
  ]

  return (
    <footer style={{ backgroundColor: '#003399', color: '#fff', padding: '36px 0 0' }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '12px', color: '#fff' }}>{col.title}</div>
              {col.text && (
                <p style={{ fontSize: '12px', color: '#99BBFF', lineHeight: '1.6', marginBottom: '10px' }}>{col.text}</p>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map(link => (
                  <li key={link.label} style={{ marginBottom: '6px' }}>
                    <a
                      href={link.href}
                      style={{ color: '#99BBFF', fontSize: '12px', textDecoration: 'none' }}
                      onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                      onMouseLeave={e => (e.target as HTMLElement).style.color = '#99BBFF'}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* All cities - discoverable + crawlable */}
        <details style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '14px 0' }}>
          <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#99BBFF', listStyle: 'none' }}>
            Alle {ALL_CITIES.length} Städte ▾
          </summary>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginTop: '12px' }}>
            {ALL_CITIES.map(c => (
              <a key={c} href={`/besenreiser/${citySlug(c)}`} style={{ color: '#99BBFF', fontSize: '12px', textDecoration: 'none' }}>{c}</a>
            ))}
          </div>
        </details>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '16px 0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
          {['🔒 SSL-gesichert', '✓ 100% kostenloser Service', '✓ Handverlesene Praxen'].map(badge => (
            <span key={badge} style={{ fontSize: '12px', color: '#99BBFF' }}>{badge}</span>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '14px 0', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#7799DD' }}>
            © 2026 Besenreiser-Check.de · Kein medizinischer Rat · Made in Germany 🇩🇪
          </span>
        </div>
      </div>
    </footer>
  )
}
