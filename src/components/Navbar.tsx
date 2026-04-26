import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'


export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  const navLinks = [
    { label: 'Besenreiser', to: '/' },
    { label: 'Ratgeber', to: '/ratgeber' },
    { label: 'Über uns', to: '/ueber-uns' },
  ]

  return (
    <nav style={{ backgroundColor: '#002B5C', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="relative z-50">
      <div className="max-w-[1200px] mx-auto px-4" style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/besenreiser-check-logo5.png" alt="Besenreiser-Check.de" style={{ height: '36px', width: 'auto' }} />
        </Link>

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
        </div>
      )}
    </nav>
  )
}
