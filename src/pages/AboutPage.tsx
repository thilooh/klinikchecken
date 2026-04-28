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

          {/* What we do - honest description */}
          <h2 style={h2}>Was wir konkret tun</h2>
          <p style={p}>
            besenreiser-check.de ist eine kuratierte Übersicht von Phlebologie-, Dermatologie- und Venenpraxen in Deutschland, die Besenreiser behandeln. Wir aggregieren öffentlich verfügbare Daten - Adressen, Behandlungsmethoden, Google-Bewertungen, Öffnungszeiten - und ergänzen sie um manuell recherchierte Informationen zum Behandlungs-Schwerpunkt der Praxis.
          </p>
          <p style={p}>
            Aktuell sind 227 Praxen in über 70 deutschen Städten gelistet. Bewertungen werden automatisch von Google synchronisiert; andere Felder pflegen wir manuell.
          </p>

          <div style={{ backgroundColor: '#F7F9FF', border: '1px solid #D8E3FF', borderRadius: '6px', padding: '20px 24px', marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#0A1F44', marginBottom: '16px' }}>Welche Kriterien wir bei der Auswahl ansetzen:</p>
            <ul style={{ margin: 0, padding: 0 }}>
              <CriterionRow title="Fachärztlicher Hintergrund">
                Wir listen Praxen mit fachärztlichem Hintergrund in Phlebologie, Dermatologie oder Gefäßchirurgie - sofern dieser über das öffentliche Praxis-Profil oder die zuständige Ärztekammer einsehbar ist.
              </CriterionRow>
              <CriterionRow title="Behandlungs-Spektrum">
                Die Praxis bietet die Behandlung von Besenreisern als Teil des Leistungsspektrums an und kommuniziert die verwendeten Methoden (Sklerosierung, Laser, IPL) öffentlich.
              </CriterionRow>
              <CriterionRow title="Patientenstimmen">
                Die Praxis hat öffentlich einsehbare Google-Bewertungen mit substanzieller Anzahl an Stimmen. Bewertungs-Score und -Anzahl beeinflussen die Standard-Sortierung.
              </CriterionRow>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', listStyle: 'none' }}>
                <span style={{ color: '#003399', fontWeight: 700, flexShrink: 0, marginTop: '1px', fontSize: '15px' }}>◆</span>
                <span style={{ fontSize: '15px', color: '#333', lineHeight: 1.7 }}>
                  <strong style={{ color: '#0A1F44' }}>Praxis-Erreichbarkeit</strong> - vollständige öffentliche Kontaktdaten (Adresse, Telefon, gepflegte Webseite oder Google-Eintrag).
                </span>
              </li>
            </ul>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, marginTop: '16px', marginBottom: 0 }}>
              Eine medizinische Eignungs-Beurteilung deines individuellen Befunds können wir nicht leisten und ersetzen wir nicht - dafür ist das Erstgespräch in der Praxis da.
            </p>
          </div>

          {/* Sortierung */}
          <h2 style={h2}>Wie die Reihenfolge zustande kommt</h2>
          <p style={p}>
            Sortiert wird nach drei Kriterien:
          </p>
          <ul style={{ margin: 0, padding: 0, marginBottom: '16px' }}>
            <CheckItem><strong>Methoden-Übereinstimmung</strong> mit deiner Auswahl - filterst du nach Sklerosierung, kommen Sklerosierungs-Praxen zuerst.</CheckItem>
            <CheckItem><strong>Patientenstimmen</strong> - kombiniert aus Bewertungs-Score und Anzahl der Bewertungen, damit Praxen mit wenigen, sehr guten Bewertungen nicht künstlich vor Praxen mit vielen guten landen.</CheckItem>
            <CheckItem><strong>Entfernung zu deinem Standort</strong>, sofern bekannt (über deine PLZ-Eingabe oder den ungefähren Standort aus dem Browser).</CheckItem>
          </ul>

          {/* Cost */}
          <h2 style={h2}>Die wichtigste Frage zuerst: Was kostet dich das?</h2>
          <p style={{ ...p, fontSize: '16px', fontWeight: 600, color: '#0A1F44' }}>
            Nichts.
          </p>
          <p style={p}>
            Du zahlst auf besenreiser-check.de keinen Cent - und die Behandlung in der Praxis kostet dich genauso viel, als hättest du dich direkt an die Klinik gewandt. Es gibt keinen Aufschlag, keine versteckte Gebühr, keine Vermittlungs-Pauschale auf deiner Rechnung.
          </p>

          {/* Business model - corrected to match the actual listing-fee model */}
          <h2 style={h2}>Wie wir uns finanzieren</h2>
          <p style={p}>
            Praxen können sich für eine monatliche Gebühr als <strong>Premium-Partner</strong> eintragen lassen. Premium-Listings sind in der Übersicht mit dem Hinweis "Anzeige" gekennzeichnet und werden in der Reihenfolge bevorzugt - allerdings nicht <em>vor</em> einer Praxis, deren Methoden besser zu deinen Quiz-Antworten passen.
          </p>
          <p style={p}>
            Eine Provision pro Anfrage oder pro Behandlung gibt es nicht. Das wäre nach § 31 der Musterberufsordnung für Ärzte (MBO-Ä) auch nicht zulässig. Wir verdienen ausschließlich an der monatlichen Listing-Gebühr - unabhängig davon, wie viele Anfragen über uns bei der jeweiligen Praxis ankommen.
          </p>

          <div style={{ borderLeft: '3px solid #003399', paddingLeft: '20px', marginBottom: '24px' }}>
            <p style={{ ...p, marginBottom: 0 }}>
              <strong>Was Premium-Mitgliedschaft NICHT beeinflusst:</strong> die <em>Aufnahme</em> einer Praxis in unsere Übersicht. Wir listen auch Praxen ohne Premium-Vertrag, sofern unsere Auswahl-Kriterien erfüllt sind. Eine Praxis kann sich also nicht "ein Listing kaufen", wenn sie unsere Kriterien nicht erfüllt - und Premium hebt sie nicht über fachlich besser passende Mitbewerber. Premium beeinflusst die Sichtbarkeit (Reihenfolge + Markierung), nicht die Aufnahme.
            </p>
          </div>

          {/* What you take away */}
          <h2 style={h2}>Was du daraus konkret mitnehmen kannst</h2>
          <ul style={{ margin: 0, padding: 0, marginBottom: '16px' }}>
            <CheckItem>Du zahlst nichts - und die Behandlungs-Rechnung der Praxis enthält keinen Aufschlag durch uns.</CheckItem>
            <CheckItem>Mit "Anzeige" markierte Praxen sind zahlende Premium-Partner. Die Auswahl der gezeigten Praxen ist davon unabhängig.</CheckItem>
            <CheckItem>Die Reihenfolge richtet sich primär nach Methoden-Match und Patientenstimmen, nicht nach Tier.</CheckItem>
            <CheckItem>Wir treffen keine medizinische Diagnose - nur eine Ärztin oder ein Arzt kann das im Erstgespräch.</CheckItem>
          </ul>

          {/* vs competitors */}
          <h2 style={h2}>Was uns von Jameda oder Doctolib unterscheidet</h2>
          <p style={p}>
            Jameda und Doctolib sind allgemeine Arzt-Plattformen - bei Jameda findest du jeden Dermatologen deiner Stadt, ob er Besenreiser jeden Tag behandelt oder einmal im Quartal. Wir sind ein <strong>indikationsspezifischer Vergleich</strong>: wir listen ausschließlich Praxen, die Besenreiser-Behandlung als dokumentiertes Leistungs-Angebot führen.
          </p>
          <p style={p}>
            Wir sind keine Buchungs-Software. Wir sind eine kuratierte Auswahl + ein 60-Sekunden-Quiz, das dich von "irgendeine Praxis suchen" zu "die richtige Praxis kontaktieren" bringt.
          </p>

          {/* Team */}
          <h2 style={h2}>Wer hinter besenreiser-check.de steht</h2>
          <div style={{ backgroundColor: '#FFFDF0', border: '1px solid #E8DFA0', borderRadius: '6px', padding: '16px 20px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#7A6600', margin: 0, lineHeight: 1.6 }}>
              <strong>Hinweis:</strong> Team-Vorstellung folgt - mit Namen, Foto und Hintergrund der Gründer.
            </p>
          </div>
          <p style={p}>
            Wir sind keine Großfirma. Wir sind ein kleines Team, das ursprünglich aus persönlicher Frustration mit der Suche nach guten Spezialistinnen heraus entstanden ist. Eine von uns hat selbst zwei Praxen besucht, bevor sie die Behandlung bekam, die sie wollte - und dachte: "Das muss leichter gehen."
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
            Wenn du parallele Anfragen an mehrere Praxen stellst, gehen die Daten an genau diese Praxen - und sonst nirgendwohin. Mehr Details findest du in unserer{' '}
            <a href="/datenschutz" style={{ color: '#003399', fontWeight: 600 }}>Datenschutzerklärung</a>.
          </p>

          {/* Feedback */}
          <h2 style={h2}>Wenn etwas nicht stimmt</h2>
          <p style={p}>
            Sollte deine Erfahrung mit einer von uns gelisteten Praxis nicht den Standards entsprechen, die wir kommunizieren - schreib uns. Wir gehen jeder Rückmeldung nach. Bei wiederholter negativer Resonanz wird eine Praxis aus der Übersicht genommen.
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
