import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Seite nicht gefunden | Besenreiser-Check.de'
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow')
    return () => {
      document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index, follow')
    }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px' }}>
          <div style={{ fontSize: '64px', fontWeight: 800, color: '#003399', lineHeight: 1, marginBottom: '12px' }}>404</div>
          <h1 style={{ fontSize: '22px', color: '#0A1F44', marginBottom: '12px' }}>Diese Seite gibt es nicht (mehr).</h1>
          <p style={{ color: '#555', marginBottom: '24px', lineHeight: 1.6 }}>
            Vielleicht wurde der Link falsch eingegeben oder die Seite ist umgezogen. Such am besten neu nach einer Praxis in deiner Stadt.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" style={{ display: 'inline-block', backgroundColor: '#FF6600', color: '#fff', fontWeight: 700, padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '15px' }}>
              Zur Startseite
            </Link>
            <Link to="/ratgeber" style={{ display: 'inline-block', backgroundColor: '#fff', color: '#003399', fontWeight: 600, padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontSize: '15px', border: '1px solid #003399' }}>
              Zum Ratgeber
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
