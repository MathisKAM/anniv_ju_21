import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { isLowPower, prefersReducedMotion } from '../fx/env'
import { rng } from '../fx/noise'
import { paintFar, paintGalaxy, paintMid, paintNear, paintSphere } from '../fx/space'

interface Meteor {
  id: number
  x: number
  y: number
  dx: number
  dy: number
  deg: number
  len: number
}

const TW_COLORS = ['#fff4e6', '#f3dcc8', '#d9b77a', '#e7b9b4']
const TWINKLES = (() => {
  const r = rng(12)
  return Array.from({ length: 12 }, (_, i) => ({
    x: 6 + r() * 88,
    y: 5 + r() * 90,
    s: 2 + r() * 1.4,
    c: TW_COLORS[i % TW_COLORS.length],
    d: 6 + r() * 6,
    dl: -r() * 10,
  }))
})()

/**
 * Deep-space scene in three parallax layers (far / middle / near), painted once on canvas.
 * `held` keeps it invisible and paused while it is being prepared behind the warp transition.
 */
export function SpaceBackdrop({ held }: { held: boolean }) {
  const far = useRef<HTMLCanvasElement>(null)
  const mid = useRef<HTMLCanvasElement>(null)
  const near = useRef<HTMLCanvasElement>(null)
  const gal = useRef<HTMLCanvasElement>(null)
  const pa = useRef<HTMLCanvasElement>(null)
  const pm = useRef<HTMLCanvasElement>(null)
  const pr = useRef<HTMLCanvasElement>(null)
  const [meteors, setMeteors] = useState<Meteor[]>([])
  const still = prefersReducedMotion() || isLowPower()

  // Paint in small slices so the main thread stays free for the warp animation.
  useEffect(() => {
    const low = isLowPower()
    const layers = () => {
      if (far.current) paintFar(far.current, low)
      if (mid.current) paintMid(mid.current, low)
      if (near.current) paintNear(near.current, low)
    }
    const jobs: (() => void)[] = [
      () => far.current && paintFar(far.current, low),
      () => mid.current && paintMid(mid.current, low),
      () => near.current && paintNear(near.current, low),
      () => gal.current && paintGalaxy(gal.current),
      () =>
        pa.current &&
        paintSphere(pa.current, {
          seed: 3, size: low ? 256 : 384, stops: [[58, 22, 32], [120, 52, 62], [190, 112, 112], [236, 190, 172]],
          bands: 5, warp: 1.6, atmosphere: [255, 190, 170], atmo: 0.9,
        }),
      () =>
        pm.current &&
        paintSphere(pm.current, {
          seed: 11, size: 256, stops: [[96, 86, 80], [160, 146, 132], [226, 212, 196], [250, 240, 228]],
          bands: 0, warp: 0, craters: true, atmosphere: [255, 240, 225], atmo: 0.15,
        }),
      () =>
        pr.current &&
        paintSphere(pr.current, {
          seed: 27, size: 256, stops: [[70, 44, 44], [140, 104, 92], [206, 170, 146], [240, 214, 190]],
          bands: 3, warp: 1.1, atmosphere: [240, 210, 170], atmo: 0.5, ring: true,
        }),
    ]
    let i = 0
    let t = window.setTimeout(function run() {
      jobs[i++]?.()
      if (i < jobs.length) t = window.setTimeout(run, 0)
    }, 0)

    let w = window.innerWidth
    let rt: number | undefined
    const onResize = () => {
      if (Math.abs(window.innerWidth - w) < 2) return // ignore mobile address bar changes
      w = window.innerWidth
      window.clearTimeout(rt)
      rt = window.setTimeout(layers, 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(rt)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // A shooting star is rare: one every 12 to 25 seconds, never more than one at a time.
  useEffect(() => {
    if (still || held) return
    let id = 0
    let t: number
    const spawn = () => {
      setMeteors((m) => {
        if (m.length) return m
        const ang = 18 + Math.random() * 17
        const dist = 260 + Math.random() * 200
        const toLeft = Math.random() < 0.5
        const rad = (ang * Math.PI) / 180
        const dx = Math.cos(rad) * dist * (toLeft ? -1 : 1)
        const dy = Math.sin(rad) * dist
        return [{ id: id++, x: 25 + Math.random() * 60, y: 5 + Math.random() * 35, dx, dy, deg: (Math.atan2(dy, dx) * 180) / Math.PI, len: 120 + Math.random() * 100 }]
      })
      t = window.setTimeout(spawn, 12000 + Math.random() * 13000)
    }
    t = window.setTimeout(spawn, 7000)
    return () => window.clearTimeout(t)
  }, [still, held])

  const layer = (a: number, dd: number, dx: string, dy: string) =>
    ({ '--a': a, '--dd': `${dd}s`, '--dx': dx, '--dy': dy }) as CSSProperties

  return (
    <div className={`space${held ? ' space--hold' : ''}`} aria-hidden="true">
      <div className="space__layer" style={layer(1.12, 150, '-1.2%', '-0.8%')}>
        <canvas ref={far} className="space__fill" />
        <canvas ref={gal} className="space__gal" width={360} height={180} />
      </div>
      <div className="space__layer" style={layer(1.35, 110, '-2.4%', '-1.5%')}>
        <canvas ref={mid} className="space__fill" />
        <canvas ref={pa} className="space__pa" width={8} height={8} />
        <canvas ref={pm} className="space__pm" width={8} height={8} />
        <canvas ref={pr} className="space__pr" width={8} height={8} />
        {TWINKLES.map((s, i) => (
          <i
            key={i}
            className="space__tw"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, '--c': s.c, '--d': `${s.d}s`, '--dl': `${s.dl}s` } as CSSProperties}
          />
        ))}
      </div>
      <div className="space__layer" style={layer(1.9, 80, '-3.8%', '-2.4%')}>
        <canvas ref={near} className="space__fill" />
      </div>
      {meteors.map((m) => (
        <i
          key={m.id}
          className="meteor"
          style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.len, '--dx': `${m.dx}px`, '--dy': `${m.dy}px`, '--deg': `${m.deg}deg` } as CSSProperties}
          onAnimationEnd={() => setMeteors((l) => l.filter((x) => x.id !== m.id))}
        />
      ))}
    </div>
  )
}
