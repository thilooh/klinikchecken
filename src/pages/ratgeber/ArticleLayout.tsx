import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const serif = "Georgia, 'Times New Roman', serif"
const sans  = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

export interface ArticleMeta {
  pageTitle: string
  pageDescription: string
  canonicalPath: string
  schemaData?: Record<string, unknown>
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface ArticleLayoutProps {
  meta: ArticleMeta
  breadcrumb: BreadcrumbItem[]
  category: string
  date: string
  readTime: string
  title: string
  subtitle: string
  authorLine?: string
  /** Path to hero image. Use a descriptive placeholder path until the real asset is ready. */
  heroSrc?: string
  heroAlt?: string
  ctaHref: string
  onCtaClick?: () => void
  children: React.ReactNode
}

export default function ArticleLayout({
  meta,
  breadcrumb,
  category,
  date,
  readTime,
  title,
  subtitle,
  authorLine = 'Von der Redaktion Besenreiser-Check.de',
  heroSrc,
  heroAlt = '',
  ctaHref,
  onCtaClick,
  children,
}: ArticleLayoutProps) {
  // Set page title + meta description
  useEffect(() => {
    const prev = document.title
    document.title = meta.pageTitle
    const desc = document.querySelector('meta[name="description"]')
    const prevDesc = desc?.getAttribute('content') ?? ''
    desc?.setAttribute('content', meta.pageDescription)
    const canon = document.querySelector('link[rel="canonical"]')
    const prevCanon = canon?.getAttribute('href') ?? ''
    canon?.setAttribute('href', `https://www.besenreiser-check.de${meta.canonicalPath}`)
    return () => {
      document.title = prev
      desc?.setAttribute('content', prevDesc)
      canon?.setAttribute('href', prevCanon)
    }
  }, [meta])

  // Inject JSON-LD
  useEffect(() => {
    if (!meta.schemaData) return
    const s = document.createElement('script')
    s.id = 'article-schema'
    s.type = 'application/ld+json'
    s.textContent = JSON.stringify(meta.schemaData)
    document.head.appendChild(s)
    return () => { document.getElementById('article-schema')?.remove() }
  }, [meta.schemaData])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: sans }}>
      <Navbar />

      {/* Reading container */}
      <main style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '0 16px 80px' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>

          {/* Breadcrumb */}
          <nav style={{ paddingTop: '20px', paddingBottom: '6px', display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            {breadcrumb.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <span style={{ color: '#AAA', fontSize: '12px' }}>›</span>}
                {item.href
                  ? <Link to={item.href} style={{ color: '#666', fontSize: '12px', textDecoration: 'none', fontFamily: sans }}>{item.label}</Link>
                  : <span style={{ color: '#999', fontSize: '12px', fontFamily: sans }}>{item.label}</span>
                }
              </span>
            ))}
          </nav>

          {/* Category + meta */}
          <div style={{ marginBottom: '18px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#E8F0FF', color: '#003399', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '3px', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: sans }}>
              {category}
            </span>
            <span style={{ color: '#888', fontSize: '13px', fontFamily: sans }}>
              {date} · {readTime}
            </span>
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 700,
            color: '#0A1F44',
            lineHeight: 1.22,
            marginBottom: '18px',
            marginTop: 0,
            letterSpacing: '-0.015em',
          }}>
            {title}
          </h1>

          {/* Lead / subtitle */}
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 'clamp(18px, 3vw, 22px)',
            lineHeight: 1.55,
            color: '#444',
            marginBottom: '24px',
            marginTop: 0,
          }}>
            {subtitle}
          </p>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #E8E8E8' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#003399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>B</span>
            </div>
            <span style={{ fontSize: '13px', color: '#666', fontFamily: sans }}>{authorLine}</span>
          </div>

          {/* Hero image */}
          {heroSrc && (
            <figure style={{ margin: '0 0 40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#E8EDF5' }}>
              <img
                src={heroSrc}
                alt={heroAlt}
                loading="eager"
                style={{ width: '100%', display: 'block', maxHeight: '420px', objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </figure>
          )}
          {/* Placeholder shown when no heroSrc or image fails to load */}
          {!heroSrc && (
            <div style={{ margin: '0 0 40px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#E4EBF5', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/*
                BILD-BRIEF:
                Detail-Aufnahme: Hand einer Frau Mitte 40 berührt ihre Wade, Sitzposition auf einem Stuhl,
                gedämpftes Tageslicht durchs Fenster. Authentisch, leicht dokumentarisch.
                Keine Beine-Vergleichs-Optik. Keine Nahaufnahme der Besenreiser selbst.
                Format: 1360×560px, WebP + AVIF, Ablageort: /public/ratgeber/hero-praxis-waehlen.webp
              */}
              <span style={{ color: '#7A93B8', fontSize: '13px', fontFamily: sans }}>Hero-Bild: /ratgeber/hero-praxis-waehlen.webp</span>
            </div>
          )}

          {/* Article body */}
          <article>
            {children}
          </article>

          {/* CTA box */}
          <div style={{ backgroundColor: '#F0F5FF', border: '1px solid #C8D8FF', borderRadius: '8px', padding: '28px 32px', marginTop: '48px' }}>
            <p style={{ fontFamily: sans, fontSize: '15px', fontWeight: 700, color: '#0A1F44', marginBottom: '8px', marginTop: 0 }}>
              Praxen vergleichen — sortiert nach diesen Kriterien
            </p>
            <p style={{ fontFamily: sans, fontSize: '14px', color: '#555', lineHeight: 1.6, marginBottom: '20px', marginTop: 0 }}>
              Auf Besenreiser-Check.de findest du geprüfte Praxen, sortiert nach Facharzt-Qualifikation
              und echten Patientenstimmen. Ohne bezahlte Rankings.
            </p>
            <a
              href={ctaHref}
              onClick={onCtaClick}
              style={{
                display: 'inline-block',
                backgroundColor: '#003399',
                color: '#fff',
                fontFamily: sans,
                fontWeight: 700,
                fontSize: '15px',
                padding: '14px 28px',
                borderRadius: '6px',
                textDecoration: 'none',
                minHeight: '44px',
                lineHeight: '16px',
              }}
            >
              Zum Praxen-Vergleich →
            </a>
            <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexWrap: 'wrap', gap: '8px 20px' }}>
              {['Spezialisiert auf Besenreiser', 'Ohne bezahlte Rankings', 'Sortiert nach Facharzt-Qualifikation'].map(t => (
                <li key={t} style={{ fontFamily: sans, fontSize: '12px', color: '#556', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ color: '#00A651', fontWeight: 700 }}>✓</span> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Medical disclaimer */}
          <p style={{ fontFamily: sans, fontSize: '12px', color: '#999', lineHeight: 1.6, marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #EBEBEB' }}>
            Dieser Artikel ersetzt keine ärztliche Beratung. Bei Fragen zu deiner individuellen Situation wende dich bitte an einen Facharzt.
          </p>

        </div>
      </main>

      <Footer />
    </div>
  )
}
