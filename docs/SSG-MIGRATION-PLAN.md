# SSG Migration Plan – Vite Static Site Generation

**Status:** Geplant, noch nicht implementiert
**Geschätzter Aufwand:** 2–4 Tage Engineering
**Erwarteter Impact:** Lighthouse SEO 95→100, LCP −1 bis −2 s auf Marketing-Routen, Google-Indexierung schneller, Trust-Signal höher

---

## Warum SSG (statt der aktuellen SPA)

Die App rendert aktuell **clientseitig** — jede Route schickt `index.html` + JS, dann hydratet React.

Probleme:
- **Google sieht erst Inhalt nach JS-Execution** — funktioniert, aber langsamer + weniger Trust für YMYL-Inhalte (Health!)
- **Social-Media-Crawler** (Facebook, Twitter, LinkedIn) führen kein JS aus → unsere `useSeo()`-Meta-Tags werden NICHT für `/praxis/:slug`, `/besenreiser/:city`, `/methode/:method` gelesen. Der gepostete Link sieht generisch aus.
- **Slack/WhatsApp-Previews**: gleiche Story
- **First Paint**: Browser muss erst JS parsen + ausführen, bevor irgendwas Sinnvolles erscheint

Mit SSG:
- HTML wird zur Build-Zeit pre-rendered
- Alle Meta-Tags + Inhalt sind im Initial-HTML
- React hydratet danach für Interaktivität
- Best of both worlds

## Welche Routen pre-rendern

```
/                          ← bleibt SPA (dynamisch nach User-Position)
/ueber-uns                 ← SSG
/ratgeber                  ← SSG
/ratgeber/praxis-waehlen   ← SSG
/methoden-quiz             ← SSG (Quiz selbst ist client-only, Hülle reicht)
/methode/verodung          ← SSG
/methode/laser             ← SSG
/methode/ipl               ← SSG
/besenreiser/{city}        ← SSG (71 Pages)
/praxis/{slug}             ← SSG (227 Pages)
```

→ **Total: ~305 statische HTML-Files**

## Welcher Stack passt

**Empfehlung: vite-react-ssg** (https://github.com/zhongjiebiao/vite-react-ssg)

- React 19 ✓ (offiziell unterstützt seit v0.7)
- React Router 7 ✓ (mit `createStaticHandler`)
- Workbox kompatibel ✓
- Vite 8 ✓
- Single-Page-Mode oder Multi-Page-Mode

**Alternative: Astro 5 mit React-Islands**
- Komplettes Migration-Refactor
- Best-in-class SEO + Performance
- Aber: bricht den aktuellen Workflow stärker

**Empfehlung: vite-react-ssg** — minimal-invasiv.

## Migration-Schritte

### 1. Routes-Refactor (Tag 1)

`src/main.tsx` → `src/routes.tsx` mit `createBrowserRouter` Definition (statt `<Routes>`-JSX). vite-react-ssg discovert daraus die statischen Pfade.

```tsx
import type { RouteRecord } from 'vite-react-ssg'
export const routes: RouteRecord[] = [
  { path: '/', Component: HomePage, entry: 'src/pages/HomePage.tsx' },
  { path: '/ueber-uns', Component: AboutPage, entry: 'src/pages/AboutPage.tsx' },
  { path: '/methoden-quiz', Component: MethodenQuiz },
  { path: '/methode/:method', Component: MethodePage,
    getStaticPaths: () => ['verodung', 'laser', 'ipl'].map(m => ({ method: m })) },
  { path: '/besenreiser/:city', Component: CityPage,
    getStaticPaths: async () => {
      const data = await fs.readFile('public/data/clinics.json', 'utf8')
      const clinics = JSON.parse(data)
      const cities = [...new Set(clinics.map(c => c.city))]
      return cities.map(c => ({ city: citySlug(c) }))
    },
  },
  { path: '/praxis/:slug', Component: ClinicPage,
    getStaticPaths: async () => /* same idea, returns 227 slugs */ },
]
```

### 2. Build-Time Datenzugriff (Tag 1–2)

`useClinics()` muss SSR-fähig werden. Optionen:
- **a)** Daten zur Build-Zeit als Server-Komponente injecten (`getServerSideProps`-Stil)
- **b)** Komponente liest Daten via `import.meta.glob` zur Build-Zeit
- **c)** Pre-rendering mit `vite-react-ssg` ruft `useClinics()` mit pre-loaded data auf

Empfehlung: variant of (a) — eine `loader()` Funktion pro Route die die benötigten Klinikdaten zur Build-Zeit lädt.

### 3. Hydration-Schutz (Tag 2)

Komponenten die nur client-side rendern dürfen (z.B. SearchBar mit Geolocation, MethodenQuiz state):
```tsx
const [isClient, setIsClient] = useState(false)
useEffect(() => setIsClient(true), [])
if (!isClient) return <SkeletonHero />
```

### 4. SEO-Helper Refactor (Tag 2)

`src/lib/seo.ts` muss SSR-fähig werden:
- Aktuell: `useEffect()` mutiert `document.head` → läuft nur client-side
- SSG: Meta-Tags müssen ins HTML kommen → `react-helmet-async` oder vite-react-ssg's `<Head>`-Komponente

### 5. Build-Pipeline Update (Tag 2)

```json
{
  "scripts": {
    "build": "tsc -b && vite-react-ssg build"
  }
}
```

`vite-react-ssg build` erzeugt 305 HTML-Files in `dist/`.

### 6. Test + Lighthouse-Validierung (Tag 3)

- Manueller Test aller statischen Pfade
- Lighthouse vorher/nachher pro Route-Typ
- Verifikation: Google "Inspect URL" zeigt vollständigen Content
- Social-Card-Tests (Facebook Debugger, Twitter Card Validator)

### 7. CI + Deploy (Tag 3–4)

- Build-Time Speicher-Profile prüfen (227 Pages × ~80 KB HTML = ~18 MB Output, ok)
- Netlify-Build-Time bleibt vermutlich unter 3 Min
- Sitemap aktualisieren (schon vorhanden, muss validiert werden)

## Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Hydration-Mismatch (UI flickert) | mittel | Komponenten-Audit Schritt 3, useEffect-Guards |
| Build-Time explodiert | niedrig | Klinikdaten als JSON cachen, nicht 227× re-parsen |
| useClinics() bricht im SSR | hoch | Loader-Pattern (Schritt 2) — sauber lösbar |
| react-router 7 + vite-react-ssg Bug | mittel | Monkey-test mit minimal-Setup vor Migration |
| Sentry SDK SSR-Probleme | niedrig | Sentry hat SSR-support, nur env-Check anpassen |

## Erwartetes Ergebnis

| Metrik | Vorher (SPA) | Nachher (SSG) |
|---|---|---|
| LCP `/praxis/:slug` (Mobile, 4G) | ~3.0 s | ~1.2 s |
| Time-to-First-Byte | 80 ms | 80 ms (Netlify Edge) |
| Lighthouse SEO Score | 95 | 100 |
| Social-Share-Card | generisch | individuell pro Klinik |
| Google-Indexierungs-Zeit | 1–2 Wochen | < 24 h |

## Wann angreifen

**Nicht jetzt** — die App ist gerade frisch live mit vielen neuen Features. Stabilisieren, Bugs beobachten, Conversion-Daten sammeln.

**Trigger für SSG-Sprint:**
- Google Search Console zeigt: viele Detail-Pages nicht indexiert ODER langsam indexiert
- Social-Sharing-Stats schwach (siehe Posts mit generischen Previews)
- Lighthouse Mobile < 90 trotz aller Performance-Fixes

## Geschätzte Kosten

- Engineering: 2–4 Tage Senior-Frontend
- Risiko-Buffer: +1–2 Tage Bugfixing
- Wartungsaufwand danach: minimal — Pipeline läuft von selbst
