import { useState } from 'react'
import { Menu, X, ShieldCheck } from 'lucide-react'

const navItems = ['Besenreiser', 'Krampfadern', 'Botox', 'Filler', 'Laser']

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: '#002B5C', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="relative z-50">
      <div className="max-w-[1200px] mx-auto px-4" style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#0052CC', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={18} color="#fff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em' }}>aesthetiq.de</span>
            <span style={{ color: '#7A9CC8', fontSize: '11px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Geprüfte Schönheitsmedizin</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <a key={item} href="#"
              style={{ color: item === 'Besenreiser' ? '#5B9BFF' : 'rgba(255,255,255,0.75)', fontSize: '14px', textDecoration: 'none', fontWeight: item === 'Besenreiser' ? 600 : 400, borderBottom: item === 'Besenreiser' ? '2px solid #5B9BFF' : '2px solid transparent', paddingBottom: '2px' }}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)', backgroundColor: 'transparent', fontSize: '13px', padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
            Klinik eintragen
          </button>
          <a href="#" style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', textDecoration: 'none' }}>Login</a>
        </div>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div style={{ backgroundColor: '#002050', position: 'absolute', top: '56px', left: 0, right: 0, zIndex: 100 }} className="md:hidden">
          {navItems.map(item => (
            <a key={item} href="#" style={{ display: 'block', color: '#fff', padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '16px', textDecoration: 'none' }}>
              {item}
            </a>
          ))}
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'none' }}>Klinik eintragen</a>
          </div>
        </div>
      )}
    </nav>
  )
}
