import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { AnswerIndex, Question, QuestionState } from '../types'
import { isResolved } from '../logic/quizLogic'
import { arcadeText as T } from '../content/quiz'
import { ParticleCanvas, type EmitOptions, type FxHandle } from '../fx/ParticleCanvas'
import { ArcadeDefs, ArcadeRoom, Cabinet, DRAW_ORDER, GAMES, GamePlay, H, PLAY_MS, W } from './scene/ArcadeArt'
import { BALL_END, BALL_START, Stadium } from './scene/StadiumArt'
import { useScene } from './scene/useScene'
import { MaskTitle } from './ui'

const WIN = 3
const LAST_STEP = 9

export function ArcadeGame({
  question,
  state,
  onAnswer,
}: {
  question: Question
  state: QuestionState
  onAnswer: (o: AnswerIndex) => void
}) {
  const { reduced, wait, run } = useScene()
  const resolved = isResolved(state, question)
  const fx = useRef<FxHandle>(null)
  const [still] = useState(state.correct)
  const [step, setStep] = useState(state.correct ? LAST_STEP : 0)
  const [busy, setBusy] = useState(false)
  const [nope, setNope] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const locked = busy || resolved

  /** Emits particles at a point given in viewBox units. */
  const burst = (x: number, y: number, o: EmitOptions) => {
    const s = fx.current?.size()
    if (!s) return
    fx.current?.emit({ ...o, x: (x / W) * s.w, y: (y / H) * s.h })
  }

  const strike = () =>
    burst(BALL_START.x, BALL_START.y + 14, {
      kind: 'dust',
      count: 16,
      area: 18,
      speed: 90,
      size: 2.6,
      spread: 200,
      direction: -90,
      duration: 900,
      colors: ['#bbf7d0', '#86efac', '#ffffff'],
      gravity: 60,
      opacity: 0.8,
    })

  const celebrate = async () => {
    const colors = ['#ffffff', '#fde68a', '#67e8f9', '#f9a8d4', '#c4b5fd']
    burst(BALL_END.x, BALL_END.y, { kind: 'spark', count: 44, area: 8, speed: 230, size: 2.2, spread: 360, duration: 1300, colors, gravity: 150, opacity: 1 })
    burst(BALL_END.x, BALL_END.y, { kind: 'star', count: 24, area: 46, speed: 60, size: 2.8, spread: 360, duration: 2300, colors, gravity: -12, opacity: 0.95 })
    await wait(420)
    burst(BALL_END.x, BALL_END.y - 10, { kind: 'spark', count: 30, area: 40, speed: 170, size: 1.8, spread: 200, direction: -90, duration: 1500, colors, gravity: 220, opacity: 0.95 })
    burst(200, 150, { kind: 'star', count: 16, area: 130, speed: 20, size: 2.2, spread: 360, duration: 2200, colors, gravity: 8, opacity: 0.8 })
  }

  const playWin = () =>
    run(async () => {
      setMsg('')
      setStep(1)
      await wait(900)
      setStep(2)
      await wait(1200)
      setStep(3)
      await wait(1200)
      setStep(4)
      await wait(1400)
      setMsg(T.win)
      setStep(5)
      await wait(900)
      setStep(6)
      await wait(1900)
      setMsg('')
      setStep(7)
      await wait(1000)
      setStep(8)
      strike()
      await wait(800)
      setStep(LAST_STEP)
      await celebrate()
      await wait(1500)
    })

  const pick = async (i: number) => {
    if (locked || state.wrong.includes(i as AnswerIndex)) return
    setBusy(true)
    if (i === WIN) {
      if (await playWin()) onAnswer(WIN)
      setBusy(false)
      return
    }
    onAnswer(i as AnswerIndex)
    setNope(i)
    setMsg(T.reaction[i])
    const done = await run(async () => {
      await wait(PLAY_MS[GAMES[i].key])
    })
    if (done) {
      setNope(null)
      setMsg('')
    }
    setBusy(false)
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void pick(i)
    }
  }

  const text = msg || (!locked && state.wrong.length === 0 ? T.hint : '')
  const steps = Array.from({ length: step }, (_, k) => `s${k + 1}`).join(' ')
  const cls = ['sc', 'ac', steps, still && 'is-still', reduced && 'is-reduced', locked && 'is-locked'].filter(Boolean).join(' ')

  return (
    <div className={cls} data-nope={nope ?? undefined}>
      <div className="sc__stage ac__stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="sc__svg ac__svg" role="group" aria-label={T.scene}>
          <ArcadeDefs />
          <g className="ac-zoom">
            <g className="ac-intro">
              <ArcadeRoom />
              {DRAW_ORDER.map((i) => {
                const g = GAMES[i]
                const tried = state.wrong.includes(i as AnswerIndex) && nope !== i
                const cabCls = ['ac-cab', `ac-cab--${g.key}`, tried && 'is-tried', nope === i && 'is-playing', i === WIN && step > 0 && 'is-win']
                  .filter(Boolean)
                  .join(' ')
                const disabled = locked || tried
                return (
                  <g
                    key={g.key}
                    className={cabCls}
                    transform={`translate(${g.x} ${g.y}) scale(${g.s})`}
                    style={{ '--fd': `${DRAW_ORDER.indexOf(i) * 150}ms` } as CSSProperties}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    aria-label={tried ? `${T.names[i]}, ${T.tried}` : T.names[i]}
                    aria-disabled={disabled || undefined}
                    onClick={() => void pick(i)}
                    onKeyDown={(e) => onKey(e, i)}
                  >
                    <Cabinet g={g} play={nope === i ? <GamePlay game={g.key} /> : null} />
                    <rect className="ac-hit" x="-92" y="-240" width="188" height="248" fill="transparent" />
                  </g>
                )
              })}
            </g>
            <rect width={W} height={H} fill="url(#acVig)" pointerEvents="none" />
          </g>
        </svg>

        <div className="ac-st" aria-hidden="true">
          <div className="ac-st__in">
            <Stadium ripple={step >= LAST_STEP && !still && !reduced} />
          </div>
        </div>
        <div className="ac-bloom" aria-hidden="true" />
        <div className="sc__fx" aria-hidden="true">
          <ParticleCanvas ref={fx} />
        </div>

        <div className="ac__title">
          <MaskTitle as="h2" id="question-title" className="question ac__q" text={question.text} delay={still ? 0 : 500} step={45} />
        </div>
        <p className={`sc__bubble ac__bubble${text ? ' is-on' : ''}`} aria-live="polite">{text}</p>
      </div>
    </div>
  )
}
