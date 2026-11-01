import { useRef, useState, type KeyboardEvent } from 'react'
import type { AnswerIndex, Question, QuestionState } from '../types'
import { isResolved } from '../logic/quizLogic'
import { fieldText as T } from '../content/quiz'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { Bush, Cat, Dog, FieldBack, FieldDefs, FieldFront, Horse, Rabbit } from './scene/AnimalArt'
import { useScene } from './scene/useScene'

type Act = 'idle' | 'flee' | 'gone' | 'settle' | 'sleep'

/** Position, tap area and name tag of each animal, in the 400 x 340 scene. */
const SPOTS = [
  { x: 132, y: 254, hit: { x: 58, y: 96, w: 182, h: 170 }, tag: { x: 84, y: 96, left: false } },
  { x: 326, y: 270, hit: { x: 272, y: 208, w: 98, h: 70 }, tag: { x: 320, y: 204, left: true } },
  { x: 58, y: 302, hit: { x: 14, y: 244, w: 80, h: 64 }, tag: { x: 40, y: 238, left: false } },
  { x: 250, y: 304, hit: { x: 218, y: 242, w: 60, h: 68 }, tag: { x: 236, y: 238, left: false } },
]
const FLEE_MS = [0, 2200, 3600, 2300]

export function AnimalField({
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

  const initial = (): Act[] =>
    [0, 1, 2, 3].map((i) =>
      i === 0 ? (resolved ? 'sleep' : 'idle') : state.wrong.includes(i as AnswerIndex) ? 'gone' : 'idle',
    )
  const [acts, setActs] = useState<Act[]>(initial)
  const [busy, setBusy] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const [lock, setLock] = useState(false)
  const [focus, setFocus] = useState(resolved)

  const setAct = (i: number, a: Act) => setActs((cur) => cur.map((v, k) => (k === i ? a : v)))
  const locked = busy || resolved

  const sparkle = (n: number) => {
    const s = fx.current?.size()
    if (!s) return
    fx.current?.emit({
      kind: 'star',
      count: n,
      x: (150 / 400) * s.w,
      y: (170 / 340) * s.h,
      area: 70,
      speed: 40,
      size: 2.6,
      spread: 360,
      duration: 2200,
      colors: ['#fff3b8', '#ffe08a', '#ffffff'],
      gravity: -10,
      opacity: 0.9,
    })
  }

  const horseSleeps = (reveal: boolean) =>
    run(async () => {
      setFocus(true)
      setAct(0, 'settle')
      setMsg(reveal ? T.reveal : T.settle)
      sparkle(14)
      await wait(1700)
      setAct(0, 'sleep')
      await wait(1000)
      setLock(true)
      setMsg(T.lock)
      sparkle(18)
      await wait(1700)
      setLock(false)
    })

  const pick = async (i: number) => {
    if (busy || resolved || acts[i] === 'gone') return
    setBusy(true)
    setMsg('')
    if (i === 0) {
      if (await horseSleeps(false)) {
        onAnswer(0)
        setMsg('')
      }
    } else {
      onAnswer(i as AnswerIndex)
      setAct(i, 'flee')
      setMsg(T.reaction[i])
      await run(async () => {
        await wait(FLEE_MS[i])
        setAct(i, 'gone')
        setMsg('')
      })
    }
    setBusy(false)
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void pick(i)
    }
  }

  const showHint = !locked && !msg && state.wrong.length === 0
  const text = msg || (showHint ? T.hint : '')

  return (
    <div className={`sc fd${focus ? ' is-focus' : ''}${lock ? ' is-lock' : ''}${reduced ? ' is-reduced' : ''}${acts[3] === 'gone' ? ' rb-gone' : ''}`}>
      <div className="sc__stage">
        <svg viewBox="0 0 400 340" className="sc__svg" role="group" aria-label="Un champ avec un cheval, un chien, un chat et un lapin">
          <FieldDefs />
          <FieldBack />
          <rect className="fd-dim" width="400" height="340" fill="url(#fdSpot)" />
          <g className="fd-halo" transform="translate(150 188)" aria-hidden="true">
            <g className="fd-rays">
              {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d="M-5 0 L5 0 L15 -190 L-15 -190Z" fill="url(#fdRay)" transform={`rotate(${i * 30})`} />
              ))}
            </g>
            <circle r="118" fill="url(#fdHalo)" />
          </g>

          {SPOTS.map((p, i) => {
            if (acts[i] === 'gone') return null
            const a = acts[i]
            const cls = ['an', `an-${i}`, a !== 'idle' && `is-${a}`, hover === i && 'is-hover'].filter(Boolean).join(' ')
            return (
              <g
                key={i}
                className={cls}
                transform={`translate(${p.x} ${p.y})`}
                role="button"
                tabIndex={locked ? -1 : 0}
                aria-label={T.names[i]}
                aria-disabled={locked || undefined}
                onClick={() => void pick(i)}
                onKeyDown={(e) => onKey(e, i)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                <ellipse className="an-glow" cx="0" cy="2" rx="62" ry="10" />
                <g className="an-lift">
                  {i === 0 ? <Horse /> : i === 1 ? <Dog /> : i === 2 ? <Cat /> : <Rabbit />}
                </g>
                <rect className="an-hit" x={p.hit.x - p.x} y={p.hit.y - p.y} width={p.hit.w} height={p.hit.h} />
              </g>
            )
          })}

          <Bush />
          <FieldFront />

          {/* name tags: drawn last so they stay readable */}
          {SPOTS.map((p, i) => {
            if (acts[i] === 'gone') return null
            const name = T.names[i]
            const w = name.length * 6.3 + 16
            return (
              <g key={i} className={`fd-tag${hover === i && !locked ? ' is-on' : ''}`} transform={`translate(${p.tag.x} ${p.tag.y})`} pointerEvents="none" aria-hidden="true">
                <g className="fd-tag__pill" transform={`translate(${-w / 2} 0)`}>
                  <rect x="0" y="-9" width={w} height="18" rx="9" />
                  <text x={w / 2} y="3.6" textAnchor="middle">{name}</text>
                </g>
              </g>
            )
          })}
          <rect width="400" height="340" fill="url(#fdWarm)" pointerEvents="none" />
          <rect width="400" height="340" fill="url(#fdVig)" pointerEvents="none" />
        </svg>
        <div className="sc__fx" aria-hidden="true">
          <ParticleCanvas ref={fx} />
        </div>
        <p className={`sc__bubble${text ? ' is-on' : ''}`} aria-live="polite">{text}</p>
      </div>
    </div>
  )
}
