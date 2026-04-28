import { progressForStep } from '../../lib/quizState'

// `step === 1` shows the full title + subtitle so users landing on
// the quiz from an ad get the framing immediately. From step 2 on
// only the progress bar remains - the title/subtitle takes ~80px of
// vertical space which felt cramped on mobile when the question
// stack also fit above the fold.
export default function QuizHeader({ step }: { step: number }) {
  const pct = progressForStep(step)
  const showIntro = step === 1
  return (
    <div style={{ marginBottom: '20px' }}>
      {showIntro && (
        <>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0A1F44', marginBottom: '4px', textAlign: 'center', lineHeight: 1.2 }}>
            Was kommt bei deinen Beinen in Frage?
          </h1>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', textAlign: 'center' }}>
            Dein 60-Sekunden-Beine-Check — inhaltlich erstellt unter Mitwirkung von Phlebologen-Fachärzt:innen.
          </p>
        </>
      )}
      <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Quiz-Fortschritt"
        style={{ height: '6px', backgroundColor: '#E5E9F2', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#003399', transition: 'width 0.25s ease' }} />
      </div>
    </div>
  )
}
