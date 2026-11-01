import { useRef, useState, type KeyboardEvent } from 'react'
import type { AnswerIndex, Question, QuestionState } from '../types'
import { isResolved } from '../logic/quizLogic'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { PLANETS, Planet } from './PlanetArt'
import { GaugeCard, SpaceDefs, Stars, Sun, SUN, VH, VW } from './scene/VenusArt'
import { useScene } from './scene/useScene'

const T = {
  hint: 'Touche une planète pour répondre.',
  nope: ['Ce n’est pas celle-là…', 'Hmm, pas celle-là non plus…'],
  reveal: 'Regarde bien Vénus…',
  start: 'Vénus tourne autour du Soleil…',
  orbit: 'Un tour complet autour du Soleil = 1 année',
  yearDone: '1 année terminée… mais la journée de Vénus n’est pas finie !',
  win: 'Sur Vénus, la journée dure plus longtemps que l’année !',
}

/** Display order is the option order of the question: Mars, Jupiter, Vénus, Mercure. */
const BODIES = [
  { name: 'Mars', k: 3, orbit: 114, ang: 35, R: 14 },
  { name: 'Jupiter', k: 4, orbit: 148, ang: 145, R: 24 },
  { name: 'Vénus', k: 1, orbit: 80, ang: 180, R: 23 },
  { name: 'Mercure', k: 0, orbit: 46, ang: -60, R: 12 },
]
const ORBITS = [46, 80, 114, 148]
const DAY_RATIO = 225 / 243
const ORBIT_MS = 8500
const RING_GAP = 8

const rad = (d: number) => (d * Math.PI) / 180
const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2)
const place = (orbit: number, ang: number) => ({ x: SUN.x + orbit * Math.cos(rad(ang)), y: SUN.y + orbit * Math.sin(rad(ang)) })

export function VenusGame({
  question,
  state,
  onAnswer,
}: {
  question: Question
  state: QuestionState
  onAnswer: (o: AnswerIndex) => void
}) {
  const { reduced, alive, wait, run } = useScene()
  const resolved = isResolved(state, question)
  const win = question.correctIndex
  const fx = useRef<FxHandle>(null)

  const [won, setWon] = useState(resolved)
  const [go, setGo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [nope, setNope] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const [prog, setProg] = useState(resolved ? 1 : 0)
  const [rot, setRot] = useState(resolved ? 1 : 0)
  const locked = busy || resolved
  const focus = go || won

  const tween = (ms: number, fn: (u: number) => void) =>
    new Promise<void>((res) => {
      const dur = reduced ? Math.min(ms, 500) : ms
      const t0 = performance.now()
      const step = (t: number) => {
        if (!alive.current) return res()
        const u = Math.min(1, (t - t0) / dur)
        fn(u)
        if (u < 1) requestAnimationFrame(step)
        else res()
      }
      requestAnimationFrame(step)
    })

  const venus = BODIES[win]
  const venusAt = place(venus.orbit, venus.ang + 360 * prog)

  const sparkle = (n: number, at = place(venus.orbit, venus.ang), spread = 360) => {
    const s = fx.current?.size()
    if (!s) return
    fx.current?.emit({
      kind: 'star',
      count: n,
      x: (at.x / VW) * s.w,
      y: (at.y / VH) * s.h,
      area: 34,
      speed: 52,
      size: 2.6,
      spread,
      duration: 1800,
      colors: ['#fff3c4', '#ffd98a', '#ffffff'],
      gravity: -14,
      opacity: 0.95,
    })
  }

  const demo = (reveal: boolean) =>
    run(async () => {
      setGo(true)
      setMsg(reveal ? T.reveal : T.start)
      await wait(1000)
      setMsg(T.orbit)
      await tween(ORBIT_MS, (u) => {
        const e = ease(u)
        setProg(e)
        setRot(e * DAY_RATIO)
      })
      setMsg(T.yearDone)
      await wait(0)
      await wait(2600)
      await tween(1700, (u) => setRot(DAY_RATIO + (1 - DAY_RATIO) * ease(u)))
      await wait(0)
      setWon(true)
      setMsg(T.win)
      await wait(500)
      sparkle(22)
      await wait(1700)
      sparkle(14)
      await wait(1300)
    })

  const pick = async (i: number) => {
    if (busy || resolved) return
    if (i === win) {
      setBusy(true)
      setMsg('')
      if (await demo(false)) {
        onAnswer(i as AnswerIndex)
        setMsg('')
      }
      setBusy(false)
      return
    }
    const retry = state.wrong.includes(i as AnswerIndex)
    const lastWrong = !retry && state.wrong.length + 1 >= 2
    setBusy(true)
    if (!retry) onAnswer(i as AnswerIndex)
    setNope(i)
    setMsg(T.nope[state.wrong.length % 2])
    await run(async () => {
      await wait(1100)
      setNope(null)
      if (lastWrong) {
        await wait(300)
        await demo(true)
        setMsg('')
      } else {
        setMsg('')
      }
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
  const yearDone = prog >= 0.999
  const gap = yearDone && rot < 0.999
  const ringR = venus.R + RING_GAP
  const sunDir = (p: { x: number; y: number }) => Math.round((Math.atan2(SUN.y - p.y, SUN.x - p.x) * 180) / Math.PI / 15) * 15

  return (
    <div className={`sc vn${focus ? ' is-focus' : ''}${won ? ' is-win' : ''}${reduced ? ' is-reduced' : ''}`}>
      <div className="sc__stage">
        <svg viewBox={`0 0 ${VW} ${VH}`} className="sc__svg" role="group" aria-label="Le système solaire : Mercure, Vénus, Mars et Jupiter autour du Soleil">
          <SpaceDefs />
          <rect width={VW} height={VH} fill="url(#vnBg)" />
          <Stars />
          <rect y="392" width={VW} height={VH - 392} fill="#000" opacity=".26" />

          <g aria-hidden="true" pointerEvents="none">
            {ORBITS.map((r) => (
              <circle key={r} className={`vn-orbit${r === venus.orbit ? ' is-venus' : ''}`} cx={SUN.x} cy={SUN.y} r={r} />
            ))}
            <circle
              className="vn-trace"
              cx={SUN.x}
              cy={SUN.y}
              r={venus.orbit}
              pathLength="100"
              strokeDasharray={`${prog * 100} 100`}
              transform={`rotate(${venus.ang} ${SUN.x} ${SUN.y})`}
              opacity={prog > 0 ? 1 : 0}
            />
          </g>

          <Sun />

          {BODIES.map((b, i) => {
            if (i === win) return null
            const p = place(b.orbit, b.ang)
            const size = b.R / (PLANETS[b.k].r / 100)
            const w = b.name.length * 8 + 18
            const labelUp = b.name === 'Mercure'
            const cls = [
              'vn-pl',
              nope === i && 'is-nope',
              state.wrong.includes(i as AnswerIndex) && 'is-tried',
              focus && 'is-dim',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <g key={i} transform={`translate(${p.x} ${p.y})`}>
                <g
                  className={cls}
                  role="button"
                  tabIndex={locked ? -1 : 0}
                  aria-label={`Planète ${b.name}`}
                  aria-disabled={locked || undefined}
                  onClick={() => void pick(i)}
                  onKeyDown={(e) => onKey(e, i)}
                >
                  <circle className="vn-ring" r={b.R + 7} />
                  <g className="vn-body">
                    <svg x={-size / 2} y={-size / 2} width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
                      <Planet k={b.k} light={sunDir(p)} />
                    </svg>
                    <g className="vn-x" transform={`translate(${b.R * 0.72} ${-b.R * 0.72})`}>
                      <circle r="7" />
                      <path d="M-2.6 -2.6 L2.6 2.6 M2.6 -2.6 L-2.6 2.6" />
                    </g>
                  </g>
                  <g className="vn-tag" transform={`translate(0 ${labelUp ? -(b.R + 14) : b.R + 14})`} pointerEvents="none">
                    <rect x={-w / 2} y="-10" width={w} height="20" rx="10" />
                    <text y="4.6" textAnchor="middle">{b.name}</text>
                  </g>
                  <circle className="vn-hit" r={Math.max(b.R + 8, 26)} />
                </g>
              </g>
            )
          })}

          {/* Vénus: drawn last so it stays above the others while it travels along its orbit */}
          <g transform={`translate(${venusAt.x} ${venusAt.y})`}>
            <g
              className={['vn-pl', 'is-venus', nope === win && 'is-nope', focus && 'is-hot'].filter(Boolean).join(' ')}
              role="button"
              tabIndex={locked ? -1 : 0}
              aria-label={`Planète ${venus.name}`}
              aria-disabled={locked || undefined}
              onClick={() => void pick(win)}
              onKeyDown={(e) => onKey(e, win)}
            >
              <circle className="vn-halo" r={venus.R * 2.5} fill="url(#vnVenusHalo)" opacity={focus ? 1 : 0} pointerEvents="none" />
              {won && <circle className="vn-burst" r={venus.R * 3.4} fill="url(#vnWin)" pointerEvents="none" />}
              <circle className="vn-ring" r={venus.R + 7} />
              <g className="vn-body">
                <svg
                  x={-venus.R / (PLANETS[venus.k].r / 100) / 2}
                  y={-venus.R / (PLANETS[venus.k].r / 100) / 2}
                  width={venus.R / (PLANETS[venus.k].r / 100)}
                  height={venus.R / (PLANETS[venus.k].r / 100)}
                  viewBox="0 0 100 100"
                  style={{ overflow: 'visible' }}
                >
                  <Planet k={venus.k} spin={false} light={sunDir(venusAt)} />
                </svg>
              </g>

              <g className="vn-spin" opacity={focus ? 1 : 0} pointerEvents="none">
                <circle r={ringR} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.6" strokeDasharray="1.5 3.5" />
                {gap && (
                  <circle
                    className="vn-remain"
                    r={ringR}
                    fill="none"
                    pathLength="100"
                    strokeDasharray={`0 ${rot * 100} ${(1 - rot) * 100} 100`}
                    transform="rotate(-90)"
                  />
                )}
                <circle
                  className="vn-arc"
                  r={ringR}
                  fill="none"
                  pathLength="100"
                  strokeDasharray={`${rot * 100} 100`}
                  transform="rotate(-90)"
                  opacity={rot > 0 ? 1 : 0}
                />
                <path className="vn-start" d={`M0 ${-(ringR - 5)} V${-(ringR + 6)}`} />
                <g transform={`rotate(${rot * 360})`}>
                  <path className="vn-hand__o" d={`M0 0 V${-ringR}`} />
                  <path className="vn-hand" d={`M0 0 V${-ringR}`} />
                  <circle className="vn-notch" cy={-venus.R * 0.7} r="2.6" />
                  <circle className="vn-flag" cy={-ringR} r="4.4" />
                </g>
              </g>

              {won && (
                <g className="vn-check" transform={`translate(${venus.R + 6} ${-venus.R - 4})`} pointerEvents="none">
                  <g className="vn-check__i">
                    <circle r="12" fill="#fff8e6" stroke="#d9b77a" strokeWidth="2" />
                    <path d="M-5.2 0 l3.8 4 L6 -3.8" stroke="#4d2028" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                </g>
              )}

              <g className="vn-tag" transform={`translate(0 ${-(ringR + 14)})`} pointerEvents="none">
                <rect x={-(venus.name.length * 8 + 18) / 2} y="-10" width={venus.name.length * 8 + 18} height="20" rx="10" />
                <text y="4.6" textAnchor="middle">{venus.name}</text>
              </g>
              <circle className="vn-hit" r="30" />
            </g>
          </g>

          <GaugeCard x={12} y={400} title="1 année" sub="autour du Soleil" value={prog} color="#ffd98a" on={focus} />
          <GaugeCard x={204} y={400} title="1 journée" sub="sur elle-même" value={rot} color="#ff8aa0" on={focus} />
        </svg>
        <div className="sc__fx" aria-hidden="true">
          <ParticleCanvas ref={fx} />
        </div>
        <p className={`sc__bubble${text ? ' is-on' : ''}`} aria-live="polite">{text}</p>
      </div>
    </div>
  )
}
