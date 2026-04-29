// "Was funktioniert, was nicht" comparison table for the result page.
// Shows surface aids vs. actual vessel-level treatments side-by-side
// so the mechanism reframe from step 9 lands as a concrete table the
// user can scan in 5 seconds.
//
// HWG note: phrasing is sachlich-erklärend, not disparaging.
// "behandelt nicht das Gefäß" is a factual mechanism statement.
// Compression gets a footnote acknowledging its actual benefit
// (Blutrückfluss-Unterstützung) so we're not claiming it's useless.

import { Check, X } from 'lucide-react'

type Row = {
  label: string
  treatsVessel: 'no' | 'yes' | 'partial'
  effort: string
  footnoteRef?: number
}

const ROWS: Row[] = [
  { label: 'Cremes / Gels', treatsVessel: 'no', effort: 'täglich' },
  { label: 'Kompressionsstrümpfe', treatsVessel: 'no', effort: 'täglich', footnoteRef: 1 },
  { label: 'Camouflage / Make-up', treatsVessel: 'no', effort: 'täglich' },
  { label: 'Hausmittel', treatsVessel: 'no', effort: 'täglich' },
  { label: 'Sklerotherapie', treatsVessel: 'yes', effort: 'wenige Sitzungen' },
  { label: 'Laser', treatsVessel: 'yes', effort: 'wenige Sitzungen' },
]

export default function ComparisonTable() {
  return (
    <div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse', fontSize: '13px',
          backgroundColor: '#fff', borderRadius: '6px', overflow: 'hidden',
          minWidth: '320px',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#F4F7FF' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#0A1F44', borderBottom: '1px solid #DDE3F5' }}>
                Maßnahme
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0A1F44', borderBottom: '1px solid #DDE3F5', whiteSpace: 'nowrap' }}>
                Setzt am Gefäß an
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0A1F44', borderBottom: '1px solid #DDE3F5', whiteSpace: 'nowrap' }}>
                Aufwand
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} style={{ backgroundColor: i % 2 === 1 ? '#FAFBFE' : '#fff' }}>
                <td style={{ padding: '10px 12px', borderBottom: '1px solid #EEE' }}>
                  {row.label}{row.footnoteRef && <sup style={{ color: '#888' }}>{row.footnoteRef}</sup>}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #EEE' }}>
                  {row.treatsVessel === 'yes' ? (
                    <Check size={18} color="#0A7C4A" aria-label="Ja" />
                  ) : (
                    <X size={18} color="#CC0000" aria-label="Nein" />
                  )}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #EEE', color: '#444' }}>
                  {row.effort}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '11px', color: '#666', marginTop: '8px', lineHeight: 1.5 }}>
        <sup>1</sup> Kompressionsstrümpfe unterstützen den Blutrückfluss - sie behandeln aber nicht die sichtbaren Gefäße selbst.
      </p>
    </div>
  )
}
