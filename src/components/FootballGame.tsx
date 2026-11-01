import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { AnswerIndex, Question, QuestionState } from '../types'
import { correctSet, isResolved } from '../logic/quizLogic'
import { footballText as T } from '../content/quiz'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { prefersReducedMotion } from '../fx/env'

const W = 300
const H = 420
const LETTERS = ['A', 'B', 'C', 'D']
/** A: attacking mid, B: centre back, C: defensive mid, D: striker. */
const POS = [
  { x: 205, y: 160 },
  { x: 150, y: 318 },
  { x: 112, y: 240 },
  { x: 150, y: 92 },
]
/** Line of the pitch of each pickable player: 0 attack, 1 midfield, 2 defence. */
const ZONE_OF = [1, 2, 1, 0]
const ZONES = [
  { y1: 62, y2: 135, fill: 'rgba(255, 138, 138, .13)', pill: '#f7b9b9' },
  { y1: 135, y2: 285, fill: 'rgba(243, 217, 160, .13)', pill: '#f3d9a0' },
  { y1: 285, y2: 412, fill: 'rgba(130, 176, 255, .14)', pill: '#b4cdf5' },
]
const feet = (i: number) => ({ x: POS[i].x + 10, y: POS[i].y + 9 })
const MATES = [{ x: 244, y: 262 }, { x: 58, y: 292 }, { x: 70, y: 168 }]
const FOES = [{ x: 98, y: 130 }, { x: 214, y: 112 }, { x: 166, y: 206 }, { x: 62, y: 214 }, { x: 236, y: 206 }]

const ease = (p: number) => 1 - Math.pow(1 - p, 3)
const easeIn = (p: number) => p * p

function Figure({ x, y, shirt, shorts, face = 1 }: { x: number; y: number; shirt: string; shorts: string; face?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="13" rx="9" ry="3" fill="#000" opacity=".28" />
      <g className="fb-body" style={{ animationDelay: `${(x * 7 + y * 3) % 900}ms` }}>
        <rect x="-4.6" y="8" width="3.4" height="6" rx="1.4" fill="#f1d3b4" />
        <rect x="1.2" y="8" width="3.4" height="6" rx="1.4" fill="#f1d3b4" />
        <rect x="-5.4" y="4" width="10.8" height="5.4" rx="1.6" fill={shorts} />
        <rect x="-6.2" y="-5" width="12.4" height="10.4" rx="3.2" fill={shirt} />
        <circle cx="0" cy="-9" r="4.2" fill="#f1d3b4" />
        <path d={`M-4 -10.5 q4 -4.4 8 0 q-1.2 -1.2 -4 -1.2 t-4 1.2z`} fill="#3a2a22" transform={face < 0 ? 'scale(1 -1) translate(0 18)' : undefined} />
      </g>
    </g>
  )
}

export function FootballGame({
  question,
  state,
  onAnswer,
}: {
  question: Question
  state: QuestionState
  onAnswer: (o: AnswerIndex) => void
}) {
  const reduced = useRef(prefersReducedMotion()).current
  const goalSet = correctSet(question)
  const found = state.found ?? []
  const resolved = isResolved(state)

  const initHolder = state.correct ? 3 : found.includes(0) && !found.includes(3) ? 3 : 2
  const [holderIdx0] = useState(initHolder)
  const holder = useRef(holderIdx0)
  const ball = useRef(feet(holderIdx0))
  const ballG = useRef<SVGGElement>(null)
  const ballLift = useRef<SVGGElement>(null)
  const alive = useRef(true)
  const busy = useRef(false)
  const fx = useRef<FxHandle>(null)
  const goals = useRef(found.includes(3) || state.correct ? 1 : 0)

  const [msg, setMsg] = useState('')
  const [hint, setHint] = useState<number | null>(found.includes(0) && !found.includes(3) ? 3 : found.includes(3) && !state.correct ? 0 : null)
  const [hover, setHover] = useState<number | null>(null)
  const [dive, setDive] = useState(0)
  const [cam, setCam] = useState(false)
  const [netKey, setNetKey] = useState(0)
  const [flash, setFlash] = useState(false)
  const [wob, setWob] = useState<{ i: number; k: number } | null>(null)
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [busyUi, setBusyUi] = useState(false)

  useEffect(() => {
    alive.current = true
    place(ball.current.x, ball.current.y, 0)
    return () => {
      alive.current = false
    }
  }, [])

  function place(x: number, y: number, lift: number) {
    ball.current = { x, y }
    ballG.current?.setAttribute('transform', `translate(${x} ${y})`)
    ballLift.current?.setAttribute('transform', `translate(0 ${-lift})`)
  }

  const wait = (ms: number) =>
    new Promise<void>((res) => setTimeout(res, reduced ? 0 : ms))

  const tween = (ms: number, fn: (p: number) => void) =>
    new Promise<void>((res) => {
      const dur = reduced ? 1 : ms
      const t0 = performance.now()
      const step = (t: number) => {
        if (!alive.current) return res()
        const p = Math.min(1, (t - t0) / dur)
        fn(p)
        if (p < 1) requestAnimationFrame(step)
        else res()
      }
      requestAnimationFrame(step)
    })

  const move = async (to: { x: number; y: number }, ms: number, arc: number, curve = ease, showLine = true) => {
    const from = { ...ball.current }
    if (showLine && !reduced) setLine({ x1: from.x, y1: from.y, x2: to.x, y2: to.y })
    await tween(ms, (p) => {
      const e = curve(p)
      place(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e, Math.sin(Math.PI * p) * arc)
    })
    setLine(null)
  }

  const passTo = async (i: number) => {
    if (holder.current === i) return
    const d = Math.hypot(feet(i).x - ball.current.x, feet(i).y - ball.current.y)
    await move(feet(i), 260 + d * 1.5, Math.min(14, d / 12))
    holder.current = i
    await wait(120)
  }

  const burst = (sx: number, sy: number, count: number) => {
    const s = fx.current?.size()
    if (!s) return
    fx.current?.emit({
      kind: 'spark',
      count,
      x: (sx / W) * s.w,
      y: (sy / H) * s.h,
      area: 6,
      speed: 190,
      size: 2.6,
      spread: 360,
      duration: 900,
      colors: ['#f3d9a0', '#ffffff', '#d9b77a'],
      gravity: 160,
    })
  }

  const shoot = async () => {
    const side = goals.current % 2 === 0 ? 1 : -1
    const gx = 150 + side * 24
    setCam(true)
    setDive(-side)
    await wait(180)
    await move({ x: gx, y: 20 }, 520, 5, easeIn)
    setNetKey((k) => k + 1)
    setFlash(true)
    burst(gx, 22, 34)
    goals.current += 1
    await move({ x: gx, y: 26 }, 200, 3, ease, false)
    await wait(700)
    setFlash(false)
  }

  const resetBall = async (i: number) => {
    setCam(false)
    setDive(0)
    await move(feet(i), 700, 16, ease, false)
    holder.current = i
  }

  const play = async (i: number) => {
    if (busy.current || resolved) return
    if (found.includes(i as AnswerIndex) || state.wrong.includes(i as AnswerIndex)) return
    busy.current = true
    setBusyUi(true)
    setHint(null)
    setMsg('')
    const before = found
    const ok = goalSet.includes(i as AnswerIndex)
    const lastWrong = !ok && state.wrong.length + 1 >= 2
    onAnswer(i as AnswerIndex)

    if (ok) {
      const all = before.length + 1 >= goalSet.length
      if (i === 0) {
        await passTo(0)
        await passTo(3)
        if (before.includes(3)) {
          await shoot()
        } else {
          setMsg(T.partial)
          setHint(3)
        }
      } else {
        await passTo(3)
        await shoot()
        if (!all) {
          setMsg(T.partialGoal)
          await wait(900)
          await resetBall(2)
          setHint(0)
        }
      }
      if (all) {
        setMsg(T.done)
        burst(150, 120, 26)
      }
    } else {
      const back = holder.current
      await passTo(i)
      setWob({ i, k: Date.now() })
      setMsg(T.wrong[state.wrong.length % T.wrong.length])
      await wait(260)
      await move(feet(back), 420, 10, ease, false)
      holder.current = back
      if (lastWrong) {
        setMsg(T.reveal)
        await wait(500)
        await passTo(0)
        await passTo(3)
        await shoot()
      }
    }
    if (alive.current) {
      busy.current = false
      setBusyUi(false)
    }
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void play(i)
    }
  }

  const statusOf = (i: number) => {
    if (found.includes(i as AnswerIndex) || state.correct) return goalSet.includes(i as AnswerIndex) ? 'found' : ''
    if (state.wrong.includes(i as AnswerIndex)) return 'wrong'
    if (resolved && goalSet.includes(i as AnswerIndex)) return 'found'
    return ''
  }

  const locked = busyUi || resolved
  const showHint = !locked && !msg && found.length === 0 && state.wrong.length === 0

  return (
    <div className={`fb${locked ? ' is-locked' : ''}${cam ? ' is-cam' : ''}${reduced ? ' is-reduced' : ''}`}>
      <div className="fb__stage">
        <div className="fb__cam">
          <div className="fb__tilt">
            <svg viewBox={`0 0 ${W} ${H}`} className="fb__svg" role="group" aria-label="Terrain de football">
              <defs>
                <pattern id="fb-mow" width="300" height="56" patternUnits="userSpaceOnUse">
                  <rect width="300" height="28" fill="#2e7d3d" />
                  <rect y="28" width="300" height="28" fill="#2a7238" />
                </pattern>
                <pattern id="fb-net" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <path d="M0 0H6M0 0V6" stroke="#fff" strokeWidth=".6" opacity=".7" fill="none" />
                </pattern>
                <radialGradient id="fb-vig" cx="50%" cy="55%" r="75%">
                  <stop offset=".55" stopColor="#000" stopOpacity="0" />
                  <stop offset="1" stopColor="#04140a" stopOpacity=".55" />
                </radialGradient>
              </defs>
              <rect width={W} height={H} fill="url(#fb-mow)" />
              <g className="fb-clouds" aria-hidden="true">
                <ellipse cx="80" cy="120" rx="70" ry="34" fill="#000" opacity=".1" />
                <ellipse cx="230" cy="300" rx="60" ry="28" fill="#000" opacity=".08" />
              </g>
              {/* lines of the pitch, labelled */}
              <g aria-hidden="true">
                {ZONES.map((z, k) => (
                  <g key={k}>
                    <rect x="10" y={z.y1} width="280" height={z.y2 - z.y1} fill={z.fill} />
                    <text className="fb-zone" transform={`translate(22 ${(z.y1 + z.y2) / 2}) rotate(-90)`} textAnchor="middle">
                      {T.zones[k]}
                    </text>
                  </g>
                ))}
                <path d="M10 135H290M10 285H290" stroke="#fff" strokeWidth=".8" strokeDasharray="4 4" opacity=".45" fill="none" />
                <path d="M10 62H290" stroke="#fff" strokeWidth=".8" strokeDasharray="4 4" opacity=".45" fill="none" />
              </g>
              <g fill="none" stroke="#fff" strokeWidth="1.4" opacity=".85" aria-hidden="true">
                <rect x="10" y="8" width="280" height="404" />
                <rect x="70" y="8" width="160" height="72" />
                <rect x="105" y="8" width="90" height="28" />
                <path d="M126 80 A30 30 0 0 0 174 80" />
                <path d="M110 412 A40 40 0 0 1 190 412" />
                <circle cx="150" cy="58" r="1.6" fill="#fff" />
              </g>
              {/* goal */}
              <g aria-hidden="true">
                <g key={netKey} className={netKey ? 'fb-netg is-ripple' : 'fb-netg'}>
                  <rect x="118" y="-4" width="64" height="16" fill="url(#fb-net)" />
                </g>
                <path d="M118 12 V-4 H182 V12" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
              </g>
              {/* keeper */}
              <g className="fb-keeper" style={{ transform: `translateX(${dive * 22}px) rotate(${dive * 22}deg)`, transformOrigin: '150px 38px' }} aria-hidden="true">
                <Figure x={150} y={34} shirt="#d5e85a" shorts="#222" />
              </g>
              <text className="fb-zone fb-zone--gk" x="163" y="38" aria-hidden="true">{T.keeper}</text>
              {FOES.map((f, i) => (
                <Figure key={`f${i}`} x={f.x} y={f.y} shirt="#f3f1ea" shorts="#2a3b6a" />
              ))}
              {MATES.map((m, i) => (
                <Figure key={`m${i}`} x={m.x} y={m.y} shirt="#d94a56" shorts="#f3f1ea" />
              ))}
              {line && (
                <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#fff" strokeWidth="1.4" strokeDasharray="3 4" opacity=".75" className="fb-line" />
              )}
              {/* players you can pick */}
              {POS.map((p, i) => {
                const st = statusOf(i)
                const cls = [
                  'fb-p',
                  st && `is-${st}`,
                  hint === i && 'is-hint',
                  hover === i && 'is-hover',
                  wob?.i === i && 'is-wob',
                ]
                  .filter(Boolean)
                  .join(' ')
                return (
                  <g
                    key={`${i}-${wob?.i === i ? wob.k : 0}`}
                    className={cls}
                    transform={`translate(${p.x} ${p.y})`}
                    role="button"
                    tabIndex={locked || st ? -1 : 0}
                    aria-label={`${LETTERS[i]} : ${question.options[i]}`}
                    aria-disabled={locked || undefined}
                    onClick={() => void play(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                  >
                    <circle className="fb-p__ring" r="17" cy="2" />
                    <circle r="22" cy="-4" fill="transparent" />
                    <Figure x={0} y={0} shirt="#c92f4a" shorts="#f3f1ea" />
                    <g className="fb-p__tag">
                      <rect
                        x={-(T.labels[i].length * 2.4 + 6)}
                        y="-38"
                        width={T.labels[i].length * 4.8 + 12}
                        height="14"
                        rx="7"
                        fill={ZONES[ZONE_OF[i]].pill}
                      />
                      <path d="M-4 -24.5 H4 L0 -18.5 Z" fill={ZONES[ZONE_OF[i]].pill} />
                      <text y="-28" textAnchor="middle">{T.labels[i]}</text>
                    </g>
                    {hint === i && (
                      <text className="fb-p__q" y="-44" textAnchor="middle">?</text>
                    )}
                  </g>
                )
              })}
              <g ref={ballG} aria-hidden="true">
                <ellipse cx="0" cy="3" rx="4.2" ry="1.7" fill="#000" opacity=".35" />
                <g ref={ballLift}>
                  <circle r="4.2" fill="#fff" stroke="#222" strokeWidth=".8" />
                  <path d="M0 -2 l2 1.4 -.8 2.3 h-2.4 l-.8 -2.3z" fill="#222" />
                </g>
              </g>
              <rect width={W} height={H} fill="url(#fb-vig)" pointerEvents="none" />
            </svg>
          </div>
        </div>
        <div className="fb__fx" aria-hidden="true">
          <ParticleCanvas ref={fx} />
        </div>
        {flash && <p className="fb__goal" aria-hidden="true">{T.goal}</p>}
        <p className={`fb__bubble${msg || showHint ? ' is-on' : ''}`} aria-live="polite">{msg || (showHint ? T.hint : '')}</p>
      </div>
    </div>
  )
}
