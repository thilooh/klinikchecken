import { useEffect, useRef } from 'react'
import ArticleLayout from './ArticleLayout'
import { sendEvent } from '../../lib/gtm'

const CTA_HREF =
  '/?utm_source=fb&utm_medium=ratgeber&utm_campaign=praxis-waehlen'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Eine Praxis für Besenreiser wählen: Worauf es wirklich ankommt',
  description:
    'Wie du eine geeignete Praxis für Besenreiser-Behandlung findest. Die fünf wichtigsten Kriterien, sachlich erklärt.',
  datePublished: '2026-03-08',
  author: { '@type': 'Organization', name: 'Besenreiser-Check.de' },
  publisher: {
    '@type': 'Organization',
    name: 'Besenreiser-Check.de',
    url: 'https://www.besenreiser-check.de',
  },
  url: 'https://www.besenreiser-check.de/ratgeber/praxis-waehlen',
}

export default function PraxisWaehlenPage() {
  const fired50  = useRef(false)
  const fired100 = useRef(false)

  // ViewContent on mount
  useEffect(() => {
    sendEvent('ViewContent', {
      content_name: 'ratgeber-praxis-waehlen',
      content_category: 'ratgeber',
    })
  }, [])

  // Scroll-depth tracking
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = (el.scrollTop + el.clientHeight) / el.scrollHeight
      if (!fired50.current && pct >= 0.5) {
        fired50.current = true
        sendEvent('ScrollDepth50', { content_name: 'ratgeber-praxis-waehlen' })
      }
      if (!fired100.current && pct >= 0.99) {
        fired100.current = true
        sendEvent('ScrollDepth100', { content_name: 'ratgeber-praxis-waehlen' })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCtaClick = () => {
    sendEvent('RatgeberCtaClick', { content_name: 'ratgeber-praxis-waehlen' })
  }

  return (
    <ArticleLayout
      meta={{
        pageTitle: 'Besenreiser-Praxis wählen: 5 Kriterien | Besenreiser-Check',
        pageDescription:
          'Wie du eine geeignete Praxis für Besenreiser-Behandlung findest. Die fünf wichtigsten Kriterien, sachlich erklärt.',
        canonicalPath: '/ratgeber/praxis-waehlen',
        schemaData: SCHEMA,
      }}
      breadcrumb={[
        { label: 'Ratgeber', href: '/ratgeber' },
        { label: 'Praxis wählen' },
      ]}
      category="Ratgeber"
      date="8. März 2026"
      readTime="6 Min Lesezeit"
      title="Eine Praxis für Besenreiser wählen: Worauf es wirklich ankommt"
      subtitle="Die Wahl der richtigen Praxis entscheidet mehr über das Ergebnis als die Wahl der Behandlungsmethode. Hier sind die Kriterien, auf die du achten solltest."
      ctaHref={CTA_HREF}
      onCtaClick={handleCtaClick}
    >
      {/* ── Abschnitt 1 ── */}
      <p className="art-p">
        Drei Frauen, drei sehr verschiedene Erfahrungen. Eine ging zum ersten Hautarzt, hörte sich an,
        sie habe "Pech mit den Genen", und verließ die Praxis nach zehn Minuten ungetröstet. Eine andere
        ließ sich behandeln und sieht zwei Jahre später noch immer die bräunlichen Verfärbungen, an denen
        vorher die Besenreiser waren. Eine dritte fand auf den ersten Anlauf eine spezialisierte Praxis,
        drei Sitzungen später waren ihre Beine tatsächlich frei.
      </p>
      <p className="art-p">
        Was diese drei Frauen unterscheidet, ist nicht ihr Glück. Es ist die Praxis, bei der sie gelandet sind.
      </p>
      <p className="art-p">
        Die meisten Frauen, die mit Besenreisern leben, verbringen Jahre mit Cremes, Hausmitteln und
        Kaschierungs-Strategien, bevor sie sich für eine Behandlung entscheiden. Wenn dieser Schritt
        gemacht ist, fühlt sich die Wahl der Praxis oft wie eine Nebenfrage an. Sie ist es nicht.
        Sie ist die wichtigste Entscheidung im ganzen Prozess.
      </p>

      {/* ── Abschnitt 2 ── */}
      <h2 className="art-h2">Warum die Praxis-Wahl so ungewöhnlich wichtig ist</h2>
      <p className="art-p">
        Besenreiser-Behandlungen werden von sehr unterschiedlichen Praxen angeboten: Phlebologen
        (Ärzte, die sich auf Venenerkrankungen spezialisiert haben) behandeln sie ebenso wie
        Dermatologen, allgemeine Hautarztpraxen, ästhetische Kliniken und Beauty-Studios. Die Spannweite
        an Erfahrung, Methodenwahl und Ergebnisqualität ist größer als bei den meisten anderen ärztlichen
        Leistungen.
      </p>
      <p className="art-p">
        Hinzu kommt: Besenreiser-Entfernung gilt als kosmetische Leistung. Die Krankenkasse zahlt nicht.
        Das hat eine paradoxe Folge — der Markt ist weniger reguliert als bei Kassenleistungen, weil
        keine Kostenträger mit einheitlichen Qualitäts-Anforderungen dahinterstehen. Die Verantwortung
        für die Auswahl liegt damit vollständig bei der Patientin. Aber die Kriterien, an denen man eine
        geeignete Praxis erkennt, sind nicht offensichtlich.
      </p>
      <p className="art-p">
        Es lohnt sich, ein wenig Zeit in diese Recherche zu investieren. Eine schlecht gewählte Praxis
        kostet im besten Fall Geld und Wartezeit, im schlechteren Fall hinterlässt sie sichtbare
        Verfärbungen, die für Monate oder Jahre bleiben. Das Ergebnis einer guten Behandlung dagegen
        ist dauerhaft.
      </p>

      <blockquote className="art-pullquote">
        Die Krankenkasse zahlt nicht — was paradoxerweise zur Folge hat, dass der Markt weniger
        reguliert ist als bei Kassenleistungen.
      </blockquote>

      {/* ── Abschnitt 3: 5 Kriterien ── */}
      <h2 className="art-h2">Die fünf Kriterien</h2>

      <h3 className="art-h3">1. Spezialisierung der Praxis</h3>
      <p className="art-p">
        Eine Phlebologie-Praxis, die täglich Venen behandelt, hat fundamental andere Routine als eine
        Beauty-Klinik, die Besenreiser-Behandlung als eine von zwanzig Leistungen anbietet. Routine
        ist hier nicht nur Vorliebe, sondern medizinisch relevant: Erfahrene Ärzte erkennen schneller,
        ob unter den sichtbaren blauen Äderchen eine größere Vene liegt, die das Problem speist. Sie
        wissen, welche Konzentration des Verödungsmittels in welchem Hautareal angemessen ist. Sie haben
        Routine darin, ihre Spritzführung an die Hauttiefe der einzelnen Gefäße anzupassen.
      </p>
      <p className="art-p">Eine Patientin formuliert es so:</p>
      <blockquote className="art-patient-quote">
        "Mein Phlebologe macht das seit 22 Jahren. Nichts anderes. Genau das wollte ich."
      </blockquote>
      <p className="art-p">
        Das ist keine Garantie, aber es ist ein starker Indikator. Je spezialisierter die Praxis,
        desto wahrscheinlicher, dass die Behandlung Routine ist statt Ergänzung.
      </p>

      <h3 className="art-h3">2. Voruntersuchung mit Ultraschall</h3>
      <p className="art-p">
        Bevor Besenreiser behandelt werden, sollte die Praxis prüfen, ob darunter eine größere Vene
        als Quelle dient. Diese Prüfung geschieht per Duplex-Sonographie, einer speziellen Form der
        Ultraschall-Untersuchung. Wenn eine größere Vene als Speiser übersehen wird, kommen die
        Besenreiser an derselben Stelle zurück — manchmal innerhalb weniger Monate. Die Behandlung
        war dann umsonst, weil das eigentliche Problem unbehandelt blieb.
      </p>
      <p className="art-p">
        Eine Praxis, die diesen Schritt überspringt oder als optional darstellt, ist nicht falsch im
        klinischen Sinne — aber sie arbeitet auf einem Standard, der unter dem heutigen Optimum liegt.
        Frag im Vorgespräch konkret nach: Wird vor der Behandlung eine Ultraschall-Untersuchung gemacht,
        und wenn ja, in welcher Form?
      </p>

      <h3 className="art-h3">3. Methode und ihre Anwendung</h3>
      <p className="art-p">
        Der heutige Standard für Besenreiser ist die Verödung (Sklerotherapie) — meist als
        Mikroschaum-Verödung. Dabei wird ein aufgeschäumtes Mittel in das betroffene Gefäß gespritzt,
        das den Körper dazu bringt, das Gefäß abzubauen. Laser-Behandlungen kommen ergänzend zum
        Einsatz, vor allem bei sehr feinen Besenreisern, die zu zart für eine Spritze sind.
      </p>
      <p className="art-p">
        Die Methode allein entscheidet weniger als ihre Anwendung. Eine gute Praxis arbeitet mit
        angepasster Konzentration des Verödungsmittels, behandelt in mehreren kleinen Sitzungen statt
        einem einzigen großen Termin und führt die Spritze mit Ruhe und Präzision. Eine schlechte
        Praxis benutzt Standard-Konzentrationen ohne Anpassung, drängt zu Maximal-Sitzungen mit hoher
        Spritzenzahl und behandelt schnell statt sorgfältig.
      </p>
      <p className="art-p">
        Eine bekannte, aber bei sachgemäßer Behandlung seltene Komplikation sind Pigmentstörungen —
        bräunliche Verfärbungen, die nach der Behandlung an der behandelten Stelle bleiben. Eine
        Patientin beschreibt:
      </p>
      <blockquote className="art-patient-quote">
        "Sie hat die Hose hochgezogen und ich hab nichts mehr gesagt. Dieser braune Schatten,
        der einfach nicht mehr weggeht — das war für mich der Moment, an dem ich verstanden habe:
        Es ist nicht egal, wer das macht."
      </blockquote>
      <p className="art-p">
        Im Vorgespräch sollte die Praxis offen über solche Komplikations-Risiken sprechen, ohne sie
        zu dramatisieren oder zu verharmlosen.
      </p>

      <h3 className="art-h3">4. Aufklärung und Erwartungsmanagement</h3>
      <p className="art-p">
        Eine seriöse Praxis macht keine Heilsversprechen. Sie sagt, was realistisch erreichbar ist und
        was nicht. Sie beschreibt den Behandlungsablauf konkret, erklärt mögliche Komplikationen, und
        gibt einen ehrlichen Zeit- und Sitzungsplan an.
      </p>
      <p className="art-p">
        Ein wichtiges Detail: Behandelte Besenreiser sind tatsächlich weg — der Körper baut die Gefäße
        ab, sie kommen nicht zurück. Aber bei genetischer Veranlagung können neue Besenreiser an anderen
        Stellen entstehen. Das ist kein Versagen der Behandlung, sondern eine biologische Tatsache. Eine
        Praxis, die diesen Unterschied nicht klar kommuniziert, lässt Raum für Enttäuschung.
      </p>
      <p className="art-p">
        Achte im Vorgespräch darauf, wie die Praxis über den Unterschied zwischen "tatsächlich weg"
        und "blasser werden" spricht. Wer hier Ehrlichkeit zeigt, arbeitet seriös.
      </p>

      <h3 className="art-h3">5. Patientinnen-Stimmen, die spezifisch sind</h3>
      <p className="art-p">
        Generische Bewertungen mit fünf Sternen und drei Worten Lob helfen wenig. Aussagekräftig sind
        ausführliche Schilderungen, die konkrete Aspekte beschreiben — die Vorgespräche, die Sitzungen
        selbst, die Nachsorge, mögliche Komplikationen, das Endergebnis nach Monaten.
      </p>
      <p className="art-p">
        Plattformen, die Bewertungen kuratieren statt nur einzusammeln, haben hier einen Mehrwert. Sie
        filtern offensichtlich unsachliche oder gefälschte Einträge heraus und ordnen die verbleibenden
        nach Themen oder nach Verlauf. Wenn du Bewertungen liest, suche nach denen, die nicht nur loben,
        sondern auch beschreiben — und die ehrlich sagen, was nicht optimal lief.
      </p>

      {/* ── Abschnitt 4 ── */}
      <h2 className="art-h2">Wie du jetzt vorgehst</h2>
      <p className="art-p">
        Wer diese Kriterien zur Hand hat, kann die Praxis-Suche in wenigen Schritten strukturieren.
        Recherche der spezialisierten Praxen in der eigenen Stadt, Lesen der konkreten Bewertungen,
        ein Vorgespräch in zwei oder drei Praxen, Vergleich der Eindrücke. Das ist Zeitaufwand, aber
        er rechnet sich — die Behandlung ist eine Investition, die viele Jahre wirkt.
      </p>
      <p className="art-p">
        Eine spezialisierte Vergleichsplattform kann diese Recherche erheblich abkürzen. Sie bündelt
        geprüfte Praxen, sortiert nach relevanten Kriterien und filtert die Optionen auf das, was
        tatsächlich in Frage kommt.
      </p>
    </ArticleLayout>
  )
}
