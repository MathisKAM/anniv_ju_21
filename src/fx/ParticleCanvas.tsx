import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { particleScale, prefersReducedMotion } from './env'
import type { Point } from './shapes'

export type ParticleKind = 'star' | 'dust' | 'spark' | 'petal' | 'converge'

export interface EmitOptions {
  kind: ParticleKind
  count: number
  /** Origin in CSS px (defaults to the canvas centre). */
  x?: number
  y?: number
  /** Random offset around the origin, in px. */
  area?: number
  /** Initial speed in px/s. */
  speed?: number
  /** Radius in px. */
  size?: number
  /** Peak opacity, 0 to 1. */
  opacity?: number
  /** Degrees: 0 = right, -90 = up. */
  direction?: number
  /** Cone width in degrees (360 = every direction). */
  spread?: number
  /** Lifetime in ms. */
  duration?: number
  colors?: string[]
  /** px/s², positive = downwards. */
  gravity?: number
  /** `converge`: points the particles fly to. */
  targets?: Point[]
  /** `converge`: ms spent shining on the target before fading. */
  hold?: number
  /** Random start delay in ms. */
  delayJitter?: number
}

export interface FxHandle {
  emit(options: EmitOptions): void
  clear(): void
  size(): { w: number; h: number }
}

interface Particle {
  kind: ParticleKind
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  age: number
  delay: number
  life: number
  size: number
  alpha: number
  color: string
  seed: number
  rot: number
  vr: number
  sx: number
  sy: number
  tx: number
  ty: number
  arrive: number
}

const FADE_TAIL = 500
const rand = (a: number, b: number) => a + Math.random() * (b - a)

/**
 * Canvas 2D particle layer. It only runs its animation loop while particles are alive,
 * and cancels everything on unmount. Reduced-motion users get no particles.
 */
export const ParticleCanvas = forwardRef<FxHandle, { className?: string }>(function ParticleCanvas({ className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particles = useRef<Particle[]>([])
  const frame = useRef(0)
  const last = useRef(0)
  const dims = useRef({ w: 0, h: 0, dpr: 1 })

  const draw = (t: number) => {
    const c = canvasRef.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const dt = Math.min(50, t - last.current)
    last.current = t
    const { w, h, dpr } = dims.current
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const alive: Particle[] = []
    for (const p of particles.current) {
      p.age += dt
      const a = p.age - p.delay
      if (a < 0) {
        alive.push(p)
        continue
      }
      const total = p.kind === 'converge' ? p.life + FADE_TAIL : p.life
      if (a > total) continue
      alive.push(p)

      let alpha = p.alpha
      if (p.kind === 'converge') {
        const u = Math.min(1, a / p.arrive)
        const e = 1 - (1 - u) ** 3
        p.x = p.sx + (p.tx - p.sx) * e
        p.y = p.sy + (p.ty - p.sy) * e
        alpha *= Math.min(1, a / 200) * (a > p.life ? 1 - (a - p.life) / FADE_TAIL : 1)
        if (u >= 1) alpha *= 0.75 + 0.25 * Math.sin(a / 260 + p.seed)
      } else {
        const s = dt / 1000
        p.vy += p.gravity * s
        p.x += p.vx * s + (p.kind === 'petal' ? Math.sin(a / 420 + p.seed) * 22 * s : 0)
        p.y += p.vy * s
        p.rot += p.vr * s
        const f = a / p.life
        alpha *= Math.min(1, f * 8) * (1 - Math.max(0, (f - 0.55) / 0.45))
        if (p.kind === 'star') alpha *= 0.6 + 0.4 * Math.sin(a / 300 + p.seed)
      }
      if (alpha <= 0.01) continue

      ctx.globalCompositeOperation = p.kind === 'petal' ? 'source-over' : 'lighter'
      ctx.fillStyle = p.color
      if (p.kind === 'petal') {
        ctx.globalAlpha = alpha
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.beginPath()
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      } else if (p.kind === 'spark') {
        const len = Math.min(10, Math.hypot(p.vx, p.vy) * 0.06) + p.size
        const ang = Math.atan2(p.vy, p.vx)
        ctx.globalAlpha = alpha
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size * 0.7
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - Math.cos(ang) * len, p.y - Math.sin(ang) * len)
        ctx.stroke()
      } else {
        ctx.globalAlpha = alpha * 0.22
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    particles.current = alive
    ctx.globalAlpha = 1
    frame.current = alive.length ? requestAnimationFrame(draw) : 0
    if (!alive.length) ctx.clearRect(0, 0, w, h)
  }

  const start = () => {
    if (frame.current) return
    last.current = performance.now()
    frame.current = requestAnimationFrame(draw)
  }

  useImperativeHandle(ref, () => ({
    emit(o) {
      if (prefersReducedMotion()) return
      const { w, h } = dims.current
      const count = Math.max(1, Math.round(o.count * particleScale()))
      const colors = o.colors ?? ['#D9B77A']
      const list: Particle[] = []
      for (let i = 0; i < count; i++) {
        const ox = (o.x ?? w / 2) + rand(-1, 1) * (o.area ?? 0)
        const oy = (o.y ?? h / 2) + rand(-1, 1) * (o.area ?? 0)
        const ang = (((o.direction ?? -90) + rand(-0.5, 0.5) * (o.spread ?? 360)) * Math.PI) / 180
        const sp = (o.speed ?? 60) * rand(0.5, 1.3)
        const target = o.targets?.[i % (o.targets?.length || 1)]
        // converge: start on a ring around the target for a clean inward flow
        const startAng = rand(0, Math.PI * 2)
        const startR = Math.max(w, h) * rand(0.5, 0.9)
        list.push({
          kind: o.kind,
          x: ox,
          y: oy,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          gravity: o.gravity ?? 0,
          age: 0,
          delay: rand(0, o.delayJitter ?? 0),
          life: o.kind === 'converge' ? (o.hold ?? 1200) : (o.duration ?? 1500) * rand(0.7, 1.1),
          size: (o.size ?? 2) * rand(0.6, 1.2),
          alpha: o.opacity ?? 0.9,
          color: colors[Math.floor(Math.random() * colors.length)],
          seed: rand(0, 6.28),
          rot: rand(0, 6.28),
          vr: rand(-2, 2),
          sx: (w / 2) + Math.cos(startAng) * startR,
          sy: (h / 2) + Math.sin(startAng) * startR,
          tx: target?.x ?? ox,
          ty: target?.y ?? oy,
          arrive: (o.duration ?? 1800) * rand(0.7, 1),
        })
      }
      particles.current.push(...list)
      start()
    },
    clear() {
      particles.current = []
    },
    size: () => ({ w: dims.current.w, h: dims.current.h }),
  }))

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const resize = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      dims.current = { w: r.width, h: r.height, dpr }
      c.width = Math.round(r.width * dpr)
      c.height = Math.round(r.height * dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(frame.current)
      frame.current = 0
      particles.current = []
    }
  }, [])

  return <canvas ref={canvasRef} className={`fx${className ? ` ${className}` : ''}`} aria-hidden="true" />
})
