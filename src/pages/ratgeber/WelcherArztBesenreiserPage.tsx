import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import ArticleLayout from './ArticleLayout'
import { CTABox, FAQSection, TableOfContents, type FAQItem, type TocSection } from './components'
import { sendEvent } from '../../lib/gtm'

const CTA_HREF = '/praxen?utm_source=fb&utm_medium=ratgeber&utm_campaign=arzt'

const SLUG = 'welcher-arzt-besenreiser'
const URL = `https://www.besenreiser-check.de/ratgeber/${SLUG}`

const SECTIONS: TocSection[] = [
  { id: 'phlebologe-zusatz', label: 'Phlebologe ist kein eigener Facharzt - sondern Zusatzqualifikation' },
  { id: 'fachrichtungen', label: 'Welche Facharztrichtungen kommen für Besenreiser infrage?' },
  { id: 'spezialisierung', label: 'Was wichtiger ist als der Facharzttitel: Die Spezialisierung der Praxis' },
  { id: 'wann-arzt', label: 'Wann ein Arztbesuch wirklich nötig ist - und wann nicht' },
  { id: 'praxis-finden', label: 'Wie findest du die richtige Praxis?' },
  { id: 'erstberatung', label: 'Erstberatung: Was solltest du fragen?' },
  { id: 'faq', label: 'Häufig gestellte Fragen zu Arzt & Praxiswahl' },
  { id: 'einfacher-weg', label: 'Der einfache Weg zur richtigen Praxis' },
]

const FAQS: FAQItem[] = [
  {
    q: 'Welcher Arzt entfernt Besenreiser?',
    a: 'In der Regel ein Arzt oder eine Ärztin mit der Zusatzweiterbildung Phlebologie - meistens auf Basis einer dermatologischen, internistischen oder gefäßchirurgischen Facharztausbildung. Wichtig ist nicht der ursprüngliche Facharzttitel, sondern die konkrete Erfahrung mit Besenreiser-Behandlungen und die im Haus verfügbaren Methoden.',
  },
  {
    q: 'Ist ein Phlebologe besser als ein Hautarzt?',
    a: 'Nicht zwangsläufig. Viele Hautärzte sind gleichzeitig Phlebologen - also Hautärzte mit der Zusatzweiterbildung Venenheilkunde. Diese Kombination ist für Besenreiser-Behandlungen sehr häufig und meist gut geeignet. Reine Hautärzte ohne phlebologische Zusatzqualifikation sind dagegen eher nicht die richtige Wahl, weil ihnen die spezifische Venen-Expertise fehlt.',
  },
  {
    q: 'Was kostet die Erstberatung beim Phlebologen?',
    a: 'Die Erstberatung bei einem Phlebologen kostet in der Regel zwischen 50 und 100 €, in spezialisierten Privatpraxen auch mehr. Falls eine medizinische Indikation vorliegt, kann die Beratung von der gesetzlichen Krankenkasse übernommen werden. Reine ästhetische Beratungen sind grundsätzlich Privatleistung. Eine ausführliche Übersicht der Behandlungs- und Beratungskosten findest du im Ratgeber Besenreiser entfernen: Kosten 2026.',
    aNode: (
      <>
        Die Erstberatung bei einem Phlebologen kostet in der Regel zwischen 50 und 100 €, in
        spezialisierten Privatpraxen auch mehr. Falls eine medizinische Indikation vorliegt, kann
        die Beratung von der gesetzlichen Krankenkasse übernommen werden. Reine ästhetische
        Beratungen sind grundsätzlich Privatleistung. Eine ausführliche Übersicht der Behandlungs-
        und Beratungskosten findest du im Ratgeber{' '}
        <Link to="/ratgeber/besenreiser-entfernen-kosten" style={{ color: '#003399', textDecoration: 'underline' }}>
          Besenreiser entfernen: Kosten 2026
        </Link>.
      </>
    ),
  },
  {
    q: 'Übernimmt die Krankenkasse den Phlebologen-Besuch?',
    a: 'Die Untersuchung mit Duplex-Sonografie wird häufig übernommen, wenn ein medizinischer Verdacht besteht - etwa bei Beschwerden oder dem Verdacht auf Krampfadern. Die eigentliche Besenreiser-Behandlung wird von der gesetzlichen Krankenkasse in der Regel nicht erstattet, da sie als kosmetisch eingestuft wird.',
  },
  {
    q: 'Brauche ich eine Überweisung vom Hausarzt?',
    a: 'In Deutschland brauchst du als gesetzlich Versicherter formal keine Überweisung, um einen Phlebologen aufzusuchen - Phlebologen sind oft direkt zugängliche Fachärzte. In manchen Bundesländern und bei manchen Krankenkassen ist eine Überweisung aber sinnvoll, um die Kosten der Voruntersuchung erstattet zu bekommen. Privatversicherte können in der Regel direkt einen Termin vereinbaren.',
  },
  {
    q: 'Was ist der Unterschied zwischen Phlebologe und Angiologe?',
    a: 'Ein Angiologe befasst sich mit allen Gefäßen - also sowohl Arterien als auch Venen und Lymphgefäßen. Ein Phlebologe konzentriert sich speziell auf Venenerkrankungen. Für Besenreiser ist der Phlebologe der spezifischere Ansprechpartner.',
  },
  {
    q: 'Kann mein Hausarzt Besenreiser selbst behandeln?',
    a: 'In den allermeisten Fällen nein. Hausärzte ohne phlebologische Zusatzweiterbildung führen Verödungen oder Laserbehandlungen normalerweise nicht durch - das ist eine spezialisierte Tätigkeit. Hausärzte mit Phlebologie-Zusatz gibt es, sind aber die Ausnahme. Im Zweifelsfall fragst du deinen Hausarzt direkt.',
  },
  {
    q: 'Ist eine Behandlung bei einer Schönheitsklinik sinnvoll?',
    a: 'Manche Schönheitskliniken bieten Besenreiser-Entfernung an, oft mit Lasertechnologie. Qualität und Erfahrung schwanken hier aber stärker als bei spezialisierten phlebologischen Praxen. Wichtig ist, dass die Behandlung von einem qualifizierten Arzt oder einer Ärztin durchgeführt wird - nicht von Kosmetikpersonal.',
  },
]

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: 'Welcher Arzt entfernt Besenreiser? Phlebologe, Dermatologe oder Hautarzt',
      description: 'Welcher Facharzt ist die richtige Anlaufstelle für Besenreiser? Wir erklären die Unterschiede zwischen Phlebologe, Dermatologe und Hausarzt - und worauf du bei der Praxis-Wahl achten solltest.',
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
        { '@type': 'ListItem', position: 3, name: 'Welcher Arzt entfernt Besenreiser?', item: URL },
      ],
    },
  ],
}

export default function WelcherArztBesenreiserPage() {
  useEffect(() => {
    sendEvent('ViewContent', {
      content_type: 'ratgeber',
      content_name: `ratgeber-${SLUG}`,
      content_category: 'ratgeber',
    })
  }, [])

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
        pageTitle: 'Welcher Arzt entfernt Besenreiser? Phlebologe oder Hautarzt | Besenreiser-Check',
        pageDescription: 'Welcher Facharzt ist die richtige Anlaufstelle für Besenreiser? Phlebologe, Dermatologe oder Hausarzt - wir erklären die Unterschiede und worauf du bei der Praxis-Wahl achten solltest.',
        canonicalPath: `/ratgeber/${SLUG}`,
        schemaData: SCHEMA,
      }}
      breadcrumb={[
        { label: 'Ratgeber', href: '/ratgeber' },
        { label: 'Welcher Arzt entfernt Besenreiser?' },
      ]}
      category="Ratgeber"
      date="3. Mai 2026"
      readTime="8 Min Lesezeit"
      title="Welcher Arzt entfernt Besenreiser?"
      subtitle="Die richtige Anlaufstelle ist ein Arzt oder eine Ärztin mit Zusatzweiterbildung Phlebologie - meistens Dermatologen, Internisten oder Gefäßchirurgen. Was die Bezeichnung wirklich bedeutet, und warum die Erfahrung der Praxis am Ende mehr zählt als der Facharzttitel."
      authorLine="Redaktion Besenreiser-Check.de"
      ctaHref={CTA_HREF}
      ctaBody="Über 200 spezialisierte Praxen für Besenreiser-Behandlung in Deutschland - mit Bewertungen, Methoden und Standorten."
      onCtaClick={() => sendEvent('RatgeberCtaClick', { content_name: 'arzt-layout-bottom' })}
    >
      <p className="art-p">
        <strong>Kurz vorab:</strong> Die richtige Anlaufstelle für eine Besenreiser-Behandlung ist
        ein Arzt oder eine Ärztin mit der Zusatzweiterbildung <strong>Phlebologie</strong> - also
        ein Spezialist oder eine Spezialistin für Venenheilkunde. In der Praxis sind das meist
        Dermatologen, Internisten oder Gefäßchirurgen mit dieser Zusatzqualifikation. Reine
        Hausärzte führen die Behandlung selbst nicht durch, können dich aber zu spezialisierten
        Praxen überweisen.
      </p>
      <p className="art-p">
        Die kurze Antwort führt aber leicht in die Irre, weil "Phlebologe" oft missverstanden
        wird. In diesem Ratgeber erklären wir, was die Bezeichnung wirklich bedeutet, welche
        Facharztrichtungen für die Behandlung infrage kommen - und warum die <em>individuelle
        Spezialisierung</em> der Praxis am Ende wichtiger ist als der formale Facharzttitel.
      </p>

      <TableOfContents sections={SECTIONS} />

      <h2 id="phlebologe-zusatz" className="art-h2">Phlebologe ist kein eigener Facharzt - sondern eine Zusatzqualifikation</h2>
      <p className="art-p">
        Das ist der wichtigste Punkt vorab und der häufigste Irrtum: <strong>"Phlebologe" ist
        keine eigene Facharztrichtung im deutschen Weiterbildungssystem.</strong> Es gibt also
        keinen "Facharzt für Phlebologie" wie es einen Facharzt für Dermatologie oder Innere
        Medizin gibt. Phlebologie ist eine <strong>Zusatzweiterbildung</strong>, die ein Arzt
        oder eine Ärztin nach Abschluss der eigentlichen Facharztausbildung erwerben kann.
      </p>
      <p className="art-p">
        Diese Zusatzweiterbildung wird laut der Deutschen Gesellschaft für Phlebologie und
        Lymphologie am häufigsten von folgenden Fachrichtungen absolviert:
      </p>
      <ul style={ulStyle}>
        <li style={liStyle}>
          <strong>Dermatologie</strong> (Hautärzte) - häufigste Kombination, weil viele
          Venenbehandlungen ohnehin in dermatologischen Praxen stattfinden
        </li>
        <li style={liStyle}>
          <strong>Innere Medizin / Allgemeinmedizin</strong> - mit Schwerpunkt Gefäßmedizin
        </li>
        <li style={liStyle}>
          <strong>Gefäßchirurgie</strong> - besonders bei größeren Krampfadern und operativen
          Eingriffen
        </li>
        <li style={liStyle}>
          <strong>Allgemeinchirurgie</strong> - seltener, aber möglich
        </li>
      </ul>
      <p className="art-p">
        Was das für dich bedeutet: Wenn du eine "Phlebologische Praxis" findest, weißt du noch
        nicht automatisch, ob die behandelnde Person einen dermatologischen oder internistischen
        Hintergrund hat. Beide können dich kompetent behandeln - die <em>Erfahrung mit
        Besenreisern</em> zählt mehr als die ursprüngliche Facharztrichtung.
      </p>

      <h2 id="fachrichtungen" className="art-h2">Welche Facharztrichtungen kommen für Besenreiser infrage?</h2>

      <h3 className="art-h3">Dermatologe / Hautarzt mit Phlebologie-Zusatz</h3>
      <p className="art-p">
        Das ist in Deutschland die <strong>häufigste Konstellation</strong> für
        Besenreiser-Behandlungen. Dermatologische Praxen mit phlebologischem Schwerpunkt führen
        sowohl Verödung als auch Lasertherapie durch und sind oft auch für die ästhetisch-feinen
        Aspekte einer Behandlung gut ausgestattet.
      </p>
      <p className="art-p">
        <strong>Stark, wenn:</strong> Du primär kosmetisch behandeln möchtest, feine
        oberflächliche Besenreiser hast und Wert auf moderne Lasertechnik legst.
      </p>

      <h3 className="art-h3">Phlebologe mit internistischem Hintergrund</h3>
      <p className="art-p">
        Ein Internist (Facharzt für Innere Medizin) mit Phlebologie-Zusatz behandelt Venenleiden
        oft im breiteren medizinischen Kontext - also nicht nur Besenreiser, sondern auch das
        gesamte Venensystem mit Blick auf mögliche Begleiterkrankungen.
      </p>
      <p className="art-p">
        <strong>Stark, wenn:</strong> Du gleichzeitig Beschwerden wie schwere Beine, Schwellungen
        oder Verdacht auf Krampfadern hast - also wenn die Besenreiser möglicherweise nicht das
        alleinige Problem sind.
      </p>

      <h3 className="art-h3">Gefäßchirurg</h3>
      <p className="art-p">
        Gefäßchirurgen mit Phlebologie-Zusatz sind primär auf operative Eingriffe spezialisiert.
        Für reine Besenreiser brauchst du sie nicht - Besenreiser werden nicht operiert. Wenn
        aber im Vorgespräch festgestellt wird, dass eine größere Krampfader die Ursache ist, wird
        der Gefäßchirurg relevant.
      </p>
      <p className="art-p">
        <strong>Stark, wenn:</strong> Die Besenreiser nur die Spitze des Eisbergs sind und tiefer
        liegende Krampfadern mitbehandelt werden müssen.
      </p>

      <h3 className="art-h3">Hausarzt</h3>
      <p className="art-p">
        Der Hausarzt ist <strong>selten der Behandler</strong>, aber oft der erste richtige
        Ansprechpartner. Er kann eine erste Einschätzung geben, ob ein Behandlungsbedarf besteht,
        und dich an eine spezialisierte Praxis überweisen. Manche Hausärzte mit phlebologischer
        Zusatzweiterbildung führen Verödungen selbst durch - das ist aber die Ausnahme.
      </p>
      <p className="art-p">
        <strong>Stark, wenn:</strong> Du unsicher bist, ob du überhaupt eine Behandlung brauchst,
        oder wenn du eine vertraute Empfehlung möchtest.
      </p>

      <CTABox
        heading="Spezialisierte Praxis in deiner Stadt finden"
        text="Über 200 geprüfte Praxen für Besenreiser-Behandlung - mit Bewertungen, Spezialisierung und Behandlungsmethoden im Überblick."
        ctaText="Praxis finden"
        ctaHref={CTA_HREF}
        trackName="arzt-mid-1"
      />

      <h2 id="spezialisierung" className="art-h2">Was wichtiger ist als der Facharzttitel: Die Spezialisierung der Praxis</h2>
      <p className="art-p">
        Hier liegt der eigentliche Knackpunkt. Egal ob die behandelnde Person ursprünglich
        Dermatologin oder Internist ist - was wirklich zählt, ist die <strong>konkrete Erfahrung
        mit Besenreiser-Behandlungen</strong>. Drei Dinge solltest du prüfen, bevor du dich
        entscheidest:
      </p>
      <p className="art-p">
        <strong>1. Wie häufig wird die Behandlung durchgeführt?</strong>
        <br />
        Eine Praxis, die wöchentlich 20 Besenreiser-Patienten betreut, hat eine andere Routine als
        eine, die das nebenbei zweimal pro Monat anbietet. Frag konkret in der Erstberatung:{' '}
        <em>"Wie viele Besenreiser-Behandlungen führen Sie pro Monat durch?"</em> Eine seriöse
        Praxis wird die Frage nicht ausweichend beantworten.
      </p>
      <p className="art-p">
        <strong>2. Welche Methoden sind im Haus verfügbar?</strong>
        <br />
        Eine Praxis, die <em>nur</em>{' '}
        <Link to="/ratgeber/besenreiser-entfernen-methoden#besenreiser-veroeden" style={{ color: '#003399', textDecoration: 'underline' }}>
          Verödung
        </Link>
        {' '}anbietet, wird dir mit hoher Wahrscheinlichkeit Verödung empfehlen - auch wenn{' '}
        <Link to="/ratgeber/besenreiser-entfernen-methoden#besenreiser-lasern" style={{ color: '#003399', textDecoration: 'underline' }}>
          Laser
        </Link>
        {' '}für deinen Befund besser wäre. Praxen mit beiden Verfahren (Verödung + Laser,
        idealerweise auch Schaumverödung) können neutraler beraten und im Zweifel kombinieren.
        Worin sich die Verfahren genau unterscheiden, erklären wir im{' '}
        <Link to="/ratgeber/besenreiser-entfernen-methoden" style={{ color: '#003399', textDecoration: 'underline' }}>
          Methoden-Vergleich
        </Link>.
      </p>
      <p className="art-p">
        <strong>3. Wird vor der Behandlung eine Duplex-Sonografie gemacht?</strong>
        <br />
        Eine Ultraschalluntersuchung des Venensystems vor der Behandlung ist medizinischer
        Standard und schließt aus, dass tieferliegende Venenprobleme übersehen werden. Praxen,
        die direkt zur Behandlung übergehen, ohne erst zu schauen, was unter der Oberfläche
        passiert, sind ein Warnsignal.
      </p>

      <h2 id="wann-arzt" className="art-h2">Wann ein Arztbesuch wirklich nötig ist - und wann nicht</h2>
      <p className="art-p">
        Nicht jeder Besenreiser braucht ärztliche Behandlung. Drei Szenarien:
      </p>
      <p className="art-p">
        <strong>Reine Ästhetik, keine Beschwerden.</strong> Wenn dich Besenreiser optisch stören,
        aber sonst keine Symptome auftreten, ist die Behandlung eine reine Wellness- bzw.
        ästhetische Entscheidung. Ein Arztbesuch ist nicht zwingend nötig, aber sinnvoll, wenn du
        die Behandlung in Erwägung ziehst.
      </p>
      <p className="art-p">
        <strong>Besenreiser plus Begleiterscheinungen.</strong> Wenn zu den Besenreisern noch
        Symptome hinzukommen - schwere Beine, Schwellungen besonders abends, Spannungsgefühle,
        nächtliche Wadenkrämpfe oder Juckreiz - sollten Besenreiser als möglicher Hinweis auf ein
        tieferliegendes Venenproblem ernst genommen werden. Hier ist der Phlebologe-Besuch
        wirklich angezeigt.
      </p>
      <p className="art-p">
        <strong>Plötzliches, großflächiges Auftreten.</strong> Wenn Besenreiser plötzlich in
        großer Zahl neu auftreten oder sich sehr schnell ausbreiten, lohnt sich eine Abklärung -
        nicht weil die Besenreiser selbst gefährlich sind, sondern weil sie Ausdruck einer
        beginnenden Veneninsuffizienz sein können.
      </p>

      <h2 id="praxis-finden" className="art-h2">Wie findest du die richtige Praxis?</h2>
      <p className="art-p">
        Nachdem klar ist, dass nicht der Facharzttitel allein zählt, sondern die konkrete
        Erfahrung - wie kommst du zu einer guten Praxis?
      </p>
      <p className="art-p">
        <strong>Hausarzt fragen.</strong> Wenn du einen Hausarzt hast, der dich gut kennt, ist
        eine Empfehlung von ihm oft Gold wert. Hausärzte arbeiten meist seit Jahren mit den
        lokalen Spezialisten zusammen und wissen, wer wirklich gut ist - nicht nur, wer am
        lautesten Marketing macht.
      </p>
      <p className="art-p">
        <strong>Online-Bewertungen kritisch lesen.</strong> Bei Google-Bewertungen lohnt sich
        nicht der Blick auf die Sternebewertung allein, sondern auf den <em>Inhalt</em> der
        Bewertungen. Werden konkrete Behandlungserfolge beschrieben? Wird das Beratungsgespräch
        positiv erwähnt? Beschwerden über fehlende Aufklärung sind ein klares Warnsignal.
      </p>
      <p className="art-p">
        <strong>Spezialisierungen vergleichen.</strong> Auf strukturierten Verzeichnissen kannst
        du Praxen nicht nur nach Standort, sondern auch nach angebotenen Methoden, Spezialisierung
        und Bewertungen filtern. Genau dafür gibt es uns: damit du nicht zehn Praxis-Websites
        einzeln durchklicken musst, um die Methoden zu vergleichen.
      </p>

      <CTABox
        heading="Die richtige Praxis für deinen Befund finden"
        text="Vergleiche spezialisierte Praxen nach Stadt, Methoden (Laser, Verödung, Schaumverödung) und Erfahrungen anderer Patienten - an einem Ort."
        ctaText="Praxen vergleichen"
        ctaHref={CTA_HREF}
        trackName="arzt-mid-2"
      />

      <h2 id="erstberatung" className="art-h2">Erstberatung: Was solltest du fragen?</h2>
      <p className="art-p">
        Wenn du beim Termin sitzt, sind das die fünf Fragen, die wirklich Aufschluss geben:
      </p>
      <p className="art-p">
        <strong>"Wie viele Besenreiser-Behandlungen führen Sie pro Monat durch?"</strong>
        <br />
        Konkrete Zahl, keine Verallgemeinerung. Praxen mit Erfahrung antworten ohne Zögern.
      </p>
      <p className="art-p">
        <strong>"Welche Methode würden Sie bei meinem Befund empfehlen - und warum gerade
        diese?"</strong>
        <br />
        Eine gute Antwort begründet die Methodenwahl mit deinem konkreten Befund (Größe, Tiefe,
        Lokalisation der Besenreiser), nicht mit dem, was die Praxis am liebsten macht.
      </p>
      <p className="art-p">
        <strong>"Machen Sie vor der Behandlung eine Duplex-Sonografie?"</strong>
        <br />
        Sollte selbstverständlich sein. Wenn nicht - andere Praxis suchen.
      </p>
      <p className="art-p">
        <strong>"Wie viele Sitzungen werden bei mir voraussichtlich nötig sein, und was sind die
        Gesamtkosten?"</strong>
        <br />
        Eine seriöse Praxis gibt eine ehrliche Spanne. Wer dir versichert "eine Sitzung reicht",
        ist zu vorsichtig mit der Wahrheit. Detaillierte Preisspannen findest du im Ratgeber{' '}
        <Link to="/ratgeber/besenreiser-entfernen-kosten" style={{ color: '#003399', textDecoration: 'underline' }}>
          Besenreiser entfernen: Kosten 2026
        </Link>.
      </p>
      <p className="art-p">
        <strong>"Was passiert, wenn die Besenreiser nach der Behandlung wiederkommen?"</strong>
        <br />
        Manche Praxen bieten Nachbehandlungen zum Vorzugspreis an, andere nicht. Das ist kein
        Dealbreaker, aber gut zu wissen.
      </p>

      <h2 id="faq" className="art-h2">Häufig gestellte Fragen zu Arzt & Praxiswahl</h2>
      <FAQSection faqs={FAQS} />

      <h2 id="einfacher-weg" className="art-h2">Der einfache Weg zur richtigen Praxis</h2>
      <p className="art-p">
        Die Wahl des richtigen Arztes für deine Besenreiser-Behandlung muss nicht kompliziert
        sein. Drei einfache Schritte:
      </p>
      <p className="art-p">
        <strong>1. Klären, was du willst.</strong> Geht es dir rein um Ästhetik, oder hast du auch
        Beschwerden? Bei reiner Ästhetik reicht meist eine dermatologisch-phlebologische Praxis.
        Bei Beschwerden ist eine Praxis mit internistisch-phlebologischem Schwerpunkt oft
        sinnvoller.
      </p>
      <p className="art-p">
        <strong>2. Praxen vergleichen.</strong> Schau nicht nur auf den Standort, sondern auch auf
        die angebotenen Methoden, die Erfahrung und die Bewertungen. Eine Praxis, die alle
        gängigen Verfahren (Verödung, Schaumverödung, Lasertherapie) im Haus hat, kann
        methodenneutral beraten - das ist ein klarer Vorteil.
      </p>
      <p className="art-p">
        <strong>3. Erstberatung nutzen, nicht direkt buchen.</strong> Die Erstberatung ist genau
        dafür da: Du lernst die Praxis kennen, stellst die fünf Fragen aus dem letzten Abschnitt
        - und entscheidest <em>danach</em>, ob du dort behandelt werden willst. Zwei oder drei
        Erstberatungen vor der Entscheidung sind ganz normal.
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
