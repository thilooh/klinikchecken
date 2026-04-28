export default function InfoSection() {
  return (
    <div style={{ backgroundColor: '#fff', borderTop: '3px solid #003399', marginTop: '24px', padding: '32px 0' }}>
      <div className="max-w-[1200px] mx-auto px-4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>

          {/* Box 1: Wie funktioniert der Vergleich */}
          <div>
            <h3 style={{ color: '#003399', fontWeight: 700, fontSize: '15px', marginBottom: '16px', borderBottom: '2px solid #E8F0FE', paddingBottom: '8px' }}>
              Wie funktioniert der Vergleich?
            </h3>
            {[
              { num: 1, title: 'Suchen', text: 'Geben Sie Ihren Ort und Ihre gewünschte Behandlung ein.' },
              { num: 2, title: 'Vergleichen', text: 'Vergleichen Sie Preise, Methoden und Bewertungen geprüfter Kliniken.' },
              { num: 3, title: 'Anfragen', text: 'Senden Sie eine kostenlose Anfrage direkt an Ihre Wunschklinik.' },
            ].map(step => (
              <div key={step.num} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: '#003399', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '13px', flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#333', marginBottom: '2px' }}>{step.title}</div>
                  <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>{step.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Box 2: Was kostet es */}
          <div>
            <h3 style={{ color: '#003399', fontWeight: 700, fontSize: '15px', marginBottom: '16px', borderBottom: '2px solid #E8F0FE', paddingBottom: '8px' }}>
              Was kostet Besenreiser entfernen?
            </h3>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.7', marginBottom: '12px' }}>
              Die Kosten für eine Besenreiser-Behandlung variieren je nach Methode, Ausdehnung und Klinik zwischen <strong>55 € und 200 € pro Sitzung</strong>. Laserbehandlungen sind in der Regel teurer als Verödung, dafür oft effektiver bei größeren Äderchen.
            </p>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.7', marginBottom: '16px' }}>
              Viele Kliniken bieten Paketpreise für 3 oder mehr Sitzungen an – das spart bis zu 20 % gegenüber Einzelsitzungen.
            </p>
            <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>Durchschnittliche Preise in Köln:</div>
              {[
                { method: 'Sklerotherapie', price: '55–90 €' },
                { method: 'Laser (Nd:YAG)', price: '90–160 €' },
                { method: 'IPL', price: '80–140 €' },
              ].map(row => (
                <div key={row.method} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid #E8E8E8' }}>
                  <span style={{ color: '#333' }}>{row.method}</span>
                  <span style={{ fontWeight: 700, color: '#003399' }}>{row.price}</span>
                </div>
              ))}
            </div>
            <a href="#" style={{ color: '#003399', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>
              Alle Preisinfos ansehen →
            </a>
          </div>

          {/* Box 3: Welche Methode */}
          <div>
            <h3 style={{ color: '#003399', fontWeight: 700, fontSize: '15px', marginBottom: '16px', borderBottom: '2px solid #E8F0FE', paddingBottom: '8px' }}>
              Welche Methode ist die richtige?
            </h3>
            <p style={{ fontSize: '13px', color: '#444', lineHeight: '1.6', marginBottom: '12px' }}>
              Die Wahl der Methode hängt von Größe, Tiefe und Lage der Besenreiser ab. Lassen Sie sich von einem Facharzt beraten.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#003399' }}>
                    <th style={{ color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 700 }}>Methode</th>
                    <th style={{ color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 700 }}>Geeignet für</th>
                    <th style={{ color: '#fff', padding: '7px 10px', textAlign: 'left', fontWeight: 700 }}>Sitzungen</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { method: 'Sklerotherapie', suitable: 'Kleine Äderchen', sessions: '1–3' },
                    { method: 'Schaumsklerotherapie', suitable: 'Mittelgroße bis größere', sessions: '2–4' },
                    { method: 'Laser (Nd:YAG)', suitable: 'Alle Größen', sessions: '2–4' },
                    { method: 'IPL', suitable: 'Flächige Areale', sessions: '3–6' },
                    { method: 'Radiofrequenzablation', suitable: 'Stammvenen', sessions: '1–2' },
                  ].map((row, i) => (
                    <tr key={row.method} style={{ backgroundColor: i % 2 === 0 ? '#F8F8F8' : '#fff' }}>
                      <td style={{ padding: '7px 10px', color: '#003399', fontWeight: 700, borderBottom: '1px solid #EEE' }}>{row.method}</td>
                      <td style={{ padding: '7px 10px', color: '#444', borderBottom: '1px solid #EEE' }}>{row.suitable}</td>
                      <td style={{ padding: '7px 10px', color: '#444', borderBottom: '1px solid #EEE' }}>{row.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
