import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  const navLinks = [
    { label: 'Besenreiser', to: '/' },
    { label: 'Über uns', to: '/ueber-uns' },
  ]

  return (
    <nav style={{ backgroundColor: '#002B5C', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="relative z-50">
      <div className="max-w-[1200px] mx-auto px-4" style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg viewBox="0 0 92 92" width="34" height="34" style={{ flexShrink: 0 }} aria-hidden="true">
            {/* magnifying glass circle */}
            <circle cx="40" cy="40" r="28" fill="none" stroke="white" strokeWidth="7.5" />
            {/* subtle lens highlight */}
            <ellipse cx="30" cy="29" rx="9" ry="6" fill="rgba(255,255,255,0.18)" transform="rotate(-35 30 29)" />
            {/* handle */}
            <line x1="61" y1="61" x2="83" y2="83" stroke="white" strokeWidth="8.5" strokeLinecap="round" />
            {/* checkmark */}
            <polyline points="23,40 36,55 59,27" fill="none" stroke="white" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em' }}>besenreiser-check.de</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ label, to }) => {
            const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <Link key={to} to={to}
                style={{ color: active ? '#5B9BFF' : 'rgba(255,255,255,0.75)', fontSize: '14px', textDecoration: 'none', fontWeight: active ? 600 : 400, borderBottom: active ? '2px solid #5B9BFF' : '2px solid transparent', paddingBottom: '2px' }}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', backgroundColor: 'transparent', fontSize: '13px', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
            Klinik eintragen
          </button>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ backgroundColor: '#002050', position: 'absolute', top: '56px', left: 0, right: 0, zIndex: 100 }} className="md:hidden">
          {navLinks.map(({ label, to }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{ display: 'block', color: '#fff', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '16px', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none' }}>Klinik eintragen</a>
          </div>
        </div>
      )}
    </nav>
  )
}
