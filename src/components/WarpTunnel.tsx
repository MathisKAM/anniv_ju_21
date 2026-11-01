import { useEffect, useRef } from 'react'
import { isLowPower } from '../fx/env'

export const WARP_IN_MS = 1000
export const WARP_OUT_MS = 1900

const VMIN = 0.04
const VMAX = 2.4
const COLORS = ['255,244,225', '255,233,214', '232,200,200', '217,183,122']

interface Star {
  a: number
  r: number
  z: number
  c: number
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const spawn = (s: Star, z = 1) => {
  s.a = Math.random() * Math.PI * 2
  s.r = 0.05 + Math.random() ** 1.3 * 1.4
  s.z = z
  s.c = Math.floor(Math.random() * COLORS.length)
}

/**
 * Hyperspace tunnel drawn on one canvas for the whole journey.
 * 'in': the speed ramps up (cubic), a light opens at the centre, a flash closes the phase.
 * 'out': same speed, then a long deceleration while the flash fades, so the arrival is the continuation of the trip.
 */
export function WarpTunnel({ phase }: { phase: 'in' | 'out' }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const state = useRef({ phase, t0: performance.now() })

  useEffect(() => {
    state.current = { phase, t0: performance.now() }
  }, [phase])

  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const low = isLowPower()
    const dpr = low ? 1 : Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      c.width = Math.round(w * dpr)
      c.height = Math.round(h * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const stars: Star[] = Array.from({ length: low ? 110 : 240 }, () => {
      const s = { a: 0, r: 0, z: 0, c: 0 }
      spawn(s, 0.05 + Math.random() * 0.95)
      return s
    })

    let raf = 0
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(50, now - last) / 1000
      last = now
      const { phase: ph, t0 } = state.current
      const p = Math.min(1, (now - t0) / (ph === 'in' ? WARP_IN_MS : WARP_OUT_MS))

      let v: number
      let glow: number
      let flash: number
      let fade = 1
      if (ph === 'in') {
        v = VMIN + (VMAX - VMIN) * p ** 3
        glow = 1 - (1 - p) ** 2
        flash = smooth(0.8, 1, p)
      } else {
        v = VMIN + (VMAX - VMIN) * (1 - p) ** 3
        glow = (1 - p) ** 2
        flash = 1 - smooth(0, 0.28, p)
        fade = 1 - smooth(0.55, 1, p)
      }

      const cx = w / 2
      const cy = h * 0.46
      const S = Math.max(w, h)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = fade

      // The opening: a warm light that widens as the journey accelerates.
      if (glow > 0.01) {
        const R = S * (0.05 + 0.45 * glow)
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R)
        g.addColorStop(0, `rgba(255,246,228,${0.95 * glow})`)
        g.addColorStop(0.25, `rgba(235,200,150,${0.5 * glow})`)
        g.addColorStop(0.6, `rgba(168,92,97,${0.2 * glow})`)
        g.addColorStop(1, 'rgba(168,92,97,0)')
        ctx.fillStyle = g
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2)
      }
      if (ph === 'in' && p < 0.6) {
        const e = 1 - (1 - Math.min(1, p / 0.4)) ** 3
        ctx.strokeStyle = `rgba(217,183,122,${0.7 * (1 - smooth(0.3, 0.6, p))})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.ellipse(cx, cy, S * 0.1 * e, S * 0.1 * e * 0.82, 0, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Stars rush outward; streaks lengthen with speed.
      const F = S * 0.42
      const tail = v * 0.085
      const sp = (v - VMIN) / (VMAX - VMIN)
      ctx.lineCap = 'round'
      for (const s of stars) {
        s.z -= v * dt
        if (s.z < 0.03) spawn(s)
        const cos = Math.cos(s.a)
        const sin = Math.sin(s.a)
        const x2 = cx + (cos * s.r * F) / s.z
        const y2 = cy + (sin * s.r * F) / s.z
        if (x2 < -40 || x2 > w + 40 || y2 < -40 || y2 > h + 40) {
          spawn(s)
          continue
        }
        const zt = s.z + tail
        const x1 = cx + (cos * s.r * F) / zt
        const y1 = cy + (sin * s.r * F) / zt
        const near = 1 - s.z
        ctx.strokeStyle = `rgba(${COLORS[s.c]},${Math.min(1, near * 1.4) * (0.3 + 0.7 * sp)})`
        ctx.lineWidth = 0.5 + near * 2.2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      if (flash > 0.01) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
        ctx.fillStyle = `rgba(255,244,225,${flash * 0.85})`
        ctx.fillRect(0, 0, w, h)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={ref} className="warp" aria-hidden="true" />
}
