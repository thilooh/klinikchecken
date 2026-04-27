import { useEffect, useRef } from 'react'
import ArticleLayout from './ArticleLayout'
import { sendEvent } from '../../lib/gtm'

const BASE  = '/ratgeber/final'
const SIZES = '(max-width: 720px) 100vw, 680px'

function ArticleImg({ name, alt }: { name: string; alt: string }) {
  const webp = `${BASE}/${name}-800.webp 800w, ${BASE}/${name}-1200.webp 1200w, ${BASE}/${name}-1800.webp 1800w`
  const jpg  = `${BASE}/${name}-800.jpg 800w, ${BASE}/${name}-1200.jpg 1200w, ${BASE}/${name}-1800.jpg 1800w`
  return (
    <figure style={{ margin: '2.2em 0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#E4EBF5' }}>
      <picture>
        <source type="image/webp" srcSet={webp} sizes={SIZES} />
        <img
          src={`${BASE}/${name}-1200.jpg`}
          srcSet={jpg}
          sizes={SIZES}
          alt={alt}
          loading="lazy"
          style={{ width: '100%', display: 'block', maxHeight: '460px', objectFit: 'cover' }}
        />
      </picture>
    </figure>
  )
}

function PatientQuote({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    <div className="art-quote-box">
      <p>"{quote}"</p>
      <p>{attribution}</p>
    </div>
  )
}

const CTA_HREF  = '/?utm_source=fb&utm_medium=ratgeber&utm_campaign=praxis-waehlen'
const HERO_NAME = 'praxis-waehlen-hero'
const HERO_WEBP = `${BASE}/${HERO_NAME}-800.webp 800w, ${BASE}/${HERO_NAME}-1200.webp 1200w, ${BASE}/${HERO_NAME}-1800.webp 1800w`
const HERO_JPG  = `${BASE}/${HERO_NAME}-800.jpg 800w, ${BASE}/${HERO_NAME}-1200.jpg 1200w, ${BASE}/${HERO_NAME}-1800.jpg 1800w`

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Eine Praxis für Besenreiser wählen: Worauf es wirklich ankommt',
  description: 'Wie du eine geeignete Praxis für die Besenreiser-Behandlung findest. Die fünf wichtigsten Kriterien aus Patientinnen-Sicht.',
  datePublished: '2026-03-08',
  author: { '@type': 'Person', name: 'Martina' },
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

  useEffect(() => {
    sendEvent('ViewContent', {
      content_type: 'ratgeber',
      content_name: 'ratgeber-praxis-waehlen',
      content_category: 'ratgeber',
    })
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const el  = document.documentElement
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

  return (
    <ArticleLayout
      meta={{
        pageTitle: 'Besenreiser-Praxis wählen: 5 Kriterien | Besenreiser-Check',
        pageDescription: 'Wie du eine geeignete Praxis für die Besenreiser-Behandlung findest. Die fünf wichtigsten Kriterien aus Patientinnen-Sicht.',
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
      subtitle="Die meisten Frauen geben mehr Zeit in die Wahl ihres Friseurs als in die Wahl der Praxis, die ihre Beine behandelt. Das ist nachvollziehbar - und es ist der häufigste teure Fehler in diesem Bereich. Hier sind die fünf Kriterien, an denen du eine geeignete Praxis erkennst."
      authorLine="Martina"
      authorImg="/ratgeber/martina.jpg"
      heroSrc={`${BASE}/${HERO_NAME}-1200.jpg`}
      heroWebpSrcset={HERO_WEBP}
      heroJpgSrcset={HERO_JPG}
      heroAlt="Frau sitzt nachdenklich auf einem Holzstuhl vor einem großen hellen Fenster"
      ctaHref={CTA_HREF}
      onCtaClick={() => sendEvent('RatgeberCtaClick', { content_name: 'ratgeber-praxis-waehlen' })}
    >
      {/* ── Einleitung ── */}
      <p className="art-p">
        Drei Frauen, drei sehr verschiedene Geschichten.
      </p>
      <p className="art-p">
        Die erste ging zum nächstgelegenen Hautarzt, hörte sich an, sie habe "Pech mit den Genen",
        und verließ die Praxis nach zehn Minuten - mit dem Eindruck, sie selbst sei das Problem.
      </p>
      <p className="art-p">
        Die zweite ließ sich behandeln und sieht zwei Jahre später noch immer die bräunlichen
        Verfärbungen, an denen vorher die Besenreiser saßen. Eine Komplikation, die bei sachgemäßer
        Behandlung sehr selten vorkommt.
      </p>
      <p className="art-p">
        Die dritte fand auf den ersten Anlauf eine spezialisierte Praxis. Drei Sitzungen später waren
        ihre Beine tatsächlich frei. Nicht blasser. Nicht feiner. Frei.
      </p>
      <p className="art-p">
        Was diese drei Frauen unterscheidet, ist nicht ihr Glück. Es ist die Praxis, bei der sie
        gelandet sind - und wie genau sie vorher hingeschaut haben.
      </p>
      <p className="art-p">
        Besenreiser-Behandlungen werden in Deutschland von Phlebologen, Dermatologen, allgemeinen
        Hautärzten, ästhetischen Kliniken und Beauty-Studios angeboten. Die Spannweite an Erfahrung
        und Ergebnis ist enorm. Und weil die Krankenkasse nicht zahlt, fehlt der einheitliche
        Qualitäts-Filter, den es bei Kassenleistungen gibt.
      </p>

      <p className="art-statement">Die Verantwortung liegt bei dir.</p>

      <p className="art-p">
        Die folgenden fünf Kriterien sind das, worauf erfahrene Patientinnen heute achten - und
        worauf eine gute Praxis von selbst Antworten gibt, ohne dass du fragen musst.
      </p>

      {/* ── Bild 2: Recherche ── */}
      <ArticleImg
        name="praxis-waehlen-recherche"
        alt="Person schreibt handschriftliche Notizen in ein Notizbuch an einem Holztisch am Fenster"
      />

      {/* ── Die fünf Kriterien ── */}
      <h2 className="art-h2">Die fünf Kriterien</h2>

      {/* Kriterium 1 */}
      <h3 className="art-h3">1. Spezialisierung der Praxis</h3>
      <p className="art-lead">
        Eine Praxis, die täglich Venen behandelt, arbeitet anders als eine, die das gelegentlich
        nebenbei macht.
      </p>
      <p className="art-p">
        Phlebologen - also auf Venen spezialisierte Fachärzte - haben Routine darin, die richtige
        Konzentration des Verödungsmittels für das jeweilige Hautareal zu wählen, die Spritze in der
        korrekten Tiefe zu führen, und schon vor der Behandlung zu erkennen, ob unter den sichtbaren
        Besenreisern eine größere Vene als Speiser sitzt.
      </p>
      <p className="art-p">Eine Patientin formuliert es so:</p>
      <PatientQuote
        quote="Mein Phlebologe macht das seit 22 Jahren. Nichts anderes. Genau das wollte ich."
        attribution="B.K., 52, Köln"
      />
      <p className="art-p">
        Faustregel: Je mehr Anteil der Praxis-Tätigkeit auf Venen-Behandlungen entfällt, desto
        wahrscheinlicher ist Routine statt Improvisation.
      </p>

      {/* ── Bild 3: Ultraschall ── */}
      <ArticleImg
        name="praxis-waehlen-ultraschall"
        alt="Arzt führt Ultraschalluntersuchung an einem Patientenbein durch, Tageslicht durch Fenster im Hintergrund"
      />

      {/* Kriterium 2 */}
      <h3 className="art-h3">2. Voruntersuchung mit Ultraschall</h3>
      <p className="art-lead">
        Wer ohne Ultraschall behandelt, behandelt blind.
      </p>
      <p className="art-p">
        Bevor Besenreiser verödet werden, sollte die Praxis prüfen, ob darunter eine größere Vene als
        Quelle dient. Diese Prüfung geschieht per Duplex-Sonographie - einer speziellen Form der
        Ultraschall-Untersuchung. Wenn eine Speiser-Vene übersehen wird, kommen die Besenreiser an
        derselben Stelle innerhalb weniger Monate zurück.
      </p>
      <p className="art-p">
        Das eigentliche Problem bleibt unbehandelt. Die Behandlung war umsonst.
      </p>
      <p className="art-p">
        Praxen, die diesen Schritt überspringen oder als optional darstellen, arbeiten unter dem
        heutigen Optimum. Frag im Vorgespräch konkret: "Wird vor der Behandlung eine
        Duplex-Sonographie gemacht?" Die Antwort sollte ein klares Ja sein.
      </p>

      {/* Kriterium 3 */}
      <h3 className="art-h3">3. Methode und ihre Anwendung</h3>
      <p className="art-lead">
        Die Methode entscheidet weniger als der, der sie anwendet.
      </p>
      <p className="art-p">
        Der heutige Standard ist die Mikroschaum-Verödung: Ein aufgeschäumtes Mittel wird ins
        betroffene Gefäß gespritzt, der Körper baut das Gefäß danach ab. Laser kommt ergänzend zum
        Einsatz, vor allem bei sehr feinen Besenreisern, die zu zart für eine Spritze sind.
      </p>
      <p className="art-p">
        Was eine Praxis von der nächsten unterscheidet, ist nicht die Methode selbst, sondern wie
        sorgfältig sie angewendet wird: angepasste Konzentration des Verödungsmittels statt
        Standard-Dosierung, mehrere kleine Sitzungen statt einer großen, ruhige Spritzenführung statt
        Akkordarbeit.
      </p>
      <p className="art-p">
        Die häufigste Komplikation bei unsachgemäßer Anwendung sind Pigmentstörungen - bräunliche
        Verfärbungen, die nach der Behandlung an den behandelten Stellen bleiben. Sie entstehen, wenn
        die Konzentration zu hoch ist, das falsche Mittel benutzt wird oder zu nah unter der
        Hautoberfläche gespritzt wird. Eine Patientin beschreibt:
      </p>
      <PatientQuote
        quote="Sie hat die Hose hochgezogen, und ich hab nichts mehr gesagt. Dieser braune Schatten, der einfach nicht mehr weggeht - das war für mich der Moment, an dem ich verstanden habe: Es ist nicht egal, wer das macht."
        attribution="S.W., 47, Düsseldorf"
      />
      <p className="art-p">
        Eine seriöse Praxis spricht im Vorgespräch von selbst über solche Risiken - ohne sie zu
        dramatisieren, aber auch ohne sie zu verharmlosen.
      </p>

      {/* ── Bild 4: Beratung ── */}
      <ArticleImg
        name="praxis-waehlen-gespraech"
        alt="Arzthand schreibt Notizen während einer Konsultation, Patientenhände im Vordergrund sichtbar"
      />

      {/* Kriterium 4 */}
      <h3 className="art-h3">4. Aufklärung und Erwartungsmanagement</h3>
      <p className="art-lead">
        Wer Heilsversprechen macht, ist die falsche Adresse.
      </p>
      <p className="art-p">
        Eine seriöse Praxis sagt klar, was realistisch erreichbar ist und was nicht. Sie beschreibt
        den Behandlungsablauf konkret, nennt mögliche Komplikationen, gibt einen ehrlichen Sitzungs-
        und Zeitplan.
      </p>
      <p className="art-p">
        Ein Detail, das viele Praxen unterschlagen: Behandelte Besenreiser sind tatsächlich weg. Der
        Körper baut die Gefäße ab, sie kommen nicht zurück. Aber bei genetischer Veranlagung können
        neue Besenreiser an anderen Stellen entstehen. Das ist kein Versagen der Behandlung, sondern
        Biologie.
      </p>
      <p className="art-p">
        Wer dir verspricht, dass nach einer Behandlung "nie wieder etwas nachkommt", schwindelt. Wer
        dir den Unterschied zwischen "behandelte Stellen sind dauerhaft weg" und "neue können woanders
        entstehen" klar erklärt, arbeitet seriös.
      </p>
      <p className="art-p">
        Beim Vorgespräch ist das einer der besten Lackmus-Tests.
      </p>

      {/* Kriterium 5 */}
      <h3 className="art-h3">5. Patientinnen-Stimmen, die spezifisch sind</h3>
      <p className="art-lead">
        Fünf Sterne und drei Worte Lob sagen nichts.
      </p>
      <p className="art-p">
        Aussagekräftig sind ausführliche Bewertungen, die konkret beschreiben: das Vorgespräch, die
        Sitzungen, die Nachsorge, das Ergebnis nach Monaten. Wer auch beschreibt, was nicht optimal
        lief, ist glaubwürdiger als wer nur lobt.
      </p>
      <p className="art-p">
        Plattformen, die Bewertungen kuratieren statt nur einzusammeln, haben hier einen Mehrwert. Sie
        filtern offensichtlich gefälschte oder unsachliche Einträge heraus und sortieren die
        verbleibenden nach Themen oder Behandlungsverlauf.
      </p>
      <p className="art-p">
        Wenn du Bewertungen liest: such die langen, nicht die schnellen. Such die ehrlichen, nicht die
        jubelnden. Such die spezifischen, nicht die allgemeinen.
      </p>

      {/* ── Bild 5: Alltag ── */}
      <ArticleImg
        name="praxis-waehlen-alltag"
        alt="Frau geht spazieren in einem herbstlichen Park, Beine sichtbar aber nicht im Bildmittelpunkt"
      />

      {/* ── Abschluss ── */}
      <h2 className="art-h2">Wie du jetzt weitermachst</h2>
      <p className="art-p">
        Mit diesen fünf Kriterien hast du, was die meisten Patientinnen nicht haben, wenn sie ihren
        ersten Termin machen: einen Filter.
      </p>
      <p className="art-p">
        Der praktische Weg ist meistens ähnlich. Erst die spezialisierten Praxen in der eigenen Stadt
        identifizieren. Dann die Bewertungen genau lesen - nicht überfliegen. Dann zwei oder drei
        Vorgespräche führen und vergleichen.
      </p>
      <p className="art-p">
        Das ist Zeitaufwand. Aber gemessen an dem, was eine schlechte Behandlung kostet - finanziell,
        gesundheitlich, in Wartezeit auf ein Ergebnis - ist er klein.
      </p>
      <p className="art-p">
        Eine spezialisierte Vergleichsplattform kann den ersten Schritt übernehmen: die Vorauswahl der
        Praxen, die diese Kriterien tatsächlich erfüllen.
      </p>

      {/* ── Bild 6: Closing ── */}
      <ArticleImg
        name="praxis-waehlen-closing"
        alt="Frau geht einen von Bäumen gesäumten Weg entlang, von hinten fotografiert"
      />
    </ArticleLayout>
  )
}
