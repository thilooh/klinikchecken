import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ArticleLayout from './ArticleLayout'
import { CTABox, FAQSection, TableOfContents, useHashScroll, type FAQItem, type TocSection } from './components'
import { sendEvent } from '../../lib/gtm'

const sans = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

const CTA_HREF = '/praxen?utm_source=fb&utm_medium=ratgeber&utm_campaign=methoden'

const SLUG = 'besenreiser-entfernen-methoden'
const URL = `https://www.besenreiser-check.de/ratgeber/${SLUG}`

const SECTIONS: TocSection[] = [
  { id: 'uebersicht', label: 'Übersicht: Welche Methode für welchen Befund?' },
  { id: 'leitlinien', label: 'Was die medizinischen Leitlinien sagen' },
  { id: 'besenreiser-veroeden', label: 'Methode 1: Verödung (Sklerotherapie)' },
  { id: 'schaumveroedung', label: 'Methode 2: Schaumverödung' },
  { id: 'besenreiser-lasern', label: 'Methode 3: Laserbehandlung (Nd:YAG)' },
  { id: 'entscheidungshilfe', label: 'Verödung oder Laser? Die ehrliche Entscheidungshilfe' },
  { id: 'kosten', label: 'Was die Methoden kosten' },
  { id: 'andere-methoden', label: 'Methoden außerhalb des Standards' },
  { id: 'nach-der-behandlung', label: 'Was passiert nach der Behandlung?' },
  { id: 'praxis-wahl', label: 'Worauf solltest du bei der Praxis-Wahl achten?' },
  { id: 'faq', label: 'Häufig gestellte Fragen' },
  { id: 'wie-vorgehen', label: 'So gehst du jetzt am besten vor' },
]

interface MethodRow {
  method: string
  suitable: string
  sessions: string
  cost: string
  pain: string
  downtime: string
}

const METHOD_ROWS: MethodRow[] = [
  { method: 'Verödung (Sklerotherapie)', suitable: 'Mittlere & größere Besenreiser, retikuläre Varizen', sessions: '2 - 5', cost: '80 - 220 €',  pain: 'Gering',         downtime: 'Keine' },
  { method: 'Schaumverödung',            suitable: 'Größere & tiefer liegende Besenreiser',              sessions: '1 - 3', cost: '150 - 250 €', pain: 'Gering',         downtime: 'Keine' },
  { method: 'Laser (Nd:YAG)',            suitable: 'Sehr feine, oberflächliche Besenreiser',             sessions: '2 - 4', cost: '150 - 300 €', pain: 'Mittel',         downtime: 'Sehr gering' },
  { method: 'Kombination',               suitable: 'Gemischte Befunde (häufig)',                         sessions: '2 - 4', cost: '200 - 350 €', pain: 'Gering - Mittel', downtime: 'Keine' },
]

function MethodOverviewTable() {
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
          minWidth: '720px',
          borderCollapse: 'collapse',
          fontFamily: sans,
          fontSize: '14px',
          color: '#222',
        }}
      >
        <thead>
          <tr style={{ background: '#0A1F44', color: '#fff' }}>
            <th style={thStyle}>Methode</th>
            <th style={thStyle}>Geeignet für</th>
            <th style={thStyle}>Sitzungen</th>
            <th style={thStyle}>Kosten/Sitzung</th>
            <th style={thStyle}>Schmerz</th>
            <th style={thStyle}>Ausfallzeit</th>
          </tr>
        </thead>
        <tbody>
          {METHOD_ROWS.map((r, i) => (
            <tr key={r.method} style={{ background: i % 2 === 0 ? '#fff' : '#F7F9FC' }}>
              <td style={{ ...tdStyle, fontWeight: 700, color: '#0A1F44' }}>{r.method}</td>
              <td style={tdStyle}>{r.suitable}</td>
              <td style={tdStyle}>{r.sessions}</td>
              <td style={tdStyle}>{r.cost}</td>
              <td style={tdStyle}>{r.pain}</td>
              <td style={tdStyle}>{r.downtime}</td>
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
    q: 'Was ist die beste Methode zur Besenreiser-Entfernung?',
    a: 'Es gibt nicht die beste Methode - die Wahl hängt vom Befund ab. Größere und tiefer liegende Besenreiser werden am besten verödet (Sklerotherapie oder Schaumverödung). Sehr feine, oberflächliche Besenreiser sprechen besser auf den Nd:YAG-Laser an. Bei gemischten Befunden ist eine Kombination aus Verödung und Laser meist das beste Ergebnis. Die Sklerotherapie ist laut medizinischen Leitlinien die Methode der ersten Wahl.',
  },
  {
    q: 'Was ist günstiger: Laser oder Verödung?',
    a: 'Im Durchschnitt ist die klassische Verödung pro Sitzung günstiger als die Laserbehandlung. Aber: Die Anzahl der nötigen Sitzungen entscheidet, was am Ende wirklich teurer ist. Bei sehr feinen Besenreisern kann der Laser mit 2-3 Sitzungen unterm Strich preiswerter sein als 5 Verödungssitzungen.',
    aNode: (
      <>
        Im Durchschnitt ist die klassische Verödung pro Sitzung günstiger als die
        Laserbehandlung. Aber: Die Anzahl der nötigen Sitzungen entscheidet, was am Ende
        wirklich teurer ist. Bei sehr feinen Besenreisern kann der Laser mit 2-3 Sitzungen
        unterm Strich preiswerter sein als 5 Verödungssitzungen. Konkrete Preisspannen pro
        Methode findest du im Ratgeber{' '}
        <Link to="/ratgeber/besenreiser-entfernen-kosten" style={{ color: '#003399', textDecoration: 'underline' }}>
          Besenreiser entfernen: Kosten 2026
        </Link>.
      </>
    ),
  },
  {
    q: 'Tut die Behandlung weh?',
    a: 'Beide Methoden sind in der Regel gut erträglich. Die Verödung verursacht ein kurzes Brennen oder Ziehen während der Injektion. Der Laser kann ein leichtes Stechen oder Brennen während des Impulses verursachen. Eine Betäubung ist in der Regel nicht nötig.',
  },
  {
    q: 'Wie viele Sitzungen brauche ich?',
    a: 'Bei der klassischen Verödung sind meist 2-5 Sitzungen nötig. Die Schaumverödung kommt oft mit 1-3 Sitzungen aus. Beim Laser sind es typischerweise 2-4 Sitzungen. Die genaue Anzahl kann erst nach der Voruntersuchung mit Duplex-Sonografie eingeschätzt werden.',
  },
  {
    q: 'Kann man Besenreiser auf einmal komplett entfernen?',
    a: 'Nein. Der Körper braucht nach der Behandlung mehrere Wochen, um die verödeten oder gelaserten Gefäße abzubauen. Erste deutliche Verbesserung sieht man nach 4-6 Wochen, das endgültige Ergebnis nach 3-6 Monaten. Praxen, die perfekte Beine in einer Sitzung versprechen, sind unseriös.',
  },
  {
    q: 'Kommen die Besenreiser wieder?',
    a: 'Die behandelten Besenreiser sind dauerhaft weg. Was nicht garantiert ist: dass keine neuen Besenreiser entstehen. Veranlagung, Hormone, Schwangerschaft und langes Stehen begünstigen weiterhin Neubildungen. Realistisch: Du kaufst dir mit der Behandlung mehrere Jahre einen sehr guten Zustand.',
  },
  {
    q: 'Was ist die Schaumverödung genau?',
    a: 'Die Schaumverödung ist eine Weiterentwicklung der klassischen Verödung. Statt einer flüssigen Lösung wird ein stabiler Mikroschaum aus dem Verödungsmittel und Luft kurz vor der Injektion hergestellt. Der Schaum verteilt sich gleichmäßiger in der Vene - dadurch sind oft weniger Sitzungen nötig.',
  },
  {
    q: 'Welche Methode ist bei Krampfadern sinnvoll?',
    a: 'Krampfadern sind ein anderes Thema als Besenreiser. Bei größeren Krampfadern kommen meist andere Verfahren zum Einsatz: endovenöse Lasertherapie, Radiofrequenzablation, Schaumverödung oder das klassische Stripping. Wenn deine Besenreiser von einer größeren Krampfader gespeist werden, sollte diese vor der Besenreiser-Behandlung therapiert werden.',
  },
  {
    q: 'Sind die Methoden auch im Gesicht anwendbar?',
    a: 'Im Gesicht ist der Laser meist die erste Wahl. Verödung ist im Gesicht riskanter und wird seltener gemacht. Bei kleinen Besenreisern im Gesicht führen spezialisierte Dermatologen die Behandlung mit dem Nd:YAG-Laser oder bestimmten Diodenlasern durch.',
  },
  {
    q: 'Kann ich Besenreiser selbst lasern?',
    a: 'Nein. Im Internet werden günstige Besenreiser-Laser für den Hausgebrauch angeboten - das sind keine medizinischen Geräte und ihre Wirksamkeit ist nicht belegt. Bei falscher Anwendung drohen Hautverbrennungen und Pigmentstörungen. Eine wirksame Laser-Besenreiser-Behandlung erfordert ein medizinisches Lasergerät und entsprechendes Fachwissen.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Besenreiser entfernen: Methoden im Vergleich',
      description: 'Verödung, Laser oder Schaumverödung - welche Methode ist die richtige? Vergleich der etablierten Verfahren mit Vor- und Nachteilen, Sitzungen und Kosten.',
      image: 'https://www.besenreiser-check.de/besenreiser-check-logo5.png',
      datePublished: '2026-05-03',
      dateModified: '2026-05-03',
      author: {
        '@type': 'Organization',
        name: 'Redaktion Besenreiser-Check.de',
        url: 'https://www.besenreiser-check.de/ueber-uns',
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
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: 'https://www.besenreiser-check.de' },
        { '@type': 'ListItem', position: 2, name: 'Ratgeber', item: 'https://www.besenreiser-check.de/ratgeber' },
        { '@type': 'ListItem', position: 3, name: 'Besenreiser entfernen: Methoden im Vergleich', item: URL },
      ],
    },
  ],
}

export default function BesenreiserEntfernenMethodenPage() {
  useEffect(() => {
    sendEvent('ViewContent', {
      content_type: 'ratgeber',
      content_name: `ratgeber-${SLUG}`,
      content_category: 'ratgeber',
    })
  }, [])

  useHashScroll()

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
        pageTitle: 'Besenreiser entfernen: Methoden im Vergleich | Besenreiser-Check',
        pageDescription: 'Verödung, Laser oder Schaumverödung - welche Methode ist die richtige? Vergleich der etablierten Verfahren mit Vor- und Nachteilen, Sitzungen und Kosten.',
        canonicalPath: `/ratgeber/${SLUG}`,
        schemaData: SCHEMA,
      }}
      breadcrumb={[
        { label: 'Ratgeber', href: '/ratgeber' },
        { label: 'Methoden im Vergleich' },
      ]}
      category="Ratgeber"
      date="3. Mai 2026"
      readTime="11 Min Lesezeit"
      title="Besenreiser entfernen: Methoden im Vergleich"
      subtitle="Klassische Verödung, Schaumverödung und Nd:YAG-Laser sind die drei etablierten Verfahren. Welches für dich passt, hängt nicht vom Marketing der Praxis ab, sondern von Größe und Tiefe deiner Besenreiser - und oft ist die Kombination das beste Ergebnis."
      authorLine="Redaktion Besenreiser-Check.de"
      ctaHref={CTA_HREF}
      ctaBody="Über 200 spezialisierte Praxen für Besenreiser-Behandlung in Deutschland - mit angebotenen Methoden, Bewertungen und Standorten."
      onCtaClick={() => sendEvent('RatgeberCtaClick', { content_name: 'methoden-layout-bottom' })}
    >
      <p className="art-p">
        <strong>Kurz vorab:</strong> Die drei in Deutschland etablierten Methoden zur
        Besenreiser-Entfernung sind die <strong>klassische Verödung (Sklerotherapie)</strong>,
        die <strong>Schaumverödung</strong> und die <strong>Laserbehandlung mit Nd:YAG</strong>.
        Welche Methode für dich die richtige ist, hängt nicht vom Marketing der Praxis ab,
        sondern von der <strong>Größe und Tiefe deiner Besenreiser</strong>: Sehr feine,
        oberflächliche Besenreiser sprechen am besten auf Laser an, größere und tiefer liegende
        werden besser verödet. In vielen Fällen ist eine Kombination aus beiden Verfahren das
        beste Ergebnis.
      </p>
      <p className="art-p">
        In diesem Ratgeber findest du den ehrlichen Vergleich aller Methoden - mit Vor- und
        Nachteilen, typischen Sitzungszahlen, Kosten und realistischen Erwartungen.
      </p>

      <TableOfContents sections={SECTIONS} />

      <h2 id="uebersicht" className="art-h2">Übersicht: Welche Methode für welchen Befund?</h2>
      <MethodOverviewTable />

      <p className="art-p">
        <strong>Wichtig zur Einordnung:</strong> Die "richtige" Methode steht erst nach der
        Voruntersuchung mit Duplex-Sonografie fest. Eine seriöse Praxis empfiehlt nicht ohne
        Befundbild - wer dir am Telefon schon eine Methode verkauft, ist ein Warnsignal.
      </p>

      <CTABox
        heading="Spezialisierte Praxis in deiner Stadt finden"
        text="Über 200 geprüfte Praxen für Besenreiser-Behandlung - mit angebotenen Methoden im Überblick."
        ctaText="Praxis finden"
        ctaHref={CTA_HREF}
        trackName="methoden-mid-1"
      />

      <h2 id="leitlinien" className="art-h2">Was die medizinischen Leitlinien sagen</h2>
      <p className="art-p">
        Bevor wir in die einzelnen Methoden einsteigen: Es gibt eine offizielle Empfehlung der
        wissenschaftlichen medizinischen Fachgesellschaften. Die <strong>S1-Leitlinie zur
        Sklerosierungsbehandlung der Varikose</strong> der Deutschen Gesellschaft für Phlebologie
        nennt die <strong>Sklerotherapie (Verödung) als Methode der ersten Wahl</strong> bei
        Besenreisern. Das heißt nicht, dass Laser schlecht ist - es heißt, dass die Verödung
        wissenschaftlich am breitesten belegt ist und in den meisten Fällen funktioniert.
      </p>
      <p className="art-p">
        Der Laser hat seine eigene Berechtigung - aber bei einer ganz bestimmten Untergruppe von
        Besenreisern. Welche das ist, klären wir gleich.
      </p>
      <p className="art-p">
        Wer die Behandlung durchführt, ist ebenso entscheidend wie die gewählte Methode. Welche
        Facharztrichtungen für Besenreiser infrage kommen und worauf du bei der Praxis-Wahl
        achten solltest, erklären wir im Ratgeber{' '}
        <Link to="/ratgeber/welcher-arzt-besenreiser" style={linkStyle}>
          Welcher Arzt entfernt Besenreiser?
        </Link>
      </p>

      <h2 id="besenreiser-veroeden" className="art-h2">Methode 1: Verödung (Sklerotherapie)</h2>
      <p className="art-p">
        Die Verödung - fachsprachlich Sklerotherapie oder bei kleinsten Gefäßen
        Mikro-Sklerotherapie - ist seit über 150 Jahren etabliert und das in Deutschland mit
        Abstand häufigste Verfahren zur Besenreiser-Behandlung.
      </p>

      <h3 className="art-h3">Wie läuft die Verödung ab?</h3>
      <p className="art-p">
        Mit einer sehr feinen Nadel wird ein Verödungsmittel direkt in den Besenreiser injiziert.
        In Deutschland wird dafür meistens <strong>Polidocanol</strong> verwendet (Konzentrationen
        zwischen 0,25 % und 1 %, je nach Größe der zu behandelnden Vene). Der Wirkstoff reizt die
        Innenwand der Vene und löst eine kontrollierte Entzündung aus. Diese führt dazu, dass die
        Venenwände miteinander verkleben. Das Gefäß wird vom Körper über mehrere Wochen abgebaut.
      </p>
      <p className="art-p">
        Eine einzelne Sitzung dauert in der Regel 15 bis 20 Minuten. An beiden Beinen können in
        einer Sitzung mehrere Besenreiser-Areale behandelt werden. Nach der Behandlung sollten
        Kompressionsstrümpfe für eine bis drei Wochen getragen werden - das verbessert das
        Ergebnis und reduziert Nebenwirkungen wie Hyperpigmentierung (vorübergehende bräunliche
        Verfärbungen).
      </p>

      <h3 className="art-h3">Für welche Besenreiser ist die Verödung geeignet?</h3>
      <ul style={ulStyle}>
        <li style={liStyle}>Mittlere und größere Besenreiser</li>
        <li style={liStyle}>Retikuläre Varizen (kleine bläuliche Netzvenen, die oft Nährvenen für Besenreiser sind)</li>
        <li style={liStyle}>Tiefer liegende Gefäße, die der Laser nicht erreicht</li>
        <li style={liStyle}>Besenreiser mit ausgeprägter Blaufärbung</li>
      </ul>

      <h3 className="art-h3">Vor- und Nachteile auf einen Blick</h3>
      <p className="art-p">
        <strong>Vorteile:</strong> Wissenschaftlich am breitesten belegt, geeignet für die meisten
        Befunde, vergleichsweise günstig, kann auch tiefere Nährvenen mitbehandeln (das ist
        wichtig, weil unbehandelte Nährvenen oft der Grund für wiederkehrende Besenreiser sind).
      </p>
      <p className="art-p">
        <strong>Nachteile:</strong> 2-5 Sitzungen nötig, in seltenen Fällen vorübergehende
        Hyperpigmentierung oder kleine Blutergüsse, sehr feine oberflächliche Besenreiser
        sprechen schlechter an als auf den Laser.
      </p>

      <h3 className="art-h3">Erfolgsquote</h3>
      <p className="art-p">
        Bei sachgerechter Durchführung erzielt die Verödung eine <strong>Besserung von über 90
        %</strong> des behandelten Areals. Wichtig: "Besserung" heißt nicht zwangsläufig
        "vollständig verschwunden". Bei manchen Patientinnen und Patienten bleiben feine Reste
        sichtbar, die dann mit dem Laser nachbehandelt werden können.
      </p>

      <h2 id="schaumveroedung" className="art-h2">Methode 2: Schaumverödung</h2>
      <p className="art-p">
        Die Schaumverödung - auch Schaumsklerosierung - ist eine Weiterentwicklung der
        klassischen Verödung. Statt einer flüssigen Lösung wird ein <strong>Mikroschaum</strong>
        in die Besenreiser injiziert.
      </p>

      <h3 className="art-h3">Wie funktioniert die Schaumverödung?</h3>
      <p className="art-p">
        Das Verödungsmittel (meist ebenfalls Polidocanol) wird mit Luft oder einem Gas zu einem
        stabilen Schaum aufgeschlagen - kurz vor der Injektion in der Praxis. Der Schaum hat zwei
        Vorteile gegenüber der flüssigen Form: Er <strong>verteilt sich gleichmäßiger</strong> in
        der Vene und <strong>haftet besser an der Gefäßwand</strong>. Dadurch wirkt das Mittel
        präziser und intensiver.
      </p>
      <p className="art-p">
        In der Praxis bedeutet das: Mit Schaumverödung kommen viele Praxen mit <strong>1 bis 3
        Sitzungen</strong> aus, wo bei der klassischen Verödung 3 bis 5 nötig wären. Weniger
        Sitzungen - aber pro Sitzung etwas teurer.
      </p>

      <h3 className="art-h3">Für welche Besenreiser ist Schaumverödung geeignet?</h3>
      <ul style={ulStyle}>
        <li style={liStyle}>Etwas größere Besenreiser</li>
        <li style={liStyle}>Retikuläre Varizen (Nährvenen)</li>
        <li style={liStyle}>Tiefer liegende Gefäße</li>
        <li style={liStyle}>Patienten, die möglichst wenige Sitzungen wollen</li>
      </ul>

      <h3 className="art-h3">Vor- und Nachteile</h3>
      <p className="art-p">
        <strong>Vorteile:</strong> Weniger Sitzungen als klassische Verödung, oft präziseres
        Ergebnis bei größeren Besenreisern, gleiche wissenschaftliche Basis wie klassische
        Verödung.
      </p>
      <p className="art-p">
        <strong>Nachteile:</strong> Etwas höhere Kosten pro Sitzung, bei sehr feinen
        oberflächlichen Besenreisern nicht immer erste Wahl, Hyperpigmentierung möglich (wie bei
        klassischer Verödung).
      </p>

      <h2 id="besenreiser-lasern" className="art-h2">Methode 3: Laserbehandlung (Nd:YAG)</h2>
      <p className="art-p">
        Der Laser ist das jüngste der drei etablierten Verfahren und in der Werbung oft das
        sichtbarste. Die Realität ist nüchterner als das Marketing: Der Laser hat klare Stärken,
        aber auch klare Grenzen.
      </p>

      <h3 className="art-h3">Wie funktioniert die Laserbehandlung?</h3>
      <p className="art-p">
        Bei der Lasertherapie wird ein <strong>Nd:YAG-Laser</strong> (Neodym-dotierter
        Yttrium-Aluminium-Granat-Laser) eingesetzt - das ist der medizinische Goldstandard für
        die Besenreiser-Behandlung. Der Laserstrahl gibt Lichtenergie ab, die vom Blutfarbstoff
        (Hämoglobin) in den Besenreisern absorbiert wird. Das Blut erhitzt sich, die Gefäßwand
        erwärmt sich, und das Gefäß wird verschlossen. Der Körper baut die verschlossene Vene
        anschließend ab.
      </p>
      <p className="art-p">
        Eine Sitzung dauert je nach Größe des behandelten Bereichs 10 bis 30 Minuten. Anders als
        bei der Verödung wird <strong>kein Mittel injiziert</strong> - das ist der Hauptvorteil
        bei Patientinnen und Patienten mit Allergien oder Spritzenangst. Eine Kompression nach
        der Behandlung ist nicht zwingend nötig.
      </p>

      <h3 className="art-h3">Für welche Besenreiser ist der Laser geeignet?</h3>
      <p className="art-p">
        Hier liegt der entscheidende Punkt, der oft falsch dargestellt wird: Der Laser ist
        <strong> nur bei sehr feinen, oberflächlichen Besenreisern erste Wahl</strong>. Konkret:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}>Sehr feine Besenreiser bis ca. 0,1 mm Durchmesser</li>
        <li style={liStyle}>Vereinzelte oberflächliche Gefäße in der obersten Hautschicht</li>
        <li style={liStyle}>Besenreiser im Gesicht (wo Verödung schwieriger ist)</li>
        <li style={liStyle}>Patienten mit Allergie gegen Verödungsmittel</li>
      </ul>

      <h3 className="art-h3">Wo der Laser an Grenzen stößt</h3>
      <p className="art-p">
        Der Laser dringt nicht tief genug in die Haut ein, um <strong>Nährvenen</strong>{' '}
        mitzubehandeln. Nährvenen sind die größeren Gefäße, die Besenreiser mit Blut versorgen.
        Wenn diese unbehandelt bleiben, entstehen die Besenreiser oft nach einigen Monaten erneut
        - im selben Areal. Das ist der häufigste Grund, warum reine Laserbehandlungen bei
        größeren Befunden enttäuschen.
      </p>
      <p className="art-p">
        Außerdem sprechen <strong>größere, blau gefärbte Besenreiser</strong> auf den Laser meist
        schlecht an. Wer solche Befunde hat und auf reinen Laser setzt, zahlt für eine Behandlung,
        deren Ergebnis hinter der Erwartung zurückbleibt.
      </p>

      <h3 className="art-h3">Vor- und Nachteile</h3>
      <p className="art-p">
        <strong>Vorteile:</strong> Kein körperfremder Stoff (keine Allergie-Risiken), kein
        Kompressionsstrumpf zwingend nötig, sehr präzise bei feinsten Gefäßen, im Gesicht oft
        alternativlos.
      </p>
      <p className="art-p">
        <strong>Nachteile:</strong> Bei tieferen Befunden nicht ausreichend, Behandlung nur in
        der dunklen Jahreszeit empfohlen (UV-Schutz nach der Behandlung nötig), kann leichte
        Schmerzen während der Behandlung verursachen, Pigmentstörungen in seltenen Fällen.
      </p>

      <h3 className="art-h3">Wann der Laser wirklich glänzt</h3>
      <p className="art-p">
        Wenn du ausschließlich feine, oberflächliche Besenreiser hast, ist der Laser oft die
        effizienteste Methode - mit 2 bis 4 Sitzungen ist das Ergebnis meist erreicht, ohne
        Spritzen, ohne Kompression. Bei gemischten Befunden glänzt er als <strong>Ergänzung zur
        Verödung</strong>, nicht als Ersatz.
      </p>

      <CTABox
        heading="Praxen mit allen Methoden im Haus finden"
        text="Praxen, die Verödung und Laser im Haus haben, können methodenneutral beraten - das ist der wichtigste Qualitätsfaktor."
        ctaText="Praxen vergleichen"
        ctaHref={CTA_HREF}
        trackName="methoden-mid-2"
      />

      <h2 id="entscheidungshilfe" className="art-h2">Verödung oder Laser? Die ehrliche Entscheidungshilfe</h2>
      <p className="art-p">
        Hier die Logik, nach der eine seriöse Praxis entscheidet:
      </p>
      <p className="art-p">
        <strong>Großer, blau gefärbter, tiefer Befund</strong> → Verödung oder Schaumverödung.
        Der Laser kommt da nicht ran.
      </p>
      <p className="art-p">
        <strong>Sehr feiner, oberflächlicher Befund</strong> → Laser ist effizienter, weil
        weniger Sitzungen und keine Spritzen.
      </p>
      <p className="art-p">
        <strong>Gemischter Befund (häufigster Fall)</strong> → Kombinationsbehandlung. Erst
        Verödung der größeren Gefäße und Nährvenen, anschließend Laser für die feinsten Reste.
        Das ist meist das ästhetisch beste Endergebnis.
      </p>
      <p className="art-p">
        <strong>Allergie gegen Polidocanol</strong> → Laser ist Pflicht, weil Verödung nicht
        möglich.
      </p>
      <p className="art-p">
        <strong>Schwangerschaft oder Stillzeit</strong> → Keine Behandlung. Beide Verfahren sind
        in dieser Zeit kontraindiziert.
      </p>
      <p className="art-p">
        Was du <em>nicht</em> tun solltest: Eine Methode wählen, weil eine Praxis sie besonders
        bewirbt. Praxen, die ausschließlich Laser anbieten, werden dir mit hoher
        Wahrscheinlichkeit Laser empfehlen - auch wenn Verödung besser zu deinem Befund passen
        würde. Genau deshalb sind Praxen mit beiden Verfahren im Haus die besseren Anlaufstellen.
      </p>

      <h2 id="kosten" className="art-h2">Was die Methoden kosten</h2>
      <p className="art-p">
        Eine kompakte Kostenübersicht (ausführliche Variante mit allen Details findest du in
        unserem{' '}
        <Link to="/ratgeber/besenreiser-entfernen-kosten" style={linkStyle}>
          Ratgeber zu den Besenreiser-Kosten
        </Link>
        ):
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}><strong>Verödung:</strong> 80-220 € pro Sitzung, 2-5 Sitzungen → Gesamt 250-900 €</li>
        <li style={liStyle}><strong>Schaumverödung:</strong> 150-250 € pro Sitzung, 1-3 Sitzungen → Gesamt 250-700 €</li>
        <li style={liStyle}><strong>Laser (Nd:YAG):</strong> 150-300 € pro Sitzung, 2-4 Sitzungen → Gesamt 400-1.200 €</li>
        <li style={liStyle}><strong>Kombination:</strong> 200-350 € pro Sitzung, 2-4 Sitzungen → Gesamt 500-1.400 €</li>
      </ul>
      <p className="art-p">
        Die gesetzliche Krankenkasse übernimmt diese Kosten in der Regel <strong>nicht</strong>,
        da Besenreiser als kosmetisches Problem gelten. Privatversicherte sollten ihre
        Tarifbedingungen prüfen.
      </p>

      <h2 id="andere-methoden" className="art-h2">Methoden außerhalb des Standards</h2>
      <p className="art-p">
        Es gibt weitere Verfahren, die teilweise beworben werden, aber wissenschaftlich weniger
        fundiert sind oder nur für spezielle Fälle infrage kommen:
      </p>
      <p className="art-p">
        <strong>Radiofrequenztherapie:</strong> Bei kleinen Besenreisern teils eingesetzt, in
        Deutschland aber selten. Nicht der Standard, kann in Einzelfällen sinnvoll sein.
      </p>
      <p className="art-p">
        <strong>Diodenlaser:</strong> Eine Alternative zum Nd:YAG-Laser, vor allem bei sehr
        feinen oberflächlichen Besenreisern. Wirksam, aber Nd:YAG ist bei tieferen Gefäßen meist
        überlegen.
      </p>
      <p className="art-p">
        <strong>IPL (Intense Pulsed Light):</strong> Wird teilweise in Kosmetikstudios angeboten.
        Für medizinische Besenreiser-Behandlung an den Beinen ist IPL <strong>keine empfohlene
        Methode</strong> - die Eindringtiefe ist zu gering und die Wellenlängen sind
        unspezifischer als beim medizinischen Laser. Für Besenreiser im Gesicht kann IPL
        ausnahmsweise eine Option sein.
      </p>
      <p className="art-p">
        <strong>Hausmittel und Cremes:</strong> Apfelessig, Kartoffelschalen, Roßkastanien-Salbe -
        all das kann <strong>bestehende Besenreiser nicht entfernen</strong>. Was solche
        Hausmittel können: Die Entstehung neuer Besenreiser über Durchblutungsförderung etwas
        verzögern. Bei bereits sichtbaren Besenreisern führt kein Weg an einer der oben
        beschriebenen medizinischen Methoden vorbei.
      </p>
      <p className="art-p">
        <strong>Blutegel-Therapie:</strong> Wird vereinzelt angeboten, hat aber keine
        wissenschaftliche Evidenz für eine dauerhafte Wirkung bei Besenreisern. Nicht empfohlen.
      </p>

      <h2 id="nach-der-behandlung" className="art-h2">Was passiert nach der Behandlung?</h2>
      <p className="art-p">
        Egal welche Methode: Die Besenreiser sind nicht sofort weg. Was du erwarten solltest:
      </p>
      <p className="art-p">
        <strong>Direkt nach der Behandlung:</strong> Die behandelten Areale sehen oft{' '}
        <em>schlimmer</em> aus als vorher - leichte Rötungen, kleine Blutergüsse, manchmal kurze
        Verfärbungen. Das ist normal und klingt innerhalb von 1-3 Wochen ab.
      </p>
      <p className="art-p">
        <strong>Nach 4-6 Wochen:</strong> Erste deutliche Besserung sichtbar. Die Verödung wirkt
        nicht sofort, sondern über mehrere Wochen, weil der Körper das verödete Gefäß abbauen
        muss.
      </p>
      <p className="art-p">
        <strong>Nach 3-6 Monaten:</strong> Endgültiges Ergebnis sichtbar. Bei guten Befunden sind
        80-95 % der behandelten Besenreiser verschwunden. Reste werden in einer Folgesitzung
        nachbehandelt.
      </p>
      <p className="art-p">
        <strong>Nach Jahren:</strong> Neue Besenreiser können entstehen. Die <em>behandelten</em>{' '}
        sind dauerhaft weg, aber die Veranlagung ändert sich nicht. Plane gedanklich ein, dass du
        in 5 bis 10 Jahren möglicherweise eine kleine Auffrischung brauchst.
      </p>

      <h2 id="praxis-wahl" className="art-h2">Worauf solltest du bei der Praxis-Wahl achten?</h2>
      <p className="art-p">
        Drei harte Qualitätsmerkmale, die du prüfen kannst (mehr Details in unserem{' '}
        <Link to="/ratgeber/welcher-arzt-besenreiser" style={linkStyle}>
          Ratgeber zur Arztwahl
        </Link>
        ):
      </p>
      <p className="art-p">
        <strong>1. Voruntersuchung mit Duplex-Sonografie.</strong> Eine Praxis, die ohne
        Ultraschall-Abklärung direkt zur Behandlung übergeht, übersieht möglicherweise
        zugrundeliegende Venenprobleme. Das ist ein klares Warnsignal.
      </p>
      <p className="art-p">
        <strong>2. Methodenvielfalt im Haus.</strong> Praxen mit <em>beiden</em> Hauptmethoden
        (Verödung + Laser) können neutraler beraten. Wer nur einen Hammer hat, sieht überall
        Nägel.
      </p>
      <p className="art-p">
        <strong>3. Erfahrung mit deinem Befundtyp.</strong> Bei großflächigen Befunden willst du
        eine Praxis, die das regelmäßig macht - nicht jemanden, der hauptsächlich kleine
        Einzelfälle behandelt.
      </p>

      <h2 id="faq" className="art-h2">Häufig gestellte Fragen</h2>
      <FAQSection faqs={FAQS} />

      <h2 id="wie-vorgehen" className="art-h2">So gehst du jetzt am besten vor</h2>
      <p className="art-p">
        <strong>1. Voruntersuchung machen lassen.</strong> Egal welche Methode: Schritt eins ist
        immer eine Duplex-Sonografie, um zu sehen, was unter der Hautoberfläche passiert. Erst
        danach lässt sich seriös sagen, welche Methode für deinen Befund passt.
      </p>
      <p className="art-p">
        <strong>2. Praxis mit beiden Methoden suchen.</strong> Praxen, die sowohl Verödung als
        auch Laser im Haus haben, können neutraler beraten. Bei reinen Laserpraxen oder reinen
        Verödungspraxen besteht das Risiko, dass die Methodenwahl nach Verfügbarkeit statt nach
        Befund erfolgt.
      </p>
      <p className="art-p">
        <strong>3. Realistische Erwartungen mitbringen.</strong> Niemand garantiert dir 100 %
        perfekte Beine in einer Sitzung. Was eine seriöse Behandlung dir gibt: Über mehrere
        Sitzungen ein deutlich besseres Hautbild, das mehrere Jahre hält. Das ist viel - aber
        kein Wunder.
      </p>
    </ArticleLayout>
  )
}

const ulStyle: React.CSSProperties = {
  fontFamily: 'Georgia, serif',
  fontSize: '19px',
  lineHeight: 1.75,
  color: '#333',
  margin: '0 0 1.4em',
  paddingLeft: '24px',
}

const liStyle: React.CSSProperties = { marginBottom: '10px' }

const linkStyle: React.CSSProperties = { color: '#003399', textDecoration: 'underline' }
