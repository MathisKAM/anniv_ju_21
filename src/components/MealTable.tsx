import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { AnswerIndex, Question, QuestionState } from '../types'
import { isResolved } from '../logic/quizLogic'
import { tableText as T } from '../content/quiz'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { Crepes, Cutlery, Glass, PastaHam, PastaTomato, PlateBase, SteakFries, TableDefs, Vase } from './scene/DishArt'
import { useScene } from './scene/useScene'

const W = 400
const H = 440
/** Plate centres and the direction a plate is pushed away to when it is a wrong choice. */
const PLATES = [
  { x: 104, y: 126, px: -12, py: -10, pr: -4 },
  { x: 296, y: 126, px: 12, py: -10, pr: 4 },
  { x: 104, y: 322, px: -12, py: 10, pr: 4 },
  { x: 296, y: 322, px: 12, py: 10, pr: -4 },
]
const MOTES = [[60, 90, 0], [150, 60, 2.4], [230, 120, 4.1], [330, 70, 1.2], [90, 250, 3.3], [210, 300, 5.2], [350, 260, 0.8]]

export function MealTable({
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
  const win = question.correctIndex
  const fx = useRef<FxHandle>(null)

  const [won, setWon] = useState(resolved)
  const [busy, setBusy] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const [nope, setNope] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const locked = busy || resolved

  const sparkle = (n: number) => {
    const s = fx.current?.size()
    if (!s) return
    fx.current?.emit({
      kind: 'star',
      count: n,
      x: ((PLATES[win].x - 10) / W) * s.w,
      y: ((PLATES[win].y + 6) / H) * s.h,
      area: 60,
      speed: 50,
      size: 2.6,
      spread: 360,
      duration: 1800,
      colors: ['#fff3c4', '#ffd98a', '#ffffff'],
      gravity: -14,
      opacity: 0.95,
    })
  }

  const celebrate = () =>
    run(async () => {
      setWon(true)
      setMsg(T.win)
      await wait(700)
      sparkle(20)
      await wait(1700)
      sparkle(14)
      await wait(1500)
    })

  const pick = async (i: number) => {
    if (busy || resolved) return
    if (i === win) {
      setBusy(true)
      setMsg('')
      if (await celebrate()) {
        onAnswer(win)
        setMsg('')
      }
      setBusy(false)
      return
    }
    const retry = state.wrong.includes(i as AnswerIndex)
    setBusy(true)
    if (!retry) onAnswer(i as AnswerIndex)
    setNope(i)
    setMsg(T.reaction[i])
    await run(async () => {
      await wait(1000)
      setNope(null)
      setMsg('')
    })
    setBusy(false)
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void pick(i)
    }
  }

  const text = msg || (!locked && state.wrong.length === 0 ? T.hint : '')
  const order = [0, 1, 2, 3].sort((a, b) => Number(a === win && won) - Number(b === win && won))

  return (
    <div className={`sc tb${won ? ' is-win' : ''}${reduced ? ' is-reduced' : ''}`} data-nope={nope ?? undefined}>
      <div className="sc__stage">
        <svg viewBox={`0 0 ${W} ${H}`} className="sc__svg" role="group" aria-label="Une table dressée avec quatre plats">
          <TableDefs />
          <rect width={W} height={H} fill="url(#tbWoodP)" />
          <rect x="16" y="20" width="376" height="416" rx="10" fill="#000" opacity=".32" filter="url(#tbBlur)" />
          <rect x="12" y="12" width="376" height="416" rx="10" fill="url(#tbGing)" />
          <rect x="20" y="20" width="360" height="400" rx="6" fill="none" stroke="#b3606a" strokeWidth="1" strokeDasharray="4 4" opacity=".5" />
          <g className="tb-dapple" aria-hidden="true" fill="#2c1208">
            <ellipse cx="60" cy="70" rx="60" ry="26" opacity=".07" transform="rotate(-24 60 70)" />
            <ellipse cx="340" cy="214" rx="64" ry="24" opacity=".06" transform="rotate(30 340 214)" />
            <ellipse cx="170" cy="390" rx="70" ry="22" opacity=".07" transform="rotate(-12 170 390)" />
            <ellipse cx="250" cy="40" rx="50" ry="18" opacity=".05" transform="rotate(18 250 40)" />
          </g>

          {[[104, 196, -2], [296, 196, 2], [104, 392, 2], [296, 392, -2]].map(([x, y, r], i) => (
            <g key={i} className={`tb-cut tb-cut-${i}`}>
              <Cutlery x={x} y={y} rot={r} />
            </g>
          ))}
          <Glass x={152} y={226} />
          <Vase x={200} y={222} />
          <Glass x={248} y={226} wine />

          {order.map((i) => {
            const p = PLATES[i]
            const isWin = i === win && won
            const cls = [
              'tb-plate',
              `tb-plate--${i}`,
              isWin && 'is-winner',
              won && !isWin && 'is-dim',
              hover === i && !locked && 'is-hover',
              nope === i && 'is-nope',
              state.wrong.includes(i as AnswerIndex) && 'is-tried',
            ]
              .filter(Boolean)
              .join(' ')
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
                <ellipse className="tb-spot" rx="112" ry="88" cy="4" fill="url(#tbSpot)" />
                <g className="tb-shadow">
                  <ellipse rx="77" ry="59" cy="6" fill="#1a0a06" opacity=".38" filter="url(#tbBlur)" />
                </g>
                <g className="tb-push" style={{ '--px': `${p.px}px`, '--py': `${p.py}px`, '--pr': `${p.pr}deg` } as CSSProperties}>
                  <g className="tb-lift">
                    <PlateBase />
                    <g className="tb-food">
                      {i === 0 ? <PastaHam /> : i === 1 ? <PastaTomato /> : i === 2 ? <SteakFries /> : <Crepes />}
                    </g>
                    {i === win && (
                      <g className="tb-steam" filter="url(#tbSteamBlur)" aria-hidden="true">
                        {[-20, -6, 8, 22].map((x, k) => (
                          <path
                            key={k}
                            className="tb-steam__p"
                            style={{ animationDelay: `${k * 0.55}s` }}
                            d={`M${x} -24 c-7 -8 7 -15 0 -25 c-6 -9 6 -15 1 -23`}
                            stroke="#fff"
                            strokeWidth="4.4"
                            strokeLinecap="round"
                            fill="none"
                          />
                        ))}
                      </g>
                    )}
                  </g>
                </g>
                {i === win && (
                  <g className="tb-check" transform="translate(66 -46)" aria-hidden="true">
                    <g className="tb-check__i">
                      <circle r="14" fill="#fff8e6" stroke="#d9b77a" strokeWidth="2" />
                      <path d="M-6 0 l4.4 4.6 L7 -4.4" stroke="#4d2028" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </g>
                  </g>
                )}
                <ellipse className="tb-hit" rx="90" ry="72" />
              </g>
            )
          })}

          {PLATES.map((p, i) => {
            const name = T.names[i]
            const w = name.length * 7 + 22
            return (
              <g key={i} className={`tb-tag${hover === i && !locked ? ' is-on' : ''}${i === win && won ? ' is-win' : ''}`} transform={`translate(${p.x} ${p.y})`} pointerEvents="none" aria-hidden="true">
                <g transform="translate(0 64)">
                  <g className="tb-tag__pill">
                    <rect x={-w / 2} y="-12" width={w} height="24" rx="12" />
                    <text y="4.4" textAnchor="middle">{name}</text>
                  </g>
                </g>
              </g>
            )
          })}

          <g aria-hidden="true" className="tb-motes" pointerEvents="none" fill="#fff0c8">
            {MOTES.map(([x, y, d], i) => (
              <circle key={i} className="tb-mote" cx={x} cy={y} r={1.4 + (i % 3) * 0.5} style={{ animationDelay: `${-d}s` }} />
            ))}
          </g>
          <path className="tb-window" pointerEvents="none" d="M300 -10 L420 -10 L420 120 L200 440 L80 440Z" fill="#fff" opacity=".05" />
          <rect width={W} height={H} fill="url(#tbLight)" pointerEvents="none" />
          <rect className="tb-dimmer" width={W} height={H} fill="url(#tbVig)" pointerEvents="none" />
        </svg>
        <div className="sc__fx" aria-hidden="true">
          <ParticleCanvas ref={fx} />
        </div>
        <p className={`sc__bubble${text ? ' is-on' : ''}`} aria-live="polite">{text}</p>
      </div>
    </div>
  )
}
