import { useState } from 'react'
import { Menu, X, ShieldCheck } from 'lucide-react'

const navItems = ['Besenreiser', 'Krampfadern', 'Botox', 'Filler', 'Laser']

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: '#002B5C', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="relative z-50">
      <div className="max-w-[1200px] mx-auto px-4" style={{ height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: '#0052CC', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={17} color="#fff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>aesthetiq.de</span>
            <span style={{ color: '#7A9CC8', fontSize: '9px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Geprüfte Schönheitsmedizin</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <a key={item} href="#"
              style={{ color: item === 'Besenreiser' ? '#5B9BFF' : 'rgba(255,255,255,0.75)', fontSize: '13px', textDecoration: 'none', fontWeight: item === 'Besenreiser' ? 600 : 400, borderBottom: item === 'Besenreiser' ? '2px solid #5B9BFF' : '2px solid transparent', paddingBottom: '2px' }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center gap-3">
          <button style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', backgroundColor: 'transparent', fontSize: '12px', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
            Klinik eintragen
          </button>
          <a href="#" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', textDecoration: 'none' }}>Login</a>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ backgroundColor: '#002050', position: 'absolute', top: '54px', left: 0, right: 0, zIndex: 100 }} className="md:hidden">
          {navItems.map(item => (
            <a key={item} href="#" style={{ display: 'block', color: '#fff', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '14px', textDecoration: 'none' }}>
              {item}
            </a>
          ))}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', textDecoration: 'none' }}>Klinik eintragen</a>
          </div>
        </div>
      )}
    </nav>
  )
}
