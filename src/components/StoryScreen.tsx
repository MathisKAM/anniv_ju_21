import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { prefersReducedMotion } from '../fx/env'
import { BackButton, Button, MaskTitle } from './ui'

const W = 300
const H = 280
/** Ten stars drawn clockwise from the bottom tip of a heart: one per question. */
const STARS: [number, number][] = [
  [150, 245], [70, 170], [28, 100], [60, 45], [112, 48],
  [150, 95], [188, 48], [240, 45], [272, 100], [230, 170],
]

/** The bottom tip and the top notch stay sharp; everything else is rounded. */
const CORNERS = new Set([0, 5])
function smoothClosed(pts: [number, number][]) {
  const n = pts.length
  const f = (v: number) => v.toFixed(1)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const c1: [number, number] = CORNERS.has(i) ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const j = (i + 1) % n
    const c2: [number, number] = CORNERS.has(j) ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}
const HEART_D = smoothClosed(STARS)

const GOLD = ['#d9b77a', '#F7EEE6', '#DCC0B8']
/** The particle canvas is larger than the constellation so sparks can leave it. */
const FX_X = 0.6
const FX_Y = 0.5
const LEAVE_MS = 1100

export function StoryScreen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [lit, setLit] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const fx = useRef<FxHandle>(null)
  const box = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const total = STARS.length
  const complete = lit === total
  const reduced = prefersReducedMotion()

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const toFx = (x: number, y: number) => {
    const cw = box.current?.clientWidth ?? W
    const ch = box.current?.clientHeight ?? H
    return { x: cw * FX_X + (x / W) * cw, y: ch * FX_Y + (y / H) * ch }
  }

  const light = () => {
    const i = lit
    const [sx, sy] = STARS[i]
    const last = i === total - 1
    const p = toFx(sx, sy)
    navigator.vibrate?.(last ? [10, 30, 20] : 8)
    fx.current?.emit({
      kind: 'spark', count: last ? 36 : 10, x: p.x, y: p.y, area: 2, speed: last ? 170 : 90, size: 1.6,
      opacity: 0.9, spread: 360, duration: last ? 1100 : 800, colors: GOLD,
    })
    fx.current?.emit({ kind: 'dust', count: last ? 12 : 5, x: p.x, y: p.y, area: 6, speed: 22, size: 1.3, opacity: 0.7, spread: 360, duration: 1800, colors: GOLD })
    setLit(i + 1)

    if (last) {
      // A ripple of sparks follows the outline, then light drifts away from the heart.
      STARS.forEach(([x, y], j) => {
        timers.current.push(
          window.setTimeout(() => {
            const q = toFx(x, y)
            fx.current?.emit({ kind: 'spark', count: 4, x: q.x, y: q.y, speed: 60, size: 1.2, opacity: 0.8, spread: 360, duration: 700, colors: GOLD })
          }, 350 + j * 85),
        )
      })
      timers.current.push(
        window.setTimeout(() => {
          const c = toFx(W / 2, H / 2 - 10)
          fx.current?.emit({ kind: 'dust', count: 46, x: c.x, y: c.y, area: 70, speed: 26, size: 1.4, opacity: 0.7, spread: 360, duration: 4200, colors: GOLD })
        }, 650),
      )
    }
  }

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    const b = box.current
    if (b) {
      const r = b.getBoundingClientRect()
      document.documentElement.style.setProperty('--exit-x', `${r.left + r.width / 2}px`)
      document.documentElement.style.setProperty('--exit-y', `${r.top + r.height / 2}px`)
    }
    const c = toFx(W / 2, H / 2)
    fx.current?.emit({ kind: 'spark', count: 40, x: c.x, y: c.y, speed: 220, size: 1.4, opacity: 0.85, spread: 360, duration: 1100, colors: GOLD })
    timers.current.push(window.setTimeout(onNext, reduced ? 0 : LEAVE_MS))
  }

  return (
    <section className={`story center${leaving ? ' is-leaving' : ''}`} aria-labelledby="story-title">
      <div className="story__back"><BackButton onClick={onBack} /></div>

      <MaskTitle
        key={complete ? 'done' : 'play'}
        id="story-title"
        className="title story__title"
        text={complete ? 'Dix étoiles, dix questions.' : 'Allume les étoiles'}
        delay={complete ? 150 : 1000}
      />

      <div
        ref={box}
        className={`constellation${complete ? ' is-complete' : ''}${leaving ? ' is-leaving' : ''}`}
        style={{ aspectRatio: `${W} / ${H}`, '--k': lit / total } as CSSProperties}
      >
        {complete && <div className="chalo" aria-hidden="true" />}
        <div className="constellation__shape">
          <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            <defs>
              <filter id="cglow" filterUnits="userSpaceOnUse" x="-30" y="-30" width="360" height="340">
                <feGaussianBlur stdDeviation="2.2" />
              </filter>
              <radialGradient id="cfill" cx="50%" cy="42%" r="60%">
                <stop offset="0" stopColor="#d9b77a" stopOpacity="0.3" />
                <stop offset="0.6" stopColor="#A85C61" stopOpacity="0.12" />
                <stop offset="1" stopColor="#A85C61" stopOpacity="0" />
              </radialGradient>
            </defs>
            {complete && (
              <>
                <path className="cheart" d={HEART_D} />
                <path className="cpulse" pathLength={1} d={HEART_D} />
              </>
            )}
            {STARS.map(([x1, y1], i) => {
              const [x2, y2] = STARS[(i + 1) % total]
              if (lit < Math.min(i + 2, total)) return null
              const newestFrom = complete ? total - 2 : lit - 2
              return (
                <g key={i}>
                  <line className="cl cl--glow" pathLength={1} x1={x1} y1={y1} x2={x2} y2={y2} />
                  <line className="cl" pathLength={1} x1={x1} y1={y1} x2={x2} y2={y2} />
                  {i >= newestFrom && !reduced && (
                    <circle
                      className="cl__spark"
                      r="2"
                      cx={x1}
                      cy={y1}
                      style={{ '--dx': x2 - x1, '--dy': y2 - y1 } as CSSProperties}
                    />
                  )}
                </g>
              )
            })}
          </svg>
          {STARS.map(([x, y], i) => {
            const pos = { left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, '--i': i } as CSSProperties
            if (i === lit) {
              return (
                <button
                  key={i}
                  type="button"
                  className="star star--active"
                  style={pos}
                  onClick={light}
                  aria-label={`Allumer l'étoile ${i + 1} sur ${total}`}
                >
                  <span className="star__aura" />
                  <span className="star__dot" />
                </button>
              )
            }
            return (
              <span
                key={i}
                className={`star ${i < lit ? 'star--lit' : 'star--idle'}${i === total - 1 ? ' star--final' : ''}`}
                style={pos}
                aria-hidden="true"
              >
                {i < lit && <span className="star__wave" />}
                <span className="star__dot" />
              </span>
            )
          })}
        </div>
        <div className="constellation__fx"><ParticleCanvas ref={fx} /></div>
        {leaving && <span className="crelease" aria-hidden="true" />}
      </div>

      {complete ? (
        <div className="story__end" style={{ animationDelay: '2600ms' }}>
          <p className="lead">Ta mission : répondre à ces questions. Ensuite, tes surprises.</p>
          <Button onClick={leave}>Commencer le quiz</Button>
        </div>
      ) : (
        <p className="hint" role="status">
          {lit === 0 ? 'Touche l’étoile qui brille.' : `${lit} sur ${total}`}
        </p>
      )}
    </section>
  )
}
