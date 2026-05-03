// Result-recovery landing for the transactional email CTA.
// Instead of "Praxen ansehen →" sending the user back to /methoden-quiz
// (where she'd have to re-traverse the funnel because sessionStorage
// may have expired or the email was opened on a different device),
// the email link points here with a base64url-encoded snapshot of
// her quiz state. The page decodes, renders Step12Result directly.
//
// Falls back to /methoden-quiz when the token is missing or invalid.

import { useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Step12Result from '../components/quiz/Step12Result'
import { decodeSnapshot } from '../lib/auswertungToken'
import { useSeo, SITE_URL } from '../lib/seo'

export default function AuswertungPage() {
  useSeo({
    title: 'Deine Quiz-Auswertung – Besenreiser-Check',
    description: 'Dein Orientierungsprofil und passende Praxen in deiner Nähe.',
    canonical: `${SITE_URL}/auswertung`,
    ogType: 'article',
  })

  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('d')

  const snapshot = useMemo(() => (token ? decodeSnapshot(token) : null), [token])

  useEffect(() => {
    if (!snapshot) navigate('/methoden-quiz', { replace: true })
  }, [snapshot, navigate])

  if (!snapshot) return null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, backgroundColor: '#F4F4F4', padding: '24px 0 48px' }}>
        <div className="max-w-[820px] mx-auto px-4">
          <Step12Result
            variant="v4"
            answers={snapshot.answers}
            lead={snapshot.lead}
            profile={snapshot.profile}
            onReset={() => navigate('/methoden-quiz')}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}
