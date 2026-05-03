import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ArticleLayout from './ArticleLayout'
import { CTABox, FAQSection, TableOfContents, type FAQItem, type TocSection } from './components'
import { sendEvent } from '../../lib/gtm'

const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

const CTA_HREF = '/praxen?utm_source=fb&utm_medium=ratgeber&utm_campaign=kosten'

const SLUG = 'besenreiser-entfernen-kosten'
const URL = `https://www.besenreiser-check.de/ratgeber/${SLUG}`

const SECTIONS: TocSection[] = [
  { id: 'kostenuebersicht', label: 'Kostenübersicht: Was kostet welche Methode?' },
  { id: 'preisfaktoren', label: 'Was beeinflusst den Preis konkret?' },
  { id: 'krankenkasse', label: 'Übernimmt die Krankenkasse die Kosten?' },
  { id: 'methoden-detail', label: 'Kosten je nach Methode im Detail' },
  { id: 'versteckte-kosten', label: 'Versteckte Kosten, an die kaum jemand denkt' },
  { id: 'preisunterschiede', label: 'Wo sind die Preisunterschiede am größten?' },
  { id: 'preis-wert', label: 'Ist die Behandlung den Preis wert?' },
  { id: 'praxis-wahl', label: 'Worauf solltest du bei der Praxis-Wahl achten?' },
  { id: 'faq', label: 'Häufig gestellte Fragen zu den Kosten' },
  { id: 'wie-vorgehen', label: 'So gehst du jetzt am besten vor' },
]

interface CostRow {
  method: string
  perSession: string
  sessions: string
  total: string
}

const COST_ROWS: CostRow[] = [
  { method: 'Verödung (Sklerotherapie)', perSession: '80 - 220 €',  sessions: '2 - 5',         total: '250 - 900 €' },
  { method: 'Schaumverödung',            perSession: '150 - 250 €', sessions: '1 - 3',         total: '250 - 700 €' },
  { method: 'Laser (Nd:YAG)',            perSession: '150 - 300 €', sessions: '2 - 4',         total: '400 - 1.200 €' },
  { method: 'Kombination Laser + Verödung', perSession: '200 - 350 €', sessions: '2 - 4',     total: '500 - 1.400 €' },
  { method: 'Voruntersuchung (Duplex-Sonografie)', perSession: '50 - 150 €', sessions: '1 (einmalig)', total: '50 - 150 €' },
]

function CostTable() {
  return (
    <div
      style={{
        margin: '1.6em 0 2em',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        border: '1px solid #E4E8F0',
        borderRadius: '6px',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: '520px',
          borderCollapse: 'collapse',
          fontFamily: sans,
          fontSize: '14px',
          color: '#222',
        }}
      >
        <thead>
          <tr style={{ background: '#0A1F44', color: '#fff' }}>
            <th style={thStyle}>Methode</th>
            <th style={thStyle}>Preis pro Sitzung</th>
            <th style={thStyle}>Sitzungen typisch</th>
            <th style={thStyle}>Gesamtkosten (beide Beine)</th>
          </tr>
        </thead>
        <tbody>
          {COST_ROWS.map((r, i) => (
            <tr key={r.method} style={{ background: i % 2 === 0 ? '#fff' : '#F7F9FC' }}>
              <td style={{ ...tdStyle, fontWeight: 700, color: '#0A1F44' }}>{r.method}</td>
              <td style={tdStyle}>{r.perSession}</td>
              <td style={tdStyle}>{r.sessions}</td>
              <td style={tdStyle}>{r.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 14px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '0.02em',
  borderBottom: '1px solid #1B3463',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid #EBEEF3',
  lineHeight: 1.5,
}

const FAQS: FAQItem[] = [
  {
    q: 'Wie viel kostet die Besenreiser-Entfernung pro Sitzung?',
    a: 'Eine einzelne Sitzung kostet je nach Methode zwischen 80 und 300 €. Verödung beginnt bei etwa 80-150 € pro Sitzung, Laser- und Schaumverödung liegen typischerweise bei 150-250 €, Premiumpraxen in Großstädten verlangen bis zu 300 € pro Sitzung.',
  },
  {
    q: 'Was kostet die komplette Besenreiser-Behandlung an beiden Beinen?',
    a: 'Da meist 2 bis 5 Sitzungen nötig sind, liegen die Gesamtkosten für beide Beine typischerweise zwischen 400 € und 1.500 €. Bei großflächigen Befunden oder Premiumpraxen können auch 1.800-2.000 € zusammenkommen.',
  },
  {
    q: 'Übernimmt die Krankenkasse die Kosten?',
    a: 'In der Regel nicht. Die gesetzliche Krankenversicherung wertet Besenreiser als kosmetisches Problem. Eine Erstattung ist nur möglich, wenn eine medizinisch relevante Venenerkrankung dahintersteckt. Die Voruntersuchung mit Ultraschall wird häufig übernommen.',
  },
  {
    q: 'Was ist günstiger: Laser oder Verödung?',
    a: 'Im Durchschnitt ist die klassische Verödung etwas günstiger als die Laserbehandlung - aber die Anzahl der nötigen Sitzungen entscheidet, was am Ende wirklich teurer ist. Bei kleinen, oberflächlichen Besenreisern kann der Laser mit 2-3 Sitzungen unterm Strich preiswerter sein als 5 Verödungssitzungen.',
  },
  {
    q: 'Sind die Kosten steuerlich absetzbar?',
    a: 'Rein kosmetische Behandlungen gelten nicht als außergewöhnliche Belastung im steuerlichen Sinn. Wenn die Behandlung medizinisch notwendig ist, kann sie unter bestimmten Voraussetzungen abgesetzt werden - am besten mit dem Steuerberater klären.',
  },
  {
    q: 'Warum gibt es so große Preisunterschiede zwischen Praxen?',
    a: 'Drei Hauptgründe: regionale Unterschiede (Großstadt vs. mittelgroße Stadt), Praxistyp (reine Phlebologie vs. Premium-Privatpraxis) und die genaue Abrechnungslogik (pro Bein, pro Sitzung beider Beine, oder nach Zeitaufwand).',
  },
  {
    q: 'Kann ich Ratenzahlung vereinbaren?',
    a: 'Viele Praxen bieten Ratenzahlung über Anbieter wie medipay oder direkt mit der Praxis an. Frag in der Erstberatung danach - die Konditionen unterscheiden sich aber stark, manche Anbieter verlangen Zinsen, andere bieten zinsfreie Raten über wenige Monate.',
  },
  {
    q: 'Sind günstige Angebote im Ausland eine Alternative?',
    a: 'Behandlungen im Ausland werden teils mit deutlich niedrigeren Preisen beworben. Was selten dazu gesagt wird: Bei Komplikationen oder Folgebehandlungen reisen Patienten mehrfach an, und die deutsche Krankenkasse springt bei Problemen in der Regel nicht ein. Für eine ambulante Behandlung wie die Besenreiser-Entfernung lohnt sich der Aufwand selten.',
  },
]

// Article + FAQPage + BreadcrumbList in a single @graph object,
// because ArticleLayout takes one schemaData blob and injects one
// <script type="application/ld+json"> tag.
const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Besenreiser entfernen: Kosten 2026 im Überblick (Laser, Verödung & Co.)',
      description: 'Was kostet eine Besenreiser-Entfernung wirklich? Aktuelle Preise pro Sitzung & Gesamtkosten für Laser, Verödung und Schaumverödung - plus: Was die Krankenkasse zahlt.',
      image: 'https://www.besenreiser-check.de/besenreiser-check-logo5.png',
      datePublished: '2026-05-03',
      dateModified: '2026-05-03',
      author: {
        '@type': 'Organization',
        name: 'Besenreiser-Check.de',
        url: 'https://www.besenreiser-check.de',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Besenreiser-Check.de',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.besenreiser-check.de/besenreiser-check-logo5.png',
        },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://www.besenreiser-check.de/' },
        { '@type': 'ListItem', position: 2, name: 'Ratgeber', item: 'https://www.besenreiser-check.de/ratgeber' },
        { '@type': 'ListItem', position: 3, name: 'Besenreiser entfernen: Kosten', item: URL },
      ],
    },
  ],
}

export default function BesenreiserEntfernenKostenPage() {
  // ViewContent on mount
  useEffect(() => {
    sendEvent('ViewContent', {
      content_type: 'ratgeber',
      content_name: `ratgeber-${SLUG}`,
      content_category: 'ratgeber',
    })
  }, [])

  // Scroll-depth tracking (50%, 100%) - same pattern as PraxisWaehlenPage convention.
  const fired = useRef({ d50: false, d100: false })
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement
      const scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight
      if (!fired.current.d50 && scrolled >= 0.5) {
        fired.current.d50 = true
        sendEvent('ScrollDepth50', { content_name: `ratgeber-${SLUG}` })
      }
      if (!fired.current.d100 && scrolled >= 0.95) {
        fired.current.d100 = true
        sendEvent('ScrollDepth100', { content_name: `ratgeber-${SLUG}` })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <ArticleLayout
      meta={{
        pageTitle: 'Besenreiser entfernen Kosten 2026: Preise & Krankenkasse | Besenreiser-Check',
        pageDescription: 'Was kostet eine Besenreiser-Entfernung wirklich? Aktuelle Preise pro Sitzung & Gesamtkosten für Laser, Verödung und Schaumverödung - plus: Was die Krankenkasse zahlt.',
        canonicalPath: `/ratgeber/${SLUG}`,
        schemaData: SCHEMA,
      }}
      breadcrumb={[
        { label: 'Ratgeber', href: '/ratgeber' },
        { label: 'Besenreiser entfernen: Kosten' },
      ]}
      category="Ratgeber"
      date="3. Mai 2026"
      readTime="9 Min Lesezeit"
      title="Besenreiser entfernen: Kosten 2026 im Überblick"
      subtitle="Eine einzelne Sitzung kostet zwischen 80 € und 300 €, die Gesamtkosten für beide Beine liegen typisch bei 400 € bis 1.500 €. Was hinter den Spannen steckt - und was die Krankenkasse zahlt."
      authorLine="Redaktion Besenreiser-Check.de"
      ctaHref={CTA_HREF}
      ctaBody="Über 200 spezialisierte Praxen für Besenreiser-Behandlung in Deutschland - mit Bewertungen, Methoden und Standorten."
      onCtaClick={() => sendEvent('RatgeberCtaClick', { content_name: `kosten-layout-bottom` })}
    >
      <p className="art-p">
        <strong>Kurz vorab:</strong> Eine einzelne Sitzung zur Besenreiser-Entfernung kostet in
        Deutschland je nach Methode und Praxis zwischen <strong>80 € und 300 €</strong>. Da meist
        2 bis 5 Sitzungen nötig sind, liegen die <strong>Gesamtkosten für beide Beine
        typischerweise bei 400 € bis 1.500 €</strong>. Die gesetzliche Krankenkasse übernimmt
        diese Kosten in der Regel <strong>nicht</strong>, da Besenreiser als kosmetisches Problem
        gelten.
      </p>
      <p className="art-p">
        In diesem Ratgeber findest du eine ehrliche Kostenübersicht - ohne versteckte Annahmen,
        ohne Lockangebote. Wir haben Preise von Phlebologen, Dermatologen und Venenpraxen aus
        ganz Deutschland zusammengetragen und zeigen dir, womit du realistisch rechnen musst.
      </p>

      <TableOfContents sections={SECTIONS} />

      <h2 id="kostenuebersicht" className="art-h2">Kostenübersicht: Was kostet welche Methode?</h2>
      <p className="art-p">
        Die folgende Tabelle zeigt typische Preisspannen für die gängigsten Behandlungsmethoden
        in Deutschland. Wichtig: Das sind <strong>Marktpreise auf Basis öffentlicher
        Preisangaben deutscher Fachpraxen</strong> - die individuellen Kosten in deiner
        Wunschpraxis können davon abweichen.
      </p>

      <CostTable />

      <p className="art-p">
        <strong>Zur Einordnung:</strong> Die Spannen entstehen, weil Praxen unterschiedlich
        kalkulieren - manche rechnen pro Bein, andere pro Sitzung mit beiden Beinen, wieder andere
        nach Zeitaufwand. Frag bei der Erstberatung gezielt nach: <em>"Was kostet eine Sitzung
        für beide Beine, und wie viele Sitzungen werden bei meinem Befund voraussichtlich nötig
        sein?"</em>
      </p>

      <CTABox
        heading="Spezialisierte Praxis in deiner Stadt finden"
        text="Über 200 geprüfte Praxen für Besenreiser-Behandlung - nach Stadt sortiert, mit Bewertungen und Methoden im Überblick."
        ctaText="Praxis finden"
        ctaHref={CTA_HREF}
        trackName="kosten-mid-1"
      />

      <h2 id="preisfaktoren" className="art-h2">Was beeinflusst den Preis konkret?</h2>
      <p className="art-p">
        Vier Faktoren bestimmen, wo du innerhalb der oben genannten Spannen landest:
      </p>

      <h3 className="art-h3">1. Behandlungsmethode</h3>
      <p className="art-p">
        Verödung ist im Schnitt günstiger als Laser. Das liegt daran, dass die Materialkosten
        (Verödungsmittel) niedriger sind als die Anschaffungs- und Wartungskosten eines
        medizinischen Lasers. Die Schaumverödung liegt preislich oft zwischen klassischer
        Verödung und Laser, kommt aber typischerweise mit weniger Sitzungen aus.
      </p>

      <h3 className="art-h3">2. Anzahl der Sitzungen</h3>
      <p className="art-p">
        Das ist der Faktor mit dem größten Hebel. Wer nur vereinzelte Besenreiser hat, kommt
        manchmal mit zwei Sitzungen aus. Bei großflächigen, ausgeprägten Befunden können es vier
        oder fünf werden - was die Gesamtkosten verdoppelt oder verdreifacht.
      </p>

      <h3 className="art-h3">3. Größe des behandelten Areals</h3>
      <p className="art-p">
        Die meisten Praxen rechnen entweder pro Bein oder nach Behandlungszeit ab. Eine ganze
        Beinaußenseite ist teurer als ein einzelner kniefokussierter Befund. Frag konkret nach,
        wie deine Praxis abrechnet.
      </p>

      <h3 className="art-h3">4. Region und Praxistyp</h3>
      <p className="art-p">
        In Großstädten wie München, Hamburg, Düsseldorf oder Frankfurt sind die Preise tendenziell
        höher als in mittleren Städten. Privatpraxen liegen meist über reinen
        Phlebologie-Ordinationen, weil sie zusätzliche Services (Beratung, Räumlichkeiten,
        Premiumlaser) einpreisen.
      </p>

      <h2 id="krankenkasse" className="art-h2">Übernimmt die Krankenkasse die Kosten?</h2>
      <p className="art-p">
        <strong>Nein - in den allermeisten Fällen nicht.</strong> Die gesetzliche
        Krankenversicherung wertet Besenreiser als rein kosmetisches Problem und übernimmt die
        Behandlungskosten daher nicht. Das gilt für Verödung, Laser und alle Kombinationsverfahren
        gleichermaßen.
      </p>
      <p className="art-p">
        Es gibt drei Ausnahmen, bei denen Kosten oder Teilkosten erstattet werden können:
      </p>
      <ul style={{ fontFamily: 'Georgia, serif', fontSize: '19px', lineHeight: 1.75, color: '#333', margin: '0 0 1.4em', paddingLeft: '24px' }}>
        <li style={{ marginBottom: '10px' }}>
          <strong>Medizinische Notwendigkeit:</strong> Wenn die Besenreiser auf eine
          zugrundeliegende Veneninsuffizienz oder Krampfaderkrankheit hinweisen, kann die
          Behandlung des tieferliegenden Venensystems erstattungsfähig sein. Die
          Besenreiser-Entfernung selbst bleibt aber meist Privatleistung.
        </li>
        <li style={{ marginBottom: '10px' }}>
          <strong>Voruntersuchung mit Ultraschall (Duplex-Sonografie):</strong> Diese wird oft
          übernommen, weil sie der medizinischen Abklärung dient - nicht der Behandlung.
        </li>
        <li style={{ marginBottom: '10px' }}>
          <strong>Private Krankenversicherung (PKV):</strong> Privatversicherte sollten die
          Tarifbedingungen prüfen. Manche PKV-Tarife übernehmen Besenreiser-Behandlungen anteilig
          oder vollständig, andere schließen kosmetische Leistungen aus.
        </li>
      </ul>
      <p className="art-p">
        <strong>Praxis-Tipp:</strong> Lass dir vor der Behandlung einen schriftlichen Heil- und
        Kostenplan geben. Bei privaten Versicherern und Beihilfestellen kannst du diesen vorab
        einreichen und so klären, ob und wie viel erstattet wird.
      </p>

      <h2 id="methoden-detail" className="art-h2">Kosten je nach Methode im Detail</h2>

      <h3 className="art-h3">Verödung (Sklerotherapie): 80 - 220 € pro Sitzung</h3>
      <p className="art-p">
        Die klassische Verödung - auch Mikro-Sklerotherapie genannt - ist laut den medizinischen
        Leitlinien die <strong>Methode der ersten Wahl bei Besenreisern</strong>. Ein
        Verödungsmittel (meist Polidocanol) wird mit einer feinen Nadel direkt in die Besenreiser
        injiziert.
      </p>
      <p className="art-p">
        Die Preisspanne ist groß: Eine Praxis im ländlichen Raum berechnet ab ca. 85 € pro Bein
        und Sitzung, eine spezialisierte Phlebologie in einer Großstadt nimmt für eine
        vergleichbare Sitzung 200-220 €. Üblich sind 2 bis 5 Sitzungen im Abstand von einigen
        Wochen.
      </p>
      <p className="art-p">
        <strong>Realistische Gesamtkosten:</strong> 250 - 900 € für die komplette Behandlung
        beider Beine.
      </p>

      <h3 className="art-h3">Schaumverödung: 150 - 250 € pro Sitzung</h3>
      <p className="art-p">
        Bei der Schaumverödung wird das Verödungsmittel mit Luft zu einem Schaum aufgeschlagen.
        Der Vorteil: Der Schaum verteilt sich gleichmäßiger in den Venen und haftet besser an der
        Gefäßwand. Dadurch reichen oft <strong>weniger Sitzungen</strong> als bei der klassischen
        Verödung - meist 1 bis 3.
      </p>
      <p className="art-p">
        Die Schaumverödung eignet sich besonders für etwas größere Besenreiser und retikuläre
        Varizen (kleine bläuliche Netzvenen). Bei sehr feinen, oberflächlichen Besenreisern ist
        sie nicht immer die beste Wahl.
      </p>
      <p className="art-p">
        <strong>Realistische Gesamtkosten:</strong> 250 - 700 €.
      </p>

      <h3 className="art-h3">Laserbehandlung (Nd:YAG): 150 - 300 € pro Sitzung</h3>
      <p className="art-p">
        Der Nd:YAG-Laser (Neodym-dotierter Yttrium-Aluminium-Granat-Laser) ist der medizinische
        Goldstandard bei der Laser-Besenreiser-Behandlung. Die Lichtenergie wird vom Blutfarbstoff
        absorbiert, erhitzt die Gefäßwand und führt zum Verschluss der Vene.
      </p>
      <p className="art-p">
        Wichtig zu wissen: Der Laser eignet sich vor allem für <strong>sehr feine, oberflächliche
        Besenreiser</strong>. Größere oder tiefer liegende Besenreiser werden besser verödet.
        Manche Praxen rechnen Laserbehandlungen bei sehr großflächigen Befunden auch pauschal ab -
        etwa 1.300 € für ein Bein, 1.800 € für beide. Diese Pauschalen lohnen sich nur bei sehr
        ausgedehnten Befunden.
      </p>
      <p className="art-p">
        <strong>Realistische Gesamtkosten:</strong> 400 - 1.200 € bei sitzungsweiser Abrechnung.
      </p>

      <h3 className="art-h3">Kombinationsbehandlung: 200 - 350 € pro Sitzung</h3>
      <p className="art-p">
        Bei vielen Patientinnen und Patienten ist eine Kombination sinnvoll: Größere Besenreiser
        werden zuerst verödet, anschließend werden feinste Restbesenreiser mit dem Laser
        nachbehandelt. Die Praxis berechnet das meist als kombinierte Sitzung mit einem Aufschlag.
      </p>
      <p className="art-p">
        <strong>Realistische Gesamtkosten:</strong> 500 - 1.400 € - aber oft mit dem besten
        ästhetischen Endergebnis.
      </p>

      <h3 className="art-h3">Voruntersuchung: 50 - 150 €</h3>
      <p className="art-p">
        Vor jeder Behandlung steht eine Untersuchung des Venensystems - meist per
        Duplex-Sonografie (Ultraschall). Sie schließt aus, dass eine tieferliegende
        Venenerkrankung vorliegt. Diese Voruntersuchung wird <strong>häufig von der Krankenkasse
        übernommen</strong>, wenn ein medizinischer Verdacht besteht. Reine ästhetische
        Voruntersuchungen sind Privatleistung.
      </p>

      <h2 id="versteckte-kosten" className="art-h2">Versteckte Kosten, an die kaum jemand denkt</h2>
      <p className="art-p">
        Beim ersten Beratungsgespräch geht es meistens nur um den Sitzungspreis. Drei Posten
        kommen aber regelmäßig dazu:
      </p>
      <p className="art-p">
        <strong>Kompressionsstrümpfe:</strong> Nach einer Verödung sollten für ein bis drei Wochen
        medizinische Kompressionsstrümpfe getragen werden. Ein Paar in medizinischer Qualität
        kostet zwischen 40 und 90 €. Bei Verordnung kann die Krankenkasse einen Teil übernehmen,
        die Praxis-Empfehlung allein reicht aber nicht - dafür braucht es ein Rezept vom Hausarzt
        oder Phlebologen.
      </p>
      <p className="art-p">
        <strong>Nachkontrollen:</strong> Manche Praxen rechnen Nachkontrollen separat ab, andere
        haben sie im Sitzungspreis inkludiert. Klare Frage in der Erstberatung: <em>"Sind
        Nachkontrollen bei den genannten Sitzungspreisen dabei?"</em>
      </p>
      <p className="art-p">
        <strong>Folgebehandlungen Jahre später:</strong> Besenreiser können wiederkehren oder sich
        neu bilden - das hängt von Veranlagung und Lebensstil ab. Plane gedanklich ein, dass du in
        5 bis 10 Jahren erneut zur Behandlung gehen wirst, falls du dauerhaft glatte Beine willst.
      </p>

      <h2 id="preisunterschiede" className="art-h2">Wo sind die Preisunterschiede am größten?</h2>
      <p className="art-p">
        Die Schwankungen zwischen Praxen sind beträchtlich - für die <em>gleiche</em> Behandlung
        mit demselben Verfahren. Drei Faktoren erklären das:
      </p>
      <p className="art-p">
        Ein <strong>Phlebologe</strong> (Venenfacharzt) berechnet im Durchschnitt etwas weniger
        als ein <strong>Dermatologe</strong>, weil die Behandlung in der Phlebologie zum
        Kerngeschäft gehört und Volumen die Stückkosten senkt. Eine <strong>Privatpraxis mit
        Premium-Ausstattung</strong> liegt nochmals höher - dafür gibt es oft modernste
        Lasergeräte und ausführlichere Beratung.
      </p>
      <p className="art-p">
        Auch der <strong>Standort</strong> macht 20-40 % aus: München, Düsseldorf, Hamburg und
        Frankfurt sind systematisch teurer als zum Beispiel Leipzig, Hannover oder Nürnberg. Wer
        flexibel ist, kann in einer mittelgroßen Stadt oft 30 % sparen.
      </p>

      <h2 id="preis-wert" className="art-h2">Ist die Behandlung den Preis wert?</h2>
      <p className="art-p">
        Das ist eine ehrliche Frage, die du dir stellen solltest, bevor du den Termin machst. Hier
        ein paar Orientierungspunkte:
      </p>
      <p className="art-p">
        Bei einer erfolgreichen Behandlung verschwinden die behandelten Besenreiser dauerhaft -
        die <em>bestehenden</em> Gefäße werden vom Körper abgebaut. Was nicht garantiert ist: dass
        keine <em>neuen</em> Besenreiser entstehen. Deine Veranlagung ändert sich nicht, und
        Faktoren wie hormonelle Veränderungen, Schwangerschaften oder langes Stehen begünstigen
        weiterhin Neubildungen.
      </p>
      <p className="art-p">
        Realistisch heißt das: Du kaufst dir mit der Behandlung einen sehr guten ästhetischen
        Zustand für mehrere Jahre. Manche Patientinnen und Patienten kommen jahrzehntelang aus,
        andere brauchen alle 5 bis 8 Jahre eine kleine Auffrischung.
      </p>
      <p className="art-p">
        Wenn dich Besenreiser im Alltag stören - beim Sport, beim Schwimmen, bei der Wahl der
        Kleidung - ist die Investition für die meisten Menschen nachvollziehbar. Wer sie kaum
        bemerkt, sollte nicht nur wegen einer abstrakten Vorstellung von "perfekten Beinen" Geld
        ausgeben.
      </p>

      <h2 id="praxis-wahl" className="art-h2">Worauf solltest du bei der Praxis-Wahl achten?</h2>
      <p className="art-p">
        Der billigste Anbieter ist hier selten der beste. Drei harte Qualitätsmerkmale, die du
        prüfen kannst:
      </p>
      <p className="art-p">
        <strong>Spezialisierung des Behandlers.</strong> Idealerweise ein Phlebologe (Facharzt für
        Venenheilkunde) oder ein Dermatologe mit nachgewiesener Erfahrung in der Sklerotherapie
        und Lasertherapie. Welche Facharztrichtungen überhaupt infrage kommen und worauf du
        achten solltest, erklären wir im Detail im Ratgeber{' '}
        <Link to="/ratgeber/welcher-arzt-besenreiser" style={{ color: '#003399', textDecoration: 'underline' }}>
          Welcher Arzt entfernt Besenreiser?
        </Link>{' '}
        Frag konkret: <em>"Wie viele Besenreiser-Behandlungen führen Sie pro Monat durch?"</em>
      </p>
      <p className="art-p">
        <strong>Voruntersuchung mit Duplex-Sonografie.</strong> Eine seriöse Praxis untersucht vor
        der Behandlung mit Ultraschall, ob tieferliegende Venenprobleme vorliegen. Praxen, die
        ohne diese Abklärung direkt zur Behandlung übergehen, sind ein Warnsignal.
      </p>
      <p className="art-p">
        <strong>Methodenvielfalt.</strong> Eine Praxis, die nur Laser oder nur Verödung anbietet,
        wird dir mit hoher Wahrscheinlichkeit <em>ihre</em> Methode empfehlen - auch wenn die
        andere besser geeignet wäre. Praxen mit beiden Verfahren können neutraler beraten.
      </p>

      <CTABox
        heading="Spezialisierte Besenreiser-Praxen in deiner Stadt vergleichen"
        text="Wir listen geprüfte Praxen mit Bewertungen, angebotenen Methoden und Spezialisierung - damit du fundiert entscheiden kannst."
        ctaText="Praxis finden"
        ctaHref={CTA_HREF}
        trackName="kosten-mid-2"
      />

      <h2 id="faq" className="art-h2">Häufig gestellte Fragen zu den Kosten</h2>
      <FAQSection faqs={FAQS} />

      <h2 id="wie-vorgehen" className="art-h2">So gehst du jetzt am besten vor</h2>
      <p className="art-p">
        Wenn du nach diesem Ratgeber das Gefühl hast: "Ich will eine Behandlung machen lassen,
        aber will nicht zu viel zahlen" - dann sind das die nächsten drei Schritte:
      </p>
      <p className="art-p">
        <strong>1. Drei Praxen vergleichen.</strong> Hol dir Erstberatungs-Termine bei zwei bis
        drei spezialisierten Praxen in deiner Stadt. Bei den meisten kostet die Erstberatung
        zwischen 50 und 100 € - diese Investition spart dir später leicht das Mehrfache, weil du
        Methoden und Preise vergleichen kannst.
      </p>
      <p className="art-p">
        <strong>2. Schriftlichen Heil- und Kostenplan einfordern.</strong> Eine seriöse Praxis
        gibt dir einen Plan mit voraussichtlicher Sitzungszahl, Gesamtkosten und der
        vorgeschlagenen Methode mit auf den Heimweg. Wenn das nicht angeboten wird - andere Praxis
        suchen.
      </p>
      <p className="art-p">
        <strong>3. Zur richtigen Jahreszeit behandeln lassen.</strong> Laserbehandlungen werden
        idealerweise in der dunklen Jahreszeit (Oktober bis März) durchgeführt, weil die Haut nach
        der Behandlung mehrere Wochen vor UV-Strahlung geschützt werden muss. Wer im April
        beginnt, kommt mit der Behandlung leicht in den Sommer hinein - das ist ungünstig.
      </p>
    </ArticleLayout>
  )
}
