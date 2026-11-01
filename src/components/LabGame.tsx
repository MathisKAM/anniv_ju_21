import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { AnswerIndex, Question, QuestionState } from '../types'
import { isResolved } from '../logic/quizLogic'
import { labText as T } from '../content/quiz'
import { ParticleCanvas, type EmitOptions, type FxHandle } from '../fx/ParticleCanvas'
import { FLASK_BODY, FLASK_X, FLASK_Y, LAB_H, LAB_W, LabBackdrop, LabDefs, METALS, MetalSolid } from './scene/LabArt'
import { useScene } from './scene/useScene'

const WIN = 3
const TILT = 26
/** Lip of the flask once tilted: where the stream leaves. */
const mouth = (i: number) => ({
  x: FLASK_X[i] - 96 * Math.sin((TILT * Math.PI) / 180),
  y: FLASK_Y - 96 * Math.cos((TILT * Math.PI) / 180) + 2,
})

const CARD = { x: 70, y: 410, w: 290, h: 82 }
/** Holes eaten in the card: x, y, radius, delay (ms). They stay around the edges, away from the text. */
const HOLES = [
  [316, 414, 16, 0],
  [358, 454, 17, 500],
  [332, 492, 15, 900],
  [70, 492, 24, 1300],
  [74, 410, 16, 1500],
  [196, 409, 11, 1100],
  [252, 492, 10, 1700],
  [348, 436, 7, 300],
  [150, 492, 8, 1900],
] as const
const LAND = { x: 316, y: 416 }
const MOTES = [[40, 60, 0], [120, 160, 2.4], [300, 140, 4.1], [380, 220, 1.2], [200, 300, 3.3], [90, 350, 5.2], [330, 340, 0.8]]
const STAGES = ['idle', 'react', 'heat', 'melt', 'pour', 'eat', 'done'] as const
type Stage = (typeof STAGES)[number]
const SMOKE = ['#d9cfc8', '#b9aea6', '#efe6df']

export function LabGame({
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

  const [stage, setStage] = useState<Stage>(resolved ? 'done' : 'idle')
  const [staticEnd] = useState(resolved)
  const [busy, setBusy] = useState(false)
  const [act, setAct] = useState<number | null>(null)
  const [tilt, setTilt] = useState<number | null>(null)
  const [stream, setStream] = useState<{ i: number; end: boolean } | null>(null)
  const [puddles, setPuddles] = useState<number[]>(() => state.wrong.map(Number))
  const [fresh, setFresh] = useState<number | null>(null)
  const [temp, setTemp] = useState('20,0')
  const [msg, setMsg] = useState('')
  const locked = busy || resolved
  const at = (s: Stage) => STAGES.indexOf(stage) >= STAGES.indexOf(s)
  const heating = at('heat') && stage !== 'done'
  const eating = stage === 'eat'
  const done = stage === 'done'

  const burst = (x: number, y: number, o: Omit<EmitOptions, 'x' | 'y'>) => {
    const s = fx.current?.size()
    if (!s || !s.w) return
    fx.current?.emit({ ...o, x: (x / LAB_W) * s.w, y: (y / LAB_H) * s.h })
  }
  const smoke = (upTo: number) => {
    for (const [x, y, , d] of HOLES) {
      if (d > upTo) continue
      burst(x, y, { kind: 'dust', count: 3, area: 10, speed: 22, size: 4.5, spread: 70, direction: -90, duration: 2400, colors: SMOKE, gravity: -16, opacity: 0.3 })
    }
    for (const [x, y, , d] of HOLES.slice(0, 5)) {
      if (d > upTo) continue
      burst(x, y, { kind: 'spark', count: 2, area: 8, speed: 70, size: 1.6, spread: 120, direction: -90, duration: 900, colors: ['#ff9a3c', '#ffd27a'], gravity: 110, opacity: 0.9 })
    }
  }

  const winSequence = () =>
    run(async () => {
      const gx = FLASK_X[WIN]
      setAct(WIN)
      setStage('react')
      burst(gx, FLASK_Y - 50, { kind: 'star', count: 10, area: 34, speed: 40, size: 2.4, duration: 1400, colors: ['#fff3c4', '#ffffff'], gravity: -10, opacity: 0.9 })
      await wait(800)
      setAct(null)

      setStage('heat')
      setMsg(T.heat)
      for (const t of ['22,1', '24,4', '26,3', '28,2', '29,8']) {
        setTemp(t)
        burst(gx, FLASK_Y - 100, { kind: 'dust', count: 3, area: 18, speed: 30, size: 3, spread: 50, duration: 1300, colors: ['#ffb25a', '#ffd9a0'], gravity: -34, opacity: 0.35 })
        if (!reduced) await wait(300)
      }
      await wait(reduced ? 450 : 200)

      setStage('melt')
      setMsg(T.melts)
      await wait(1500)
      burst(gx, FLASK_Y - 20, { kind: 'star', count: 10, area: 26, speed: 24, size: 2.2, duration: 1500, colors: ['#ffffff', '#cfe6f5'], gravity: -6, opacity: 0.9 })
      await wait(1400)

      setStage('pour')
      setTilt(WIN)
      setMsg(T.pours)
      await wait(800)
      setStream({ i: WIN, end: false })
      await wait(700)
      burst(LAND.x, LAND.y, { kind: 'spark', count: 14, area: 6, speed: 130, size: 1.8, spread: 150, direction: -90, duration: 900, colors: ['#ffffff', '#cfe6f5', '#ff9a3c'], gravity: 420, opacity: 0.95 })
      setStage('eat')
      setMsg('')
      for (let k = 0; k < 10; k++) {
        smoke(k * 400)
        if (k === 4) setStream({ i: WIN, end: true })
        if (k === 5) {
          setStream(null)
          setTilt(null)
        }
        await wait(400)
      }
      setStage('done')
      burst(CARD.x + CARD.w / 2, CARD.y + 40, { kind: 'star', count: 22, area: 90, speed: 46, size: 2.6, spread: 360, duration: 1900, colors: ['#fff3c4', '#ffd98a', '#ffffff'], gravity: -16, opacity: 0.95 })
      await wait(1500)
    })

  const wrongSequence = (i: number) =>
    run(async () => {
      const m = mouth(i)
      setAct(i)
      await wait(650)
      setTilt(i)
      await wait(550)
      setStream({ i, end: false })
      await wait(450)
      burst(m.x, FLASK_Y + 8, { kind: 'dust', count: 6, area: 6, speed: 40, size: 2, spread: 140, direction: -90, duration: 700, colors: METALS[i].dust, gravity: 260, opacity: 0.9 })
      setFresh(i)
      setPuddles((p) => (p.includes(i) ? p : [...p, i]))
      setMsg(T.nope)
      await wait(700)
      setStream({ i, end: true })
      await wait(450)
      setStream(null)
      await wait(250)
      setTilt(null)
      setAct(null)
      await wait(1200)
      setMsg('')
    })

  const pick = async (i: number) => {
    if (locked) return
    setBusy(true)
    setMsg('')
    if (i === WIN) {
      if (await winSequence()) {
        onAnswer(WIN)
        setMsg('')
      }
    } else if (await wrongSequence(i)) {
      if (!state.wrong.includes(i as AnswerIndex)) onAnswer(i as AnswerIndex)
    }
    setBusy(false)
  }

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      void pick(i)
    }
  }

  const text = msg || (!locked && puddles.length === 0 && stage === 'idle' ? T.hint : '')
  const rootCls = ['sc', 'lab', reduced && 'is-reduced', done && 'is-done', staticEnd && 'is-static'].filter(Boolean).join(' ')

  return (
    <div className={rootCls}>
      <div className="sc__stage">
        <svg viewBox={`0 0 ${LAB_W} ${LAB_H}`} className="sc__svg" role="group" aria-label={T.scene}>
          <LabDefs />
          <LabBackdrop />
          <g className="lab-motes" aria-hidden="true" fill="#fff0c8" pointerEvents="none">
            {MOTES.map(([x, y, d], k) => (
              <circle key={k} className="lab-mote" cx={x} cy={y} r={1.3 + (k % 3) * 0.5} style={{ animationDelay: `${-d}s` }} />
            ))}
          </g>

          {puddles.map((i) => (
            <g key={i} transform={`translate(${mouth(i).x} ${FLASK_Y + 10})`} aria-hidden="true">
              <g className={`lab-puddle${fresh === i ? ' is-fresh' : ''}`}>
                <ellipse rx="22" ry="6.5" cy="1.5" fill="#000" opacity=".35" />
                <ellipse rx="19" ry="5.2" fill={`url(#labM${i})`} />
                <ellipse rx="9" ry="1.6" cx="-5" cy="-1.6" fill="#fff" opacity=".5" />
              </g>
            </g>
          ))}

          <Card stage={stage} />

          {FLASK_X.map((cx, i) => {
            const isWin = i === WIN
            const cls = [
              'lab-flask',
              act === i && 'is-act',
              puddles.includes(i) && !isWin && 'is-tried',
              tilt === i && 'f-tilt',
              isWin && heating && 'f-heat',
              isWin && at('melt') && 'f-melt',
              isWin && done && 'f-done',
              isWin && at('melt') && !done && 'f-hot',
            ]
              .filter(Boolean)
              .join(' ')
            const w = T.names[i].length * 8 + 26
            const tried = puddles.includes(i) && !isWin
            return (
              <g
                key={i}
                className={cls}
                transform={`translate(${cx} ${FLASK_Y})`}
                role="button"
                tabIndex={locked ? -1 : 0}
                aria-label={T.names[i]}
                aria-disabled={locked || undefined}
                onClick={() => void pick(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <ellipse className="lab-shadow" rx="42" ry="7" cy="4" fill="#000" opacity=".4" filter="url(#labBlurS)" />
                <ellipse className="lab-halo" rx="62" ry="74" cy="-48" fill="url(#labHalo)" />
                {isWin && <ellipse className="lab-heat" rx="64" ry="76" cy="-46" fill="url(#labHeat)" />}
                <g className="lab-lift">
                  <g className="lab-wob">
                    <g className="lab-tilt">
                      <g clipPath="url(#labFlaskClip)">
                        <g className="lab-counter">
                          <g className="lab-solid">
                            <MetalSolid i={i} />
                            {isWin && <path className="lab-warm" d="M-30 0 L-24 -26 L30 -26 L32 0Z" fill="#ff8a3c" />}
                          </g>
                          {isWin && (
                            <g className="lab-liquid">
                              <rect x="-70" y="-34" width="140" height="44" fill="url(#labLiq)" />
                              <ellipse className="lab-meniscus" cx="0" cy="-34" rx="44" ry="2.6" fill="#f4fbff" />
                              <rect x="-22" y="-28" width="5" height="26" rx="2.5" fill="#fff" opacity=".6" />
                              <rect x="14" y="-24" width="3" height="18" rx="1.5" fill="#fff" opacity=".35" />
                            </g>
                          )}
                        </g>
                      </g>
                      <path d={FLASK_BODY} fill="url(#labGlassSheen)" stroke="#fff" strokeOpacity=".6" strokeWidth="1.6" strokeLinejoin="round" />
                      <path d="M-7 -90 L-7 -64 L-29 -12" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2.4" strokeLinecap="round" />
                      <rect x="-14" y="-98" width="28" height="7" rx="3.5" fill="#fff" fillOpacity=".18" stroke="#fff" strokeOpacity=".65" strokeWidth="1.4" />
                      <path d="M18 -34 H25 M20 -24 H25 M18 -14 H25" stroke="#fff" strokeOpacity=".4" strokeWidth="1.2" />
                      <text className="lab-sym" y="-44" textAnchor="middle">{T.symbols[i]}</text>
                      {isWin && (
                        <g className="lab-shimmer" fill="none" stroke="#ffd9a0" strokeWidth="2.4" strokeLinecap="round" filter="url(#labBlurS)">
                          {[-8, 0, 8].map((x, k) => (
                            <path key={k} style={{ animationDelay: `${k * 0.45}s` }} d={`M${x} -104 q-7 -9 0 -18 t0 -18 t0 -18`} />
                          ))}
                        </g>
                      )}
                    </g>
                  </g>
                </g>
                {isWin && (
                  <g className="lab-lcd" transform="translate(0 -154)" pointerEvents="none" aria-hidden="true">
                    <rect x="-33" y="-11" width="66" height="22" rx="6" fill="#1a0c0f" stroke="#d9b77a" strokeOpacity=".7" />
                    <text y="5" textAnchor="middle">{temp} °C</text>
                  </g>
                )}
                <g transform="translate(0 -128)" pointerEvents="none" aria-hidden="true"><g className="lab-tag">
                  <rect x={-w / 2} y="-12" width={w} height="24" rx="12" />
                  <text y="5" textAnchor="middle">{T.names[i]}</text>
                  {tried && (
                    <g transform={`translate(${w / 2 - 3} -10)`}>
                      <circle r="7" fill="#a85c61" stroke="#f7eee6" />
                      <path d="M-2.6 -2.6 L2.6 2.6 M2.6 -2.6 L-2.6 2.6" stroke="#f7eee6" strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                  )}
                </g></g>
                <rect className="lab-hit" x="-50" y="-142" width="100" height="162" rx="14" />
              </g>
            )
          })}

          {stream && <Stream i={stream.i} end={stream.end} />}

          {(eating || done) && (
            <g className={`lab-wisps${eating ? ' is-eat' : ''}`} aria-hidden="true" pointerEvents="none" filter="url(#labSmoke)">
              {([[316, 408, 0], [350, 440, 600], [76, 484, 1000], [200, 404, 800]] as const).map(([x, y, d], k) => (
                <path key={k} className="lab-wisp" style={{ animationDelay: `${d}ms` }} d={`M${x} ${y} c-12 -14 12 -26 0 -42 c-8 -12 8 -22 2 -34`} stroke="#d9cfc8" strokeWidth="9" strokeLinecap="round" fill="none" />
              ))}
            </g>
          )}

          <rect width={LAB_W} height={LAB_H} fill="url(#labVig)" pointerEvents="none" />
        </svg>
        <div className="sc__fx" aria-hidden="true">
          <ParticleCanvas ref={fx} />
        </div>
        <p className={`sc__bubble${text ? ' is-on' : ''}`} aria-live="polite">{text}</p>
      </div>
    </div>
  )
}

function Stream({ i, end }: { i: number; end: boolean }) {
  const m = mouth(i)
  const y2 = i === WIN ? LAND.y + 2 : FLASK_Y + 10
  const win = i === WIN
  const d = `M${m.x.toFixed(1)} ${m.y.toFixed(1)} C${(m.x + 1).toFixed(1)} ${m.y + (y2 - m.y) * 0.4} ${(m.x + 2).toFixed(1)} ${m.y + (y2 - m.y) * 0.8} ${(m.x + 2).toFixed(1)} ${y2}`
  const w = win ? 7 : 4
  return (
    <g className={`lab-stream${end ? ' is-end' : ''}`} fill="none" strokeLinecap="round" pointerEvents="none" aria-hidden="true">
      <path className="lab-stream__body" d={d} pathLength="100" stroke={win ? 'url(#labStream)' : `url(#labM${i})`} strokeWidth={w} />
      <path className="lab-stream__flow" d={d} pathLength="100" stroke="#fff" strokeOpacity={win ? 0.9 : 0.5} strokeWidth={win ? 1.8 : 1.2} />
      {win && <ellipse className="lab-splash" cx={m.x + 2} cy={y2} rx="12" ry="3.5" fill="#dcecf7" opacity=".8" />}
    </g>
  )
}

/** The paper card: a hint while idle, then eaten at the edges while « Bonne réponse ! » settles on it. */
function Card({ stage }: { stage: Stage }) {
  const eat = stage === 'eat'
  const done = stage === 'done'
  const showPool = eat || done
  const cls = `lab-card${eat ? ' is-eat' : ''}${done ? ' is-done' : ''}`
  const { x, y, w, h } = CARD
  return (
    <g className={cls} aria-hidden={stage === 'idle' ? true : undefined}>
      <defs>
        <clipPath id="labCardClip">
          <rect x={x} y={y} width={w} height={h} rx="3" />
        </clipPath>
        <mask id="labHoles" maskUnits="userSpaceOnUse" x={x - 20} y={y - 20} width={w + 40} height={h + 40}>
          <rect x={x - 20} y={y - 20} width={w + 40} height={h + 40} fill="#fff" />
          <g filter="url(#labRough)" fill="#000">
            {HOLES.map(([cx, cy, r, d], k) => (
              <circle key={k} className="lab-hole" cx={cx} cy={cy} r={r} style={{ '--d': `${d}ms` } as CSSProperties} />
            ))}
          </g>
        </mask>
        <mask id="labChar" maskUnits="userSpaceOnUse" x={x - 20} y={y - 20} width={w + 40} height={h + 40}>
          <rect x={x - 20} y={y - 20} width={w + 40} height={h + 40} fill="#000" />
          <g filter="url(#labRough)">
            {HOLES.map(([cx, cy, r, d], k) => (
              <circle key={k} className="lab-hole" cx={cx} cy={cy} r={r + 7} fill="#fff" style={{ '--d': `${d}ms` } as CSSProperties} />
            ))}
            {HOLES.map(([cx, cy, r, d], k) => (
              <circle key={`b${k}`} className="lab-hole" cx={cx} cy={cy} r={r} fill="#000" style={{ '--d': `${d}ms` } as CSSProperties} />
            ))}
          </g>
        </mask>
      </defs>
      <g transform={`rotate(-1 ${x + w / 2} ${y + h / 2})`}>
        <rect x={x + 4} y={y + 8} width={w} height={h} rx="3" fill="#000" opacity=".45" filter="url(#labBlurS)" />
        <g mask="url(#labHoles)">
          <rect x={x} y={y} width={w} height={h} rx="3" fill="url(#labPaper)" />
          <g stroke="#a85c61" strokeOpacity=".16" strokeWidth="1">
            {[26, 52, 78].map((dy) => <line key={dy} x1={x + 10} x2={x + w - 10} y1={y + dy} y2={y + dy} />)}
          </g>
        </g>
        <g clipPath="url(#labCardClip)">
          <rect className="lab-char" x={x} y={y} width={w} height={h} fill="#2a110a" mask="url(#labChar)" />
          <rect className="lab-burn" x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="3" fill="none" stroke="#3a1a0c" strokeWidth="6" filter="url(#labBlurS)" />
          {HOLES.map(([cx, cy, r, d], k) => (
            <circle key={k} className="lab-ember" cx={cx} cy={cy} r={r + 3} fill="none" stroke="#ff7a2e" strokeWidth="3" filter="url(#labBlurS)" style={{ '--d': `${d}ms` } as CSSProperties} />
          ))}
        </g>
        <text className="lab-card__idle" x={x + w / 2} y={y + 47} textAnchor="middle">{T.cardIdle}</text>
        <g className="lab-msg">
          <g className="lab-msg__chk" transform={`translate(${x + 34} ${y + 41})`}>
            <circle r="14" fill="#4d2028" stroke="#d9b77a" strokeWidth="2" />
            <path d="M-6 0 l4.4 4.6 L7 -4.4" stroke="#f7eee6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
          <text className="lab-msg__text" x={x + 58} y={y + 50}>{T.win}</text>
        </g>
        {showPool && (
          <g className="lab-pool" transform={`translate(${LAND.x + 2} ${LAND.y + 4})`}>
            <ellipse rx="15" ry="5.5" fill="url(#labPool)" stroke="#fff" strokeOpacity=".7" />
            <ellipse rx="6" ry="1.6" cx="-4" cy="-1.6" fill="#fff" />
          </g>
        )}
      </g>
    </g>
  )
}
