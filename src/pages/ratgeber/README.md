# Ratgeber - Entwickler-Dokumentation

## Übersicht

Der Ratgeber-Bereich besteht aus:
- `/ratgeber` → `src/pages/RatgeberPage.tsx` (Übersichtsseite mit Artikel-Grid)
- `/ratgeber/praxis-waehlen` → `src/pages/ratgeber/PraxisWaehlenPage.tsx` (erster Artikel)
- `src/pages/ratgeber/ArticleLayout.tsx` - wiederverwendbare Layout-Komponente

Routes sind in `src/main.tsx` registriert.

---

## Neuen Artikel hinzufügen

### 1. Seiten-Datei erstellen

Erstelle `src/pages/ratgeber/MeinArtikelPage.tsx` (orientiere dich an `PraxisWaehlenPage.tsx`):

```tsx
import { useEffect, useRef } from 'react'
import ArticleLayout from './ArticleLayout'
import { sendEvent } from '../../lib/gtm'

export default function MeinArtikelPage() {
  // ViewContent + Scroll-Tracking wie in PraxisWaehlenPage.tsx

  return (
    <ArticleLayout
      meta={{
        pageTitle: 'Titel | Besenreiser-Check',
        pageDescription: 'Meta-Description (max. 155 Zeichen)',
        canonicalPath: '/ratgeber/mein-artikel',
        schemaData: { /* schema.org/Article */ },
      }}
      breadcrumb={[{ label: 'Ratgeber', href: '/ratgeber' }, { label: 'Mein Artikel' }]}
      category="Ratgeber"
      date="1. Juni 2026"
      readTime="5 Min Lesezeit"
      title="Vollständiger Artikel-Titel"
      subtitle="Lead-Satz oder Untertitel in kursiv."
      ctaHref="/?utm_source=fb&utm_medium=ratgeber&utm_campaign=mein-artikel"
      onCtaClick={() => sendEvent('RatgeberCtaClick', { content_name: 'mein-artikel' })}
    >
      {/* Artikel-Body als JSX - CSS-Klassen: art-p, art-h2, art-h3, art-pullquote, art-patient-quote */}
      <p className="art-p">Erster Absatz...</p>
      <h2 className="art-h2">Abschnitt-Titel</h2>
      <p className="art-p">Weiterer Text...</p>
    </ArticleLayout>
  )
}
```

### 2. Route registrieren

In `src/main.tsx`:
```tsx
import MeinArtikelPage from './pages/ratgeber/MeinArtikelPage.tsx'
// ...
<Route path="/ratgeber/mein-artikel" element={<MeinArtikelPage />} />
```

### 3. Karte in Übersichtsseite ergänzen

In `src/pages/RatgeberPage.tsx`, im `ARTICLES`-Array:
```ts
{
  title: 'Vollständiger Artikel-Titel',
  description: 'Kurze Beschreibung für die Karte (2–3 Sätze).',
  href: '/ratgeber/mein-artikel',
  date: '1. Juni 2026',
  readTime: '5 Min',
  live: true,
},
```

---

## Frontmatter-Felder (ArticleLayout-Props)

| Prop | Typ | Beschreibung |
|---|---|---|
| `meta.pageTitle` | string | `<title>`-Tag, max. 60 Zeichen |
| `meta.pageDescription` | string | Meta-Description, max. 155 Zeichen |
| `meta.canonicalPath` | string | Pfad ohne Domain, z.B. `/ratgeber/praxis-waehlen` |
| `meta.schemaData` | object | schema.org/Article JSON-LD |
| `breadcrumb` | Array | `[{label, href?}, ...]` - letztes Element ohne href |
| `category` | string | Kategorie-Label (z.B. `"Ratgeber"`) |
| `date` | string | Anzeige-Datum, z.B. `"8. März 2026"` |
| `readTime` | string | z.B. `"6 Min Lesezeit"` |
| `title` | string | H1, in Serif dargestellt |
| `subtitle` | string | Lead-Paragraph, kursiv |
| `authorLine` | string? | Default: "Von der Redaktion Besenreiser-Check.de" |
| `heroSrc` | string? | Pfad zum Hero-Bild, z.B. `/ratgeber/hero-praxis-waehlen.webp` |
| `heroAlt` | string? | Alt-Text für Hero-Bild |
| `ctaHref` | string | Ziel-URL des CTA-Buttons (mit UTM-Parametern) |
| `onCtaClick` | function? | Tracking-Callback für CTA-Klick |

---

## Tracking-Events

Alle Events laufen über `sendEvent()` in `src/lib/gtm.ts` → GTM-DataLayer → Meta Pixel.

| Event | Wann | Parameter |
|---|---|---|
| `ViewContent` | Seiten-Aufruf | `content_name`, `content_category: 'ratgeber'` |
| `RatgeberCtaClick` | CTA-Button-Klick | `content_name` |
| `ScrollDepth50` | 50% Seite gescrollt | `content_name` |
| `ScrollDepth100` | 100% Seite gescrollt | `content_name` |

Consent: GTM übernimmt Consent-Gating. `sendEvent` schreibt nur in `window.dataLayer` - Events werden erst aktiv, wenn GTM durch das Cookie-Consent-Flow geladen wurde (siehe `src/lib/consent.ts`).

TODO: Conversions API (CAPI) für serverseitiges Event-Mirroring noch nicht implementiert. Events sollten parallel über CAPI gesendet werden, sobald ein Webhook/Edge-Function-Setup vorhanden ist.

---

## Bild-Assets

Ablageort: `public/ratgeber/`

| Datei | Zweck |
|---|---|
| `hero-praxis-waehlen.webp` | Hero-Bild für Artikel "Praxis wählen" |

**Bild-Brief (Artikel 1):**
Detail-Aufnahme: Hand einer Frau Mitte 40 berührt ihre Wade, Sitzposition auf einem Stuhl, gedämpftes Tageslicht durchs Fenster. Authentisch, leicht dokumentarisch. Keine Beine-Vergleichs-Optik. Keine Nahaufnahme der Besenreiser selbst. Format: 1360×560px, WebP + AVIF.

Empfehlung: AVIF als primäre Quelle, WebP als Fallback via `<picture>`-Element. Bis echter Asset geliefert, wird automatisch ein Platzhalter-Block angezeigt.

---

## Typografie-Klassen (index.css)

| Klasse | Einsatz |
|---|---|
| `art-p` | Fließtext-Absatz (Serif, 19px, 1.75 Zeilenhöhe) |
| `art-h2` | Abschnitt-Überschrift (Serif, 26px) |
| `art-h3` | Unter-Überschrift / Kriterium (Sans-Serif, 17px, fett) |
| `art-pullquote` | Hervorgehobenes Zitat mit blauem Rand links |
| `art-patient-quote` | Patientin-Zitat (kleiner, grauer Rand links) |
