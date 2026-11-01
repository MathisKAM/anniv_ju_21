import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import '@fontsource/inter/400.css'
import './src/styles/tokens.css'
import './src/styles/app.css'
import './src/styles/solar.css'
import './src/styles/scene.css'
import './src/styles/venus.css'
import { VenusGame } from './src/components/VenusGame'
import { questions } from './src/content/quiz'
import type { AnswerIndex, questionstate } from './src/types'

const q = (questions as any[]).find((x) => x.kind === 'venus')
const init = JSON.parse(new URLSearchParams(location.search).get('s') ?? '{"wrong":[],"correct":false}') as questionstate

function H() {
  const [s, set] = useState<questionstate>(init)
  return (
    <>
      <VenusGame
        question={q}
        state={s}
        onAnswer={(o: AnswerIndex) => {
          ;(window as any).log = [...((window as any).log ?? []), o]
          set((p) => (o === q.correctIndex ? { ...p, correct: true } : { ...p, wrong: [...p.wrong, o] }))
        }}
      />
      <p id="st">{JSON.stringify(s)}</p>
    </>
  )
}
createRoot(document.getElementById('root')!).render(<H />)
