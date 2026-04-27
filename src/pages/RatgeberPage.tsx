import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
const serif = "Georgia, 'Times New Roman', serif"

interface ArticleCard {
  title: string
  description: string
  href?: string
  date?: string
  readTime?: string
  live: boolean
}

const ARTICLES: ArticleCard[] = [
  {
    title: 'Eine Praxis für Besenreiser wählen: Worauf es wirklich ankommt',
    description:
      'Die Wahl der richtigen Praxis entscheidet mehr über das Ergebnis als die Wahl der Behandlungsmethode. Die fünf Kriterien, auf die es ankommt.',
    href: '/ratgeber/praxis-waehlen',
    date: '8. März 2026',
    readTime: '6 Min',
    live: true,
  },
  {
    title: 'Verödung oder Laser? Methoden im Vergleich',
    description:
      'Sklerotherapie, Mikroschaum-Verödung, Nd:YAG-Laser - was hinter den Begriffen steckt und wann welche Methode geeignet ist.',
    live: false,
  },
  {
    title: 'Was eine Besenreiser-Behandlung kostet',
    description:
      'Preise variieren stark je nach Praxis, Region und Methode. Was du realistisch einplanen solltest - und woran du überhöhte Angebote erkennst.',
    live: false,
  },
  {
    title: 'Besenreiser oder Krampfader? Den Unterschied erkennen',
    description:
      'Beide sind sichtbare Venenveränderungen - aber mit sehr unterschiedlicher Bedeutung. Wann du unbedingt einen Arzt aufsuchen solltest.',
    live: false,
  },
]

export default function RatgeberPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Ratgeber Besenreiser-Behandlung | Besenreiser-Check'
    return () => { document.title = prev }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: sans }}>
      <Navbar />

      {/* Header */}
      <div style={{ backgroundColor: '#002B5C', padding: '48px 16px 40px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ color: '#5B9BFF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Ratgeber
          </p>
          <h1 style={{ color: '#fff', fontFamily: serif, fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, lineHeight: 1.2, marginBottom: '14px' }}>
            Ratgeber
          </h1>
          <p style={{ color: '#99BBDD', fontSize: '16px', lineHeight: 1.65, maxWidth: '540px' }}>
            Sachliche Information zu Besenreisern, Behandlungsmethoden und Praxis-Wahl.
            Aus Patientinnen-Perspektive, ohne Marketing.
          </p>
        </div>
      </div>

      {/* Article grid */}
      <main style={{ flex: 1, backgroundColor: '#F7F8FA', padding: '40px 16px 80px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {ARTICLES.map((article, i) => (
              <ArticleCardItem key={i} article={article} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ArticleCardItem({ article }: { article: ArticleCard }) {
  const card = (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      border: article.live ? '1px solid #DDE5F5' : '1px solid #E8E8E8',
      padding: '24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      opacity: article.live ? 1 : 0.7,
      position: 'relative',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
    onMouseEnter={e => {
      if (!article.live) return
      const el = e.currentTarget as HTMLElement
      el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
      el.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement
      el.style.boxShadow = 'none'
      el.style.transform = 'translateY(0)'
    }}
    >
      {!article.live && (
        <span style={{
          position: 'absolute', top: '14px', right: '14px',
          backgroundColor: '#F0F0F0', color: '#888',
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px',
        }}>
          Bald verfügbar
        </span>
      )}
      {article.live && (
        <span style={{
          display: 'inline-block',
          backgroundColor: '#E8F0FF', color: '#003399',
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px',
          alignSelf: 'flex-start',
        }}>
          Ratgeber
        </span>
      )}
      <h2 style={{
        fontFamily: serif,
        fontSize: '18px',
        fontWeight: 700,
        color: '#0A1F44',
        lineHeight: 1.3,
        margin: 0,
      }}>
        {article.title}
      </h2>
      <p style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '13px',
        color: '#555',
        lineHeight: 1.6,
        margin: 0,
        flex: 1,
      }}>
        {article.description}
      </p>
      {article.live && article.date && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>{article.date}</span>
          <span style={{ fontSize: '12px', color: '#CCC' }}>·</span>
          <span style={{ fontSize: '12px', color: '#888' }}>{article.readTime} Lesezeit</span>
        </div>
      )}
    </div>
  )

  if (article.live && article.href) {
    return (
      <Link to={article.href} style={{ textDecoration: 'none', display: 'block' }}>
        {card}
      </Link>
    )
  }
  return <div>{card}</div>
}
