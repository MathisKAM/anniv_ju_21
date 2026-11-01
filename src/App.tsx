import { useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { questions } from './content/quiz'
import { getScore, initialProgress, reduce, type Action } from './logic/quizLogic'
import { loadProgress, saveProgress } from './logic/storage'
import type { Progress, Stage } from './types'
import { REWARD_STAGES } from './types'
import { prefersReducedMotion } from './fx/env'
import { ProgressIndicator } from './components/ProgressIndicator'
import { WelcomeScreen } from './components/WelcomeScreen'
import { StoryScreen } from './components/StoryScreen'
import { SpaceBackdrop } from './components/SpaceBackdrop'
import { WarpTunnel, WARP_IN_MS } from './components/WarpTunnel'
import { MemoryGame } from './components/MemoryGame'
import { DistanceGame } from './components/DistanceGame'
import { WishGame } from './components/WishGame'
import { QuizScreen } from './components/QuizScreen'
import { QuizSummary } from './components/QuizSummary'
import { TrophyGallery } from './components/TrophyGallery'
import { LetterReward } from './components/LetterReward'
import { RestaurantInvitation } from './components/RestaurantInvitation'
import { GiftReveal } from './components/GiftReveal'
import { FinalScreen } from './components/FinalScreen'

const reducer = (p: Progress, a: Action) => reduce(p, a, questions)

/** Scenes alternate between ivory (day) and burgundy (night). */
const NIGHT_STAGES: Stage[] = ['story', 'distance', 'wish', 'trophies', 'gift', 'final']
const isNight = (s: Stage) => NIGHT_STAGES.includes(s)

type Veil = 'wine' | 'ivory' | 'iris' | 'light' | 'warp' | 'exit' | 'glow'

/** Time the outgoing scene takes to be covered before the next one is mounted. */
const COVER_MS: Record<Veil, number> = { wine: 260, ivory: 260, iris: 260, light: 260, warp: WARP_IN_MS, exit: 600, glow: 380 }

/** The transition depends on where we arrive, so going back feels consistent. */
function veilFor(from: Stage, to: Stage): Veil {
  if (to === 'story') return 'warp' // propelled into space
  if (from === 'story') return 'exit' // the constellation collapses into a point of light
  if (from === 'distance') return 'glow' // the light of the reunion carries into the next scene
  if (from === 'wish' && to !== 'summary') return 'glow' // the light of the candles melts into the next screen
  if (from === 'letter' && to === 'restaurant') return 'glow' // the warm light of the paper carries on
  if (to === 'final' || to === 'gift') return 'light'
  if (isNight(to) && !isNight(from)) return 'wine'
  if (!isNight(to) && isNight(from)) return 'iris'
  return isNight(to) ? 'wine' : 'ivory'
}

export default function App() {
  const [progress, rawDispatch] = useReducer(reducer, initialProgress, () => loadProgress(questions))
  const directionRef = useRef<'forward' | 'back'>('forward')
  const dispatch = (a: Action) => {
    directionRef.current = a.type === 'back' ? 'back' : 'forward'
    rawDispatch(a)
  }
  const direction = directionRef.current

  // `shown` is the scene currently on screen; it lags behind `progress` while the veil covers it.
  const [shown, setShown] = useState(progress)
  const changing = progress.stage !== shown.stage
  const view = changing ? shown : progress
  const { stage } = view

  const [veil, setVeil] = useState<Veil>('ivory')
  const [clearing, setClearing] = useState(false)
  const [clearKey, setClearKey] = useState(0)
  const curVeil = changing ? veilFor(shown.stage, progress.stage) : veil
  const warpPhase = curVeil === 'warp' && !prefersReducedMotion() ? (changing ? 'in' : clearing ? 'out' : null) : null

  useEffect(() => {
    if (!changing) return
    const v = veilFor(shown.stage, progress.stage)
    setVeil(v)
    const t = window.setTimeout(() => {
      setShown(progress)
      setClearing(true)
      setClearKey((k) => k + 1)
    }, prefersReducedMotion() ? 0 : COVER_MS[v])
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, changing])

  useEffect(() => {
    saveProgress(progress)
  }, [progress])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [stage])
  useLayoutEffect(() => {
    document.body.dataset.theme = isNight(stage) ? 'night' : 'day'
    document.documentElement.dataset.perf = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ? 'low' : 'high'
  }, [stage])

  const rewardIdx = REWARD_STAGES.indexOf(stage as (typeof REWARD_STAGES)[number])
  const back = () => dispatch({ type: 'back' })
  const next = () => dispatch({ type: 'next' })

  let progressBar = null
  if (stage === 'quiz') {
    progressBar = <ProgressIndicator value={view.index + 1} total={questions.length} label={`Question ${view.index + 1} sur ${questions.length}`} />
  } else if (rewardIdx !== -1) {
    progressBar = <ProgressIndicator value={rewardIdx + 1} total={3} label={`Surprise ${rewardIdx + 1} sur 3`} />
  }

  // The sky is prepared (hidden) while the warp runs, then revealed the moment the story scene is swapped in.
  const spaceOn = progress.stage === 'story' || stage === 'story'

  return (
    <main className={`app${warpPhase === 'in' ? ' is-warp-in' : ''}`}>
      {spaceOn && <SpaceBackdrop held={stage !== 'story'} />}
      {progressBar}
      <div
        className={`screen screen--${direction}`}
        key={stage}
        // Nothing can be triggered on the outgoing scene while it is being covered.
        {...(changing ? ({ inert: '' } as object) : {})}
      >
        {stage === 'welcome' && (
          <WelcomeScreen
            onStart={() => dispatch({ type: 'start' })}
            skipIntro={direction === 'back' || Object.keys(view.answers).length > 0}
          />
        )}
        {stage === 'story' && <StoryScreen onNext={next} onBack={back} />}
        {stage === 'quiz' && (
          <QuizScreen
            questions={questions}
            progress={view}
            onAnswer={(option) => dispatch({ type: 'answer', option })}
            onNext={next}
            onBack={back}
          />
        )}
        {stage === 'memory' && <MemoryGame onNext={next} onBack={back} />}
        {stage === 'distance' && <DistanceGame onNext={next} onBack={back} />}
        {stage === 'trophies' && <TrophyGallery onNext={next} onBack={back} />}
        {stage === 'summary' && (
          <QuizSummary
            score={getScore(view, questions)}
            total={questions.length}
            onContinue={() => (view.unlocked > 0 ? dispatch({ type: 'goto', stage: 'letter' }) : next())}
            onBack={back}
            onRestart={() => dispatch({ type: 'restart' })}
          />
        )}
        {stage === 'wish' && <WishGame onNext={next} onBack={back} />}
        {stage === 'letter' && <LetterReward onNext={next} onBack={back} />}
        {stage === 'restaurant' && <RestaurantInvitation onNext={next} onBack={back} />}
        {stage === 'gift' && <GiftReveal onNext={next} onBack={back} />}
        {stage === 'final' && (
          <FinalScreen
            unlocked={view.unlocked}
            onOpen={(s) => dispatch({ type: 'goto', stage: s })}
            onReset={() => dispatch({ type: 'reset' })}
          />
        )}
      </div>
      {warpPhase && <WarpTunnel phase={warpPhase} />}
      <div
        key={changing ? 'cover' : `clear-${clearKey}`}
        className={`veil veil--${curVeil}${changing ? ' is-cover' : clearing ? ' is-clear' : ''}`}
        aria-hidden="true"
        onAnimationEnd={(e) => {
          if (e.target !== e.currentTarget || changing) return
          setClearing(false)
          document.documentElement.style.removeProperty('--exit-x')
          document.documentElement.style.removeProperty('--exit-y')
        }}
      />
    </main>
  )
}
