import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { finale } from '../content/rewards'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { prefersReducedMotion } from '../fx/env'
import type { RewardStage } from '../types'
import { MaskTitle, Sky } from './ui'

/**
 * Timeline (ms): the point of light left by the previous screen opens the scene (0) → the night warms up (~1000)
 * → "Merci…" (700) → particles gather around the frame (500) → title (2300) → photo opens (3000) → links (5600).
 */
const T = { thanks: 700, gather: 500, title: 2300, photo: 3000, burst: 3300, petals: 4300, links: 5600 }
const GOLD = ['#d9b77a', '#f6dfae', '#F7EEE6']

export function FinalScreen({ onOpen, onReset }: { unlocked?: number; onOpen: (s: RewardStage) => void; onReset: () => void }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const fx = useRef<FxHandle>(null)
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return
    const timers: number[] = []
    const at = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms))
    const centre = () => {
      const r = frame.current?.getBoundingClientRect()
      const s = fx.current?.size()
      if (!r || !s) return null
      return { r, s, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }
    }

    at(() => {
      const c = centre()
      if (!c) return
      // the particles come from the whole screen and settle on the outline of the (still hidden) frame
      const n = 110
      const rx = c.r.width / 2 + 14
      const ry = c.r.height / 2 + 14
      const targets = Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        return { x: c.cx + Math.cos(a) * rx, y: c.cy + Math.sin(a) * ry }
      })
      fx.current?.emit({
        kind: 'converge', count: n, x: c.s.w / 2, y: c.s.h / 2, area: Math.max(c.s.w, c.s.h) * 0.6,
        size: 2, opacity: 0.95, duration: 2100, hold: 1400, delayJitter: 600, colors: GOLD, targets,
      })
    }, T.gather)

    at(() => {
      const c = centre()
      if (!c) return
      fx.current?.emit({ kind: 'spark', count: 40, x: c.cx, y: c.cy, area: Math.min(c.r.width, c.r.height) * 0.45, speed: 150, spread: 360, size: 1.6, duration: 1700, gravity: 10, opacity: 0.95, colors: GOLD })
      fx.current?.emit({ kind: 'dust', count: 26, x: c.cx, y: c.cy, area: c.r.width / 2, speed: 30, direction: -90, spread: 140, size: 1.8, duration: 4200, opacity: 0.75, colors: GOLD })
    }, T.burst)

    at(() => {
      const s = fx.current?.size()
      if (!s) return
      fx.current?.emit({ kind: 'petal', count: 12, x: s.w / 2, y: -10, area: s.w / 2, speed: 40, size: 6, opacity: 0.65, direction: 90, spread: 30, duration: 10000, gravity: 16, colors: ['#A85C61', '#DCC0B8'] })
    }, T.petals)

    // quiet golden dust rising behind everything, from the moment the scene opens
    const drift = window.setInterval(() => {
      const s = fx.current?.size()
      if (!s) return
      fx.current?.emit({ kind: 'dust', count: 3, x: s.w / 2, y: s.h + 8, area: s.w / 2, speed: 14, direction: -90, spread: 36, size: 1.5, duration: 9000, opacity: 0.5, colors: GOLD })
    }, 2800)

    return () => {
      timers.forEach(window.clearTimeout)
      window.clearInterval(drift)
    }
  }, [reduced])

  const at = (ms: number) => ({ '--at': `${ms}ms` }) as CSSProperties
  const photo = finale.photo

  return (
    <section className={`story center fin${reduced ? ' is-still' : ''}`} aria-labelledby="final-title">
      {createPortal(<div className="fin-bg" aria-hidden="true" />, document.body)}
      <Sky />
      <div className="fx-screen"><ParticleCanvas ref={fx} /></div>
      <i className="fin-star" aria-hidden="true" />

      <div className="fin-stage">
        <p className="fin-thanks" style={at(T.thanks)}>{finale.thanks}</p>

        <div className="fin-head" style={at(T.title)}>
          <MaskTitle id="final-title" className="display fin-title" text={finale.title} delay={T.title} step={150} />
          <p className="fin-love" style={at(T.title + 1100)}>{finale.love}</p>        </div>

        <figure className="fin-photo" style={at(T.photo)}>
          <i className="fin-photo__glow" aria-hidden="true" />
          <div className="fin-photo__frame" ref={frame} aria-hidden={photo ? undefined : true}>
            {photo ? <img className="fin-photo__img" src={photo} alt={finale.photoAlt} /> : <span className="fin-photo__empty" />}
          </div>
          {finale.photoCaption && <figcaption className="fin-photo__cap">{finale.photoCaption}</figcaption>}
        </figure>

        <div className="fin-links" style={at(T.links)}>
          <button type="button" className="fin-link" onClick={() => onOpen('letter')}>Revoir mes surprises</button>
          <button type="button" className="fin-link fin-link--quiet" onClick={onReset}>Tout recommencer</button>
        </div>
      </div>
    </section>
  )
}
