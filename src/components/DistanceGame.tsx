import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Footprints } from 'lucide-react'
import { distanceGame } from '../content/games'
import { isLowPower, prefersReducedMotion } from '../fx/env'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { rng } from '../fx/noise'
import { paintFar, paintMid } from '../fx/space'
import { BackButton, Eyebrow, MaskTitle } from './ui'

const HEART =
  'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'
const SPARKS = ['#fff1d8', '#d9b77a', '#DCC0B8', '#e7b9b4']

/** Route geometry shared with the CSS (percent of the viewport): the walkers follow a gentle dip. */
const nodeX = (p: number) => 10 + 40 * p
const nodeY = (p: number) => 65 + 12 * p - 6 * p * p

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const easeOut = (t: number) => 1 - (1 - t) ** 3

/** Distant lights of the two places: warm gold on the left, powdery rose on the right. */
function makeLights(seed: number, n: number, warm: boolean) {
  const r = rng(seed)
  return Array.from({ length: n }, (_, i) => ({
    x: r() * 100,
    y: r() ** 1.6 * 100,
    s: 1.4 + r() * 2.2,
    c: warm ? (i % 4 === 0 ? '#fff1d8' : '#d9b77a') : i % 4 === 0 ? '#F7EEE6' : '#DCC0B8',
    tw: i % 3 === 0,
    d: 3 + r() * 4,
  }))
}
const LIGHTS_L = makeLights(5, 26, true)
const LIGHTS_R = makeLights(9, 26, false)

function Walker({ side, steps }: { side: 'l' | 'r'; steps: number }) {
  return (
    <div className={`fig fig--${side}`} aria-hidden="true">
      <div className="fig__s">
        <span className="fig__ground" />
        {steps > 0 && <span key={`r${steps}`} className="fig__ripple" />}
        <span className="fig__lean">
          <span className="fig__refl" />
          <span className="fig__halo" />
          {steps > 0 && <span key={`f${steps}`} className="fig__flare" />}
          <span className="fig__torso" />
          <span className="fig__head" />
        </span>
      </div>
    </div>
  )
}

export function DistanceGame({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const total = distanceGame.steps
  const [steps, setSteps] = useState(0)
  const [met, setMet] = useState(false)
  const [done, setDone] = useState(false)
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [painted, setPainted] = useState(false)

  const root = useRef<HTMLDivElement>(null)
  const fx = useRef<FxHandle>(null)
  const farCv = useRef<HTMLCanvasElement>(null)
  const midCv = useRef<HTMLCanvasElement>(null)
  const cur = useRef(0)
  const raf = useRef(0)
  const timers = useRef<number[]>([])
  const metOnce = useRef(false)
  const reduced = prefersReducedMotion()
  const low = isLowPower()
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduced ? 0 : ms))

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      timers.current.forEach(window.clearTimeout)
    },
    [],
  )

  // The night sky is painted once, off the first frame, then fades in.
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (farCv.current) paintFar(farCv.current, low)
      if (midCv.current && !low) paintMid(midCv.current, low)
      setPainted(true)
    }, 60)
    return () => window.clearTimeout(t)
  }, [low])

  // A few fireflies rise slowly; they get livelier as the two come closer.
  useEffect(() => {
    if (reduced || low) return
    const id = window.setInterval(() => {
      const s = fx.current?.size()
      if (!s || !s.w) return
      fx.current?.emit({
        kind: 'dust', count: 2, x: Math.random() * s.w, y: s.h * (0.5 + Math.random() * 0.45), speed: 8 + cur.current * 12,
        size: 1.3, opacity: 0.55, direction: -90, spread: 70, duration: 5200, colors: SPARKS,
      })
    }, 1100)
    return () => window.clearInterval(id)
  }, [reduced, low])

  const walkerAt = (side: 'l' | 'r', p: number) => {
    const s = fx.current?.size() ?? { w: window.innerWidth, h: window.innerHeight }
    const fh = Math.min(200, Math.max(96, Math.min(s.w, s.h) * 0.26)) * (0.78 + 0.32 * p)
    return { x: (s.w * (side === 'l' ? nodeX(p) : 100 - nodeX(p))) / 100, y: (s.h * nodeY(p)) / 100 - fh * 0.6, w: s.w, h: s.h }
  }

  /** Smoothly drives `--p` (0 to 1) on the scene, without re-rendering React. */
  const move = (to: number, duration: number, ease: (t: number) => number, onEnd: () => void) => {
    const el = root.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    if (reduced) {
      cur.current = to
      el.style.setProperty('--p', String(to))
      onEnd()
      return
    }
    const from = cur.current
    const t0 = performance.now()
    el.dataset.walk = '1'
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      cur.current = from + (to - from) * ease(t)
      el.style.setProperty('--p', cur.current.toFixed(4))
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else {
        delete el.dataset.walk
        onEnd()
      }
    }
    raf.current = requestAnimationFrame(tick)
  }

  const meet = () => {
    if (metOnce.current) return
    metOnce.current = true
    navigator.vibrate?.([12, 40, 24])
    setMet(true)
    const c = walkerAt('l', 1)
    fx.current?.emit({ kind: 'converge', count: low ? 18 : 40, x: c.w / 2, y: c.y, area: Math.max(c.w, c.h) * 0.45, size: 1.6, opacity: 0.85, duration: 1500, hold: 700, targets: [{ x: c.w / 2, y: c.y }], colors: SPARKS, delayJitter: 500 })
    later(() => {
      fx.current?.emit({ kind: 'spark', count: 34, x: c.w / 2, y: c.y, speed: 190, size: 1.5, opacity: 0.9, spread: 360, duration: 1400, colors: SPARKS })
      fx.current?.emit({ kind: 'dust', count: low ? 20 : 48, x: c.w / 2, y: c.y, area: 30, speed: 34, size: 1.5, opacity: 0.7, direction: -90, spread: 150, duration: 5200, gravity: -4, colors: SPARKS })
    }, 1500)
    later(() => setDone(true), 3300)
    later(() => setReady(true), 5400)
  }

  const step = () => {
    if (steps >= total || leaving) return
    const n = steps + 1
    setSteps(n)
    navigator.vibrate?.(n === total ? 14 : 6)
    ;(['l', 'r'] as const).forEach((side) => {
      const a = walkerAt(side, cur.current)
      fx.current?.emit({ kind: 'spark', count: 8, x: a.x, y: a.y, area: 4, speed: 70, size: 1.4, opacity: 0.85, spread: 360, duration: 900, colors: SPARKS })
    })
    const last = n === total
    move(n / total, last ? 2600 : 1100, last ? easeOut : easeInOut, () => {
      if (last) return meet()
      const a = walkerAt('l', n / total)
      fx.current?.emit({ kind: 'converge', count: 4 + n, x: a.w / 2, y: a.y, area: Math.max(a.w, a.h) * 0.35, size: 1.4, opacity: 0.7, duration: 1300, hold: 500, targets: [{ x: a.w / 2, y: a.y }], colors: SPARKS })
    })
  }

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    const c = walkerAt('l', 1)
    fx.current?.emit({ kind: 'spark', count: 30, x: c.w / 2, y: c.y, speed: 240, size: 1.5, opacity: 0.9, spread: 360, duration: 900, colors: SPARKS })
    later(onNext, 950)
  }

  const nodes = Array.from({ length: total }, (_, k) => k)
  const scene = (
    <div
      ref={root}
      className={`dsc${met ? ' is-met' : ''}${leaving ? ' is-leaving' : ''}`}
      style={{ '--p': 0 } as CSSProperties}
      aria-hidden="true"
    >
      <div className="dsc__cam">
        <div className="dsc__layer" style={{ '--dd': '70s', '--dx': '-0.6%', '--dy': '-0.4%' } as CSSProperties}>
          <div className="dsc__bg" />
          <canvas ref={farCv} className={`dsc__fill${painted ? ' is-on' : ''}`} />
          <canvas ref={midCv} className={`dsc__fill dsc__fill--stars${painted ? ' is-on' : ''}`} />
          <div className="dsc__glow dsc__glow--l" />
          <div className="dsc__glow dsc__glow--r" />
          <div className="dsc__warm" />
          <div className="dsc__dawn" />
        </div>

        <div className="dsc__layer" style={{ '--dd': '52s', '--dx': '-1.2%', '--dy': '-0.5%' } as CSSProperties}>
          {([['l', LIGHTS_L], ['r', LIGHTS_R]] as const).map(([side, list]) => (
            <div key={side} className={`dsc__lights dsc__lights--${side}`}>
              {(low ? list.slice(0, 14) : list).map((d, i) => (
                <i
                  key={i}
                  className={d.tw ? 'tw' : undefined}
                  style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, '--c': d.c, '--d': `${d.d}s` } as CSSProperties}
                />
              ))}
            </div>
          ))}
          <svg className="dsc__ridge" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 62 C8 30 18 34 28 52 S44 84 52 86 S74 48 84 36 S96 40 100 52 V100 H0Z" fill="rgba(74,30,48,.62)" />
            <path d="M0 80 C10 56 20 58 30 72 S46 96 52 96 S72 70 84 60 S96 62 100 70 V100 H0Z" fill="#1b0912" />
          </svg>
          <div className="dsc__mist" />
        </div>

        <div className="dsc__layer dsc__layer--near" style={{ '--dd': '38s', '--dx': '-0.5%', '--dy': '-0.3%' } as CSSProperties}>
          <div className="dsc__ground" />
          <svg className="dsc__road" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="dsc__base" d="M10 65 Q50 77 90 65" />
            {['M10 65 Q50 77 90 65', 'M90 65 Q50 77 10 65'].map((d) => (
              <g key={d}>
                <path className="dsc__tr dsc__tr--w" pathLength={1} d={d} />
                <path className="dsc__tr dsc__tr--m" pathLength={1} d={d} />
                <path className="dsc__tr dsc__tr--c" pathLength={1} d={d} />
              </g>
            ))}
          </svg>
          {nodes.map((k) =>
            (['l', 'r'] as const).map((side) => (
              <i
                key={`${side}${k}`}
                className={`dsc__node${steps >= k ? ' is-lit' : ''}`}
                style={{ left: `${side === 'l' ? nodeX(k / total) : 100 - nodeX(k / total)}%`, top: `${nodeY(k / total)}%` }}
              />
            )),
          )}
          <Walker side="l" steps={steps} />
          <Walker side="r" steps={steps} />
          <div className="dsc__core" />
          {[0, 1, 2].map((r) => (
            <span key={r} className="dsc__ring" style={{ '--r': r } as CSSProperties} />
          ))}
          <div className="dsc__heart">
            <div className="dsc__hglow" />
            <svg viewBox="0 0 24 24" fill="none">
              <defs>
                <radialGradient id="dheart" cx="50%" cy="40%" r="65%">
                  <stop offset="0" stopColor="#fff1d8" stopOpacity=".55" />
                  <stop offset="1" stopColor="#A85C61" stopOpacity=".08" />
                </radialGradient>
              </defs>
              <path className="dh dh--f" d={HEART} />
              <path className="dh dh--g" pathLength={1} d={HEART} />
              <path className="dh dh--l" pathLength={1} d={HEART} />
            </svg>
          </div>
        </div>
      </div>
      <div className="dsc__flash" />
      <div className="dsc__fx"><ParticleCanvas ref={fx} /></div>
    </div>
  )

  return (
    <section className={`story center dist${met ? ' is-met' : ''}${leaving ? ' is-leaving' : ''}`} aria-labelledby="distance-title">
      {createPortal(scene, document.body)}
      <div className="dist__head">
        <div className="story__back"><BackButton onClick={onBack} label="Revenir à la question" /></div>
        <div className="dist__top">
          <Eyebrow>{distanceGame.eyebrow}</Eyebrow>
          <MaskTitle
            key={done ? 'done' : 'play'}
            id="distance-title"
            className="title dist__title"
            text={done ? distanceGame.done : distanceGame.title}
            delay={done ? 100 : 900}
          />
          {!met && <p className="dist__lead">{distanceGame.intro}</p>}
        </div>
      </div>

      <div className="dist__bottom">
        {ready ? (
          <button type="button" className="step step--end" onClick={leave}>
            <span>{distanceGame.next}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        ) : (
          steps < total && (
            <span className="step-wrap">
              <button type="button" className="step" onClick={step}>
                <Footprints size={18} aria-hidden="true" />
                <span>{distanceGame.button}</span>
              </button>
              {steps > 0 && <span key={steps} className="step-wrap__pulse" />}
            </span>
          )
        )}
        <div className="dist__ticks" aria-hidden="true">
          {nodes.map((k) => (
            <i key={k} className={k < steps ? 'is-on' : undefined} />
          ))}
        </div>
        <p className="dist__sr" role="status">{`${steps} sur ${total}`}</p>
      </div>
    </section>
  )
}
