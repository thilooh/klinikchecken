export default function Footer() {
  const cols = [
    {
      title: 'Über Besenreiser-Check.de',
      text: 'Das Vergleichsportal für Besenreiser-Behandlungen in Deutschland - handverlesene Praxen, echte Bewertungen.',
      links: [
        { label: 'Über uns', href: '/ueber-uns' },
        { label: 'Kontakt', href: '#' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { label: 'Datenschutz', href: '/datenschutz' },
        { label: 'Impressum', href: '/impressum' },
        { label: 'AGB', href: '/agb' },
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

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '16px 0', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
          {['🔒 SSL-gesichert', '✓ 100% kostenloser Service', '✓ Handverlesene Praxen'].map(badge => (
            <span key={badge} style={{ fontSize: '12px', color: '#99BBFF' }}>{badge}</span>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '14px 0', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#7799DD' }}>
            © 2025 Besenreiser-Check.de · Kein medizinischer Rat · Made in Germany 🇩🇪
          </span>
        </div>
      </div>
    </footer>
  )
}
