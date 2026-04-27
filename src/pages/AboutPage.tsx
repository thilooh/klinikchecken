import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const interFont = "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"

const h2: React.CSSProperties = {
  fontSize: '22px', fontWeight: 800, color: '#0A1F44', marginTop: '48px', marginBottom: '12px', lineHeight: 1.3,
}
const p: React.CSSProperties = {
  fontSize: '15px', color: '#333', lineHeight: 1.75, marginBottom: '16px',
}
const li: React.CSSProperties = {
  fontSize: '15px', color: '#333', lineHeight: 1.75, marginBottom: '10px',
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', listStyle: 'none' }}>
      <span style={{ color: '#00A651', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</span>
      <span style={li}>{children}</span>
    </li>
  )
}

function CriterionRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', listStyle: 'none', paddingBottom: '16px', borderBottom: '1px solid #EEEEEE' }}>
      <span style={{ color: '#003399', fontWeight: 700, flexShrink: 0, marginTop: '1px', fontSize: '15px' }}>◆</span>
      <span style={{ fontSize: '15px', color: '#333', lineHeight: 1.7 }}>
        <strong style={{ color: '#0A1F44' }}>{title}</strong> - {children}
      </span>
    </li>
  )
}

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: interFont }}>
      <Navbar />

      {/* Hero */}
      <div style={{ backgroundColor: '#002B5C', padding: '48px 16px 40px' }}>
        <div className="max-w-[760px] mx-auto">
          <p style={{ color: '#5B9BFF', fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Über uns
          </p>
          <h1 style={{ color: '#fff', fontSize: '30px', fontWeight: 800, lineHeight: 1.25, marginBottom: '12px' }}>
            Wer wir sind - und warum es uns gibt
          </h1>
          <p style={{ color: '#99BBDD', fontSize: '16px', lineHeight: 1.6 }}>
            Die Geschichte hinter besenreiser-check.de
          </p>
        </div>
      </div>

      {/* Body */}
      <main style={{ flex: 1, backgroundColor: '#F7F8FA', padding: '0 16px 64px' }}>
        <div className="max-w-[760px] mx-auto" style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '32px 32px 40px', marginTop: '-24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

          {/* Origin story */}
          <p style={p}>
            Die Idee zu besenreiser-check.de entstand aus einer simplen Beobachtung: Die meisten Frauen, die ihre Besenreiser entfernen lassen wollen, wissen nicht, an wen sie sich wenden sollen.
          </p>
          <p style={p}>
            Sie googeln "Phlebologe in meiner Stadt", landen auf einer Liste von 30 Praxen, scrollen durch widersprüchliche Bewertungen, klicken sich durch Praxis-Webseiten, die alle ähnlich klingen - und treffen am Ende eine Entscheidung aus Erschöpfung, nicht aus Überzeugung.
          </p>
          <p style={p}>
            Manche landen bei einer hervorragenden Praxis und sind glücklich. Andere landen bei einer Praxis, die Besenreiser nur als Nebenleistung anbietet, dort schlecht beraten werden, eine teure Behandlung mit mäßigem Ergebnis bekommen - und schließen daraus, dass "Besenreiser-Behandlung sowieso nicht funktioniert". Das ist falsch. Funktionieren tut sie. Nur nicht überall.
          </p>
          <p style={{ ...p, fontWeight: 600, color: '#0A1F44' }}>
            Wir haben besenreiser-check.de gegründet, damit Frauen diesen Glücksfaktor aus der Entscheidung nehmen können.
          </p>

          {/* What we do */}
          <h2 style={h2}>Was wir konkret tun</h2>
          <p style={p}>
            Wir prüfen Praxen - Phlebologen, Dermatologen, Venenzentren - auf ihre Eignung für Besenreiser-Behandlungen. Nur wer unsere Prüfung besteht, wird auf besenreiser-check.de gelistet. Aktuell sind das 229 Praxen in 72 Städten. Geprüft haben wir mehr als doppelt so viele.
          </p>

          <div style={{ backgroundColor: '#F7F9FF', border: '1px solid #D8E3FF', borderRadius: '6px', padding: '20px 24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0A1F44', marginBottom: '16px' }}>Was wir prüfen:</p>
            <ul style={{ margin: 0, padding: 0 }}>
              <CriterionRow title="Facharzt-Qualifikation">
                Phlebologie, Dermatologie oder Gefäßchirurgie? Wir verifizieren das über den Eintrag bei der zuständigen Ärztekammer. Wir listen nur Praxen mit fachärztlicher Leitung in einem dieser Bereiche.
              </CriterionRow>
              <CriterionRow title="Behandlungs-Schwerpunkt">
                Eine Praxis, die im Jahr 30 Besenreiser-Behandlungen macht, ist etwas anderes als eine, die 1.500 macht. Wir bevorzugen Spezialisten.
              </CriterionRow>
              <CriterionRow title="Bewertungs-Lage">
                Mindestens 4,5 Sterne aus 50+ verifizierten Google-Bewertungen. Praxen mit gemischtem Ruf werden weiter geprüft, oft direkt mit Patientinnen-Gesprächen.
              </CriterionRow>
              <CriterionRow title="Methoden-Transparenz">
                Welche Verfahren bietet die Praxis an? Sklerosierung? Laser? Kombination? Praxen, die das nicht offen kommunizieren, listen wir nicht.
              </CriterionRow>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', listStyle: 'none' }}>
                <span style={{ color: '#003399', fontWeight: 700, flexShrink: 0, marginTop: '1px', fontSize: '15px' }}>◆</span>
                <span style={{ fontSize: '15px', color: '#333', lineHeight: 1.7 }}>
                  <strong style={{ color: '#0A1F44' }}>Preis-Klarheit</strong> - Wer auf Anfrage "kommt drauf an" sagt, fliegt. Eine Spanne muss kommunizierbar sein.
                </span>
              </li>
            </ul>
          </div>

          {/* Cost */}
          <h2 style={h2}>Die wichtigste Frage zuerst: Was kostet dich das?</h2>
          <p style={{ ...p, fontSize: '16px', fontWeight: 600, color: '#0A1F44' }}>
            Nichts.
          </p>
          <p style={p}>
            Du zahlst auf besenreiser-check.de keinen Cent - und die Behandlung in der Praxis kostet dich genauso viel, als hättest du dich direkt an die Klinik gewandt. Es gibt keinen Aufschlag, keine versteckte Gebühr, keine Vermittlungs-Pauschale auf deiner Rechnung.
          </p>

          {/* Business model */}
          <h2 style={h2}>Wie wir uns finanzieren - ohne Schönfärberei</h2>
          <p style={p}>
            Wir bekommen von der Praxis eine Provision, wenn wir ihr eine Patientinnen-Anfrage vermitteln. Das ist das gleiche Modell, mit dem Plattformen wie Check24 oder Verivox arbeiten - und es ist der Grund, warum unsere Nutzung für dich kostenlos ist.
          </p>
          <p style={p}>
            Wir verstehen, dass das eine Frage aufwirft: "Wenn ihr Geld bekommt, sobald ich anfrage - habt ihr dann nicht ein Interesse daran, mich zur Anfrage zu drängen, egal ob die Praxis gut zu mir passt?"
          </p>
          <p style={p}>Das ist eine berechtigte Frage. Hier ist, wie wir damit umgehen:</p>

          <div style={{ borderLeft: '3px solid #003399', paddingLeft: '20px', marginBottom: '24px' }}>
            <p style={p}>
              <strong>Wir verdienen nicht an einzelnen Anfragen - wir verdienen an Vertrauen über die Zeit.</strong> Eine Patientin, die schlecht beraten wird, kommt nicht wieder. Eine Patientin, die schlecht beraten wird, hinterlässt eine schlechte Bewertung. Eine Patientin, die schlecht beraten wird, erzählt es ihrer besten Freundin. Unser Geschäftsmodell funktioniert nur dann langfristig, wenn die Praxen, an die wir vermitteln, gute Arbeit machen - sonst zerbricht die Plattform an sich selbst.
            </p>
            <p style={p}>
              Das gleiche gilt für die Praxen. Eine Praxis, die unzufriedene Patientinnen produziert, bekommt keine Folge-Anfragen mehr - weder von uns, noch von Mundpropaganda. In einem Provisionsmodell ist das ihr eigenes Problem. Praxen, die mit uns zusammenarbeiten, wissen das. Sie haben ein wirtschaftliches Eigeninteresse daran, dass du als Patientin gut behandelt wirst und zufrieden bist. Das Modell setzt für beide Seiten die richtigen Anreize.
            </p>
            <p style={{ ...p, marginBottom: 0 }}>
              <strong>Wir prüfen mehr Praxen, als wir aufnehmen.</strong> Eine Aufnahme erfolgt nur bei vollständiger Erfüllung unserer Kriterien (Facharzt-Qualifikation, dokumentierter Behandlungs-Schwerpunkt, transparente Patientenstimmen). Eine Praxis, die zahlen würde aber unsere Kriterien nicht erfüllt, bringt uns kurzfristig Geld - und langfristig würde sie das Vertrauen der Patientinnen kosten. Diese Rechnung machen wir.
            </p>
          </div>

          <p style={p}>
            <strong>Die Reihenfolge der Praxen lässt sich nicht kaufen.</strong> Sortiert wird ausschließlich nach fachlichen Kriterien: Facharzt-Qualifikation, dokumentiertem Behandlungs-Schwerpunkt, Patientinnen-Bewertungen und Entfernung zu deinem Standort. Angebote für eine Vorzugs-Platzierung gegen Bezahlung werden abgelehnt.
          </p>

          {/* What you take away */}
          <h2 style={h2}>Was du daraus konkret mitnehmen kannst</h2>
          <ul style={{ margin: 0, padding: 0, marginBottom: '16px' }}>
            <CheckItem>Du zahlst nichts - die Provision wird zwischen uns und der Praxis verrechnet, nicht über deinen Behandlungspreis.</CheckItem>
            <CheckItem>Wir empfehlen dir nicht die Praxis, die uns am meisten zahlt - wir empfehlen dir die, die zu dir passt.</CheckItem>
            <CheckItem>Sowohl wir als auch die Praxen verdienen nur dann nachhaltig, wenn du am Ende zufrieden bist. Das ist kein moralischer Anspruch - es ist die wirtschaftliche Logik unseres Modells.</CheckItem>
            <CheckItem>Wenn deine Erfahrung mit einer Praxis schlecht ist, schadet das uns mehr als der Praxis. Schreib uns also gerne - wir hören wirklich zu.</CheckItem>
          </ul>

          {/* vs competitors */}
          <h2 style={h2}>Was uns von Jameda oder Doctolib unterscheidet</h2>
          <p style={p}>
            Jameda und Doctolib sind exzellente allgemeine Arzt-Plattformen - aber sie machen keine Vorauswahl auf Indikation. Bei Jameda findest du jeden Dermatologen deiner Stadt, ob er Besenreiser jeden Tag behandelt oder einmal im Quartal. Wir trennen vor.
          </p>
          <p style={p}>
            Wir sind keine Buchungs-Software. Wir sind ein Kuratoren-Service. Der Unterschied: Bei einer Buchungs-Software bist du im Vorteil, wenn du bereits weißt, zu welcher Praxis du willst. Bei einem Kuratoren-Service bist du im Vorteil, wenn du wissen willst, welche Praxis zu dir passen könnte.
          </p>

          {/* Team */}
          <h2 style={h2}>Wer hinter besenreiser-check.de steht</h2>
          <div style={{ backgroundColor: '#FFFDF0', border: '1px solid #E8DFA0', borderRadius: '6px', padding: '16px 20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#7A6600', margin: 0, lineHeight: 1.6 }}>
              <strong>Hinweis:</strong> Team-Vorstellung folgt - mit Namen, Foto und Hintergrund der Gründer.
            </p>
          </div>
          <p style={p}>
            Wir sind keine Großfirma. Wir sind ein kleines Team, das ursprünglich aus persönlicher Frustration mit der Suche nach guten Spezialisten heraus entstanden ist. Eine von uns hat selbst zwei Praxen besucht, bevor sie die Behandlung bekam, die sie wollte - und dachte: "Das muss leichter gehen." Genau hier liegt die Idee.
          </p>

          {/* No requirements */}
          <h2 style={h2}>Was wir von dir nicht verlangen</h2>
          <ul style={{ margin: 0, padding: 0, marginBottom: '16px' }}>
            <CheckItem>Keine Registrierung, um Praxen zu vergleichen</CheckItem>
            <CheckItem>Keine Newsletter-Pflicht, um eine Anfrage zu stellen</CheckItem>
            <CheckItem>Keine versteckten Kosten - die Anfrage ist und bleibt kostenlos</CheckItem>
            <CheckItem>Keine Verbindlichkeit - wenn du nach der Antwort der Praxis doch eine andere wählst, ist das vollkommen okay</CheckItem>
          </ul>

          {/* Data */}
          <h2 style={h2}>Was wir mit deinen Daten tun (und nicht tun)</h2>
          <p style={p}>
            Deine Anfragedaten gehen ausschließlich an die Praxis, die du angefragt hast. Nicht an Versicherer. Nicht an Werbenetzwerke. Nicht an andere Plattformen. Nicht an dritte Anbieter.
          </p>
          <p style={p}>
            Wenn du parallele Anfragen an mehrere Praxen stellst (das geht, ein Klick), gehen die Daten an genau diese Praxen - und sonst nirgendwohin. Mehr Details findest du in unserer{' '}
            <a href="/datenschutz" style={{ color: '#003399', fontWeight: 600 }}>Datenschutzerklärung</a>.
          </p>

          {/* Feedback */}
          <h2 style={h2}>Wenn etwas nicht stimmt</h2>
          <p style={p}>
            Sollte deine Erfahrung mit einer von uns gelisteten Praxis nicht den Standards entsprechen, die wir versprechen - schreib uns. Wir prüfen jede Rückmeldung. Wenn sich Schwächen zeigen, sprechen wir mit der Praxis. Wenn sich Muster zeigen, fliegen Praxen aus der Plattform.
          </p>
          <p style={{ ...p, fontWeight: 600, color: '#0A1F44' }}>
            Eine Plattform, die nie eine Praxis entfernt, ist eine Plattform, die nicht prüft. Wir prüfen.
          </p>

          {/* CTA */}
          <div style={{ marginTop: '48px', backgroundColor: '#F0F4FF', border: '1px solid #C8DAFE', borderRadius: '8px', padding: '28px 32px', textAlign: 'center' }}>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#0A1F44', marginBottom: '8px' }}>
              Du hast Fragen, die hier nicht beantwortet sind?
            </p>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '20px', lineHeight: 1.6 }}>
              Schreib uns - wir antworten innerhalb von 24 Stunden, persönlich.
            </p>
            <a
              href="mailto:hallo@besenreiser-check.de"
              style={{ display: 'inline-block', backgroundColor: '#003399', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '12px 28px', borderRadius: '6px', textDecoration: 'none' }}
            >
              Kontakt aufnehmen
            </a>
          </div>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link to="/" style={{ color: '#003399', fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
              ← Zurück zur Praxis-Suche
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
