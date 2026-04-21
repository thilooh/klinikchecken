import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = ['Besenreiser', 'Krampfadern', 'Botox', 'Filler', 'Laser']

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: '#003399', height: '52px' }} className="relative z-50">
      <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex flex-col leading-tight">
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>aesthetiq.de</span>
          <span style={{ color: '#99BBFF', fontSize: '10px' }}>Schönheitsbehandlungen vergleichen</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <a
              key={item}
              href="#"
              style={{ color: item === 'Besenreiser' ? '#FF6600' : '#fff', fontSize: '13px', textDecoration: 'none', borderBottom: item === 'Besenreiser' ? '2px solid #FF6600' : '2px solid transparent', paddingBottom: '2px' }}
              className="hover:border-orange-500 transition-colors"
              onMouseEnter={e => { if (item !== 'Besenreiser') (e.target as HTMLElement).style.borderBottomColor = '#FF6600' }}
              onMouseLeave={e => { if (item !== 'Besenreiser') (e.target as HTMLElement).style.borderBottomColor = 'transparent' }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            style={{ border: '1px solid #fff', color: '#fff', backgroundColor: 'transparent', fontSize: '12px', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            Klinik eintragen
          </button>
          <a href="#" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none' }}>Login</a>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ backgroundColor: '#002277', position: 'absolute', top: '52px', left: 0, right: 0, zIndex: 100 }} className="md:hidden">
          {navItems.map(item => (
            <a key={item} href="#" style={{ display: 'block', color: '#fff', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', textDecoration: 'none' }}>
              {item}
            </a>
          ))}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <a href="#" style={{ color: '#fff', fontSize: '13px', textDecoration: 'none' }}>Klinik eintragen</a>
          </div>
        </div>
      )}
    </nav>
  )
}
