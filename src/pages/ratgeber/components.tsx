// Shared components for ratgeber articles. Each article still owns its
// own SECTIONS list and FAQS list - these components just render them.
import { sendEvent } from '../../lib/gtm'

const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

export interface TocSection { id: string; label: string }

export function TableOfContents({ sections }: { sections: TocSection[] }) {
  return (
    <nav
      aria-label="Inhalt"
      style={{
        background: '#F4F7FF',
        border: '1px solid #DDE5F5',
        borderRadius: '6px',
        padding: '20px 24px',
        margin: '8px 0 32px',
        fontFamily: sans,
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A1F44', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
        Inhalt
      </div>
      <ol style={{ margin: 0, padding: '0 0 0 18px', color: '#003399', fontSize: '15px', lineHeight: 1.7 }}>
        {sections.map(s => (
          <li key={s.id} style={{ margin: '2px 0' }}>
            <a href={`#${s.id}`} style={{ color: '#003399', textDecoration: 'none' }}>{s.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export interface CTABoxProps {
  heading: string
  text: string
  ctaText: string
  ctaHref: string
  variant?: 'default' | 'primary'
  trackName: string
}

export function CTABox({ heading, text, ctaText, ctaHref, variant = 'default', trackName }: CTABoxProps) {
  const primary = variant === 'primary'
  return (
    <div
      style={{
        background: primary ? '#003399' : '#F0F5FF',
        border: primary ? '1px solid #003399' : '1px solid #C8D8FF',
        borderRadius: '8px',
        padding: '26px 28px',
        margin: '36px 0',
        fontFamily: sans,
      }}
    >
      <p style={{ fontSize: '17px', fontWeight: 700, color: primary ? '#fff' : '#0A1F44', margin: '0 0 8px', lineHeight: 1.35 }}>
        {heading}
      </p>
      <p style={{ fontSize: '14px', color: primary ? '#D8E3FF' : '#555', lineHeight: 1.6, margin: '0 0 18px' }}>
        {text}
      </p>
      <a
        href={ctaHref}
        onClick={() => sendEvent('RatgeberCtaClick', { content_name: trackName })}
        style={{
          display: 'inline-block',
          background: primary ? '#FFD700' : '#003399',
          color: primary ? '#0A1F44' : '#fff',
          fontWeight: 700,
          fontSize: '15px',
          padding: '13px 26px',
          borderRadius: '6px',
          textDecoration: 'none',
          minHeight: '44px',
          lineHeight: '18px',
        }}
      >
        {ctaText} →
      </a>
    </div>
  )
}

// `a` is plain text used for both rendering AND the FAQPage JSON-LD schema.
// `aNode` lets an article render a richer answer (e.g. with an internal link)
// while the schema still gets the plain string from `a`.
export interface FAQItem { q: string; a: string; aNode?: React.ReactNode }

export function FAQSection({ faqs }: { faqs: FAQItem[] }) {
  return (
    <div style={{ margin: '1em 0 2em' }}>
      {faqs.map((f, i) => (
        <details
          key={i}
          style={{
            borderTop: i === 0 ? '1px solid #E4E8F0' : 'none',
            borderBottom: '1px solid #E4E8F0',
            padding: '14px 0',
            fontFamily: sans,
          }}
        >
          <summary
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#0A1F44',
              cursor: 'pointer',
              listStyle: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>{f.q}</span>
            <span style={{ color: '#888', fontWeight: 400, fontSize: '20px', lineHeight: 1, flexShrink: 0 }}>+</span>
          </summary>
          <p style={{ fontSize: '15px', color: '#444', lineHeight: 1.7, margin: '12px 0 4px' }}>
            {f.aNode ?? f.a}
          </p>
        </details>
      ))}
    </div>
  )
}
