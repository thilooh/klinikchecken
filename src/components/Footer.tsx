export default function Footer() {
  const cols = [
    {
      title: 'Über aesthetiq.de',
      links: [
        { label: 'Über uns', href: '#' },
        { label: 'Presse', href: '#' },
        { label: 'Jobs', href: '#' },
        { label: 'Kontakt', href: '#' },
      ],
      text: 'Das führende Vergleichsportal für ästhetische Medizin in Deutschland.',
    },
    {
      title: 'Für Kliniken',
      links: [
        { label: 'Klinik eintragen', href: '#' },
        { label: 'Preise & Pakete', href: '#' },
        { label: 'Partner werden', href: '#' },
        { label: 'Klinik-Login', href: '#' },
      ],
    },
    {
      title: 'Behandlungen',
      links: [
        { label: 'Besenreiser', href: '#' },
        { label: 'Krampfadern', href: '#' },
        { label: 'Botox', href: '#' },
        { label: 'Filler', href: '#' },
        { label: 'Laser', href: '#' },
        { label: 'Hyaluron', href: '#' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { label: 'Datenschutz', href: '/datenschutz' },
        { label: 'Impressum', href: '/impressum' },
        { label: 'AGB', href: '/agb' },
        { label: 'Cookie-Einstellungen', href: '#' },
        { label: 'Barrierefreiheit', href: '#' },
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

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '16px 0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'center', marginBottom: '0' }}>
          {['🔒 SSL-gesichert', '✓ TÜV-geprüfte Kliniken', '✓ 100% kostenloser Service', '⭐ 50.000+ Anfragen'].map(badge => (
            <span key={badge} style={{ fontSize: '12px', color: '#99BBFF' }}>{badge}</span>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '14px 0', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#7799DD' }}>
            © 2025 aesthetiq.de · Alle Preise inkl. MwSt. · Nicht-medizinische Beratung · Made in Germany 🇩🇪
          </span>
        </div>
      </div>
    </footer>
  )
}
