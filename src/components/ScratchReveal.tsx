import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { scratchCard } from '../content/games'
import { isLowPower, prefersReducedMotion } from '../fx/env'
import { rng } from '../fx/noise'

const BRUSH = 23 // radius in CSS px
const CELL = 11 // coverage grid, in CSS px
const CLEAR_RATIO = 0.52
const WIPE_MS = 950
const FLECK_COLORS = ['#f4e6d8', '#e8d3c6', '#c9a99f', '#d9b77a', '#fff6ea']

type Fleck = { x: number; y: number; vx: number; vy: number; r: number; a: number; va: number; life: number; age: number; c: string; w: number }

/** Scratch-off foil over `children`. `after` is shown once revealed. */
export function ScratchReveal({
  children,
  after,
  onReveal,
}: {
  children: ReactNode
  after: ReactNode
  onReveal?: () => void
}) {
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)
  const [touched, setTouched] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const fxCanvas = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const grid = useRef<{ cols: number; rows: number; hit: Uint8Array; n: number } | null>(null)
  const flecks = useRef<Fleck[]>([])
  const raf = useRef(0)
  const finished = useRef(false)
  const dirty = useRef(false)
  const rand = useRef(rng(7))
  const reduced = useRef(false)

  const paintFoil = () => {
    const c = canvas.current
    const w = wrap.current
    const ctx = c?.getContext('2d')
    if (!c || !w || !ctx) return
    const { width, height } = w.getBoundingClientRect()
    if (!width || !height) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = Math.round(width * dpr)
    c.height = Math.round(height * dpr)
    const fx = fxCanvas.current
    if (fx) {
      fx.width = c.width
      fx.height = c.height
    }
    const W = c.width
    const H = c.height
    const r = rng(2024)

    // Satin champagne-rose metal.
    const g = ctx.createLinearGradient(0, 0, W, H)
    g.addColorStop(0, '#bf9a90')
    g.addColorStop(0.22, '#e6d0c4')
    g.addColorStop(0.42, '#c7a69b')
    g.addColorStop(0.64, '#ecdace')
    g.addColorStop(0.82, '#cfaea3')
    g.addColorStop(1, '#ab867c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)

    // Fine engraved lattice (guilloche-like), dark line + light line for a stamped relief.
    ctx.lineWidth = Math.max(1, dpr * 0.7)
    const step = 12 * dpr
    for (let k = -H; k < W + H; k += step) {
      ctx.strokeStyle = 'rgba(92,52,52,0.11)'
      ctx.beginPath()
      ctx.moveTo(k, 0)
      ctx.lineTo(k + H, H)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(k, H)
      ctx.lineTo(k + H, 0)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(255,248,240,0.16)'
      ctx.beginPath()
      ctx.moveTo(k + dpr, 0)
      ctx.lineTo(k + H + dpr, H)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(k + dpr, H)
      ctx.lineTo(k + H + dpr, 0)
      ctx.stroke()
    }

    // Brushed micro-lines.
    for (let y = 0; y < H; y += dpr * 1.5) {
      ctx.globalAlpha = 0.03 + r() * 0.07
      ctx.fillStyle = r() > 0.5 ? '#fff' : '#6d4a46'
      const x0 = r() * W * 0.4
      ctx.fillRect(x0, y, W * (0.4 + r() * 0.6), dpr * 0.7)
    }
    // Grain.
    const n = Math.min(26000, Math.round((W * H) / 38))
    for (let i = 0; i < n; i++) {
      ctx.globalAlpha = 0.06 + r() * 0.16
      ctx.fillStyle = r() > 0.5 ? '#fffaf2' : '#5a3a38'
      ctx.fillRect(r() * W, r() * H, dpr, dpr)
    }
    ctx.globalAlpha = 1

    // Soft diagonal light bands.
    const band = (pos: number, wd: number, a: number) => {
      const b = ctx.createLinearGradient(W * (pos - wd), 0, W * (pos + wd), H * 0.9)
      b.addColorStop(0, 'rgba(255,248,236,0)')
      b.addColorStop(0.5, `rgba(255,248,236,${a})`)
      b.addColorStop(1, 'rgba(255,248,236,0)')
      ctx.fillStyle = b
      ctx.fillRect(0, 0, W, H)
    }
    band(0.3, 0.22, 0.28)
    band(0.78, 0.12, 0.16)

    // Pressed frame.
    const m = 14 * dpr
    ctx.lineWidth = dpr
    ctx.strokeStyle = 'rgba(92,52,52,0.35)'
    ctx.strokeRect(m, m, W - 2 * m, H - 2 * m)
    ctx.strokeStyle = 'rgba(255,248,240,0.55)'
    ctx.strokeRect(m + dpr, m + dpr, W - 2 * m, H - 2 * m)

    // Engraved legend.
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `italic 500 ${Math.round(Math.min(34, width * 0.1) * dpr)}px "Cormorant Garamond", Georgia, serif`
    const cx = W / 2
    const cy = H / 2
    ctx.fillStyle = 'rgba(255,248,240,0.7)'
    ctx.fillText(scratchCard.cover, cx - dpr * 0.8, cy - dpr * 0.8)
    ctx.fillStyle = 'rgba(70,36,38,0.45)'
    ctx.fillText(scratchCard.cover, cx + dpr * 0.8, cy + dpr * 0.8)
    ctx.fillStyle = '#7d5a56'
    ctx.fillText(scratchCard.cover, cx, cy)
    // Small ornament under the legend.
    const oy = cy + 30 * dpr
    ctx.strokeStyle = 'rgba(125,90,86,0.7)'
    ctx.beginPath()
    ctx.moveTo(cx - 34 * dpr, oy)
    ctx.lineTo(cx - 7 * dpr, oy)
    ctx.moveTo(cx + 7 * dpr, oy)
    ctx.lineTo(cx + 34 * dpr, oy)
    ctx.stroke()
    ctx.fillStyle = 'rgba(125,90,86,0.8)'
    ctx.beginPath()
    ctx.moveTo(cx, oy - 3.5 * dpr)
    ctx.lineTo(cx + 3.5 * dpr, oy)
    ctx.lineTo(cx, oy + 3.5 * dpr)
    ctx.lineTo(cx - 3.5 * dpr, oy)
    ctx.closePath()
    ctx.fill()

    const cols = Math.max(1, Math.ceil(width / CELL))
    const rows = Math.max(1, Math.ceil(height / CELL))
    grid.current = { cols, rows, hit: new Uint8Array(cols * rows), n: 0 }
  }

  useLayoutEffect(() => {
    reduced.current = prefersReducedMotion()
    paintFoil()
    const w = wrap.current
    const ro = typeof ResizeObserver !== 'undefined' && w ? new ResizeObserver(() => !dirty.current && !finished.current && paintFoil()) : null
    if (w) ro?.observe(w)
    // The legend uses the serif face: repaint once it is available (only if nothing was scratched yet).
    document.fonts?.ready.then(() => !dirty.current && !finished.current && paintFoil())
    return () => ro?.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
    },
    [],
  )

  /** Foil shavings: tiny flecks that spring from the stroke and fall. */
  const loop = () => {
    raf.current = 0
    const c = fxCanvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    const dpr = c.width / (wrap.current?.getBoundingClientRect().width || c.width)
    const dt = 16
    const list = flecks.current
    for (let i = list.length - 1; i >= 0; i--) {
      const f = list[i]
      f.age += dt
      if (f.age >= f.life) {
        list.splice(i, 1)
        continue
      }
      f.vy += 0.032 * dt
      f.x += f.vx * dt * 0.06
      f.y += f.vy * dt * 0.06
      f.a += f.va
      const k = 1 - f.age / f.life
      ctx.save()
      ctx.globalAlpha = Math.min(1, k * 1.6) * 0.9
      ctx.translate(f.x * dpr, f.y * dpr)
      ctx.rotate(f.a)
      ctx.fillStyle = f.c
      ctx.fillRect((-f.r * dpr) / 2, (-f.w * dpr) / 2, f.r * dpr, f.w * dpr)
      ctx.restore()
    }
    if (list.length) raf.current = requestAnimationFrame(loop)
    else ctx.clearRect(0, 0, c.width, c.height)
  }
  const emit = (x: number, y: number, count: number, power = 1) => {
    if (reduced.current) return
    const R = rand.current
    const n = Math.max(1, Math.round(count * (isLowPower() ? 0.5 : 1)))
    for (let i = 0; i < n && flecks.current.length < 70; i++) {
      const ang = R() * Math.PI * 2
      const sp = (0.4 + R() * 1.3) * power
      flecks.current.push({
        x, y, vx: Math.cos(ang) * sp * 14, vy: Math.sin(ang) * sp * 10 - 8 * power,
        r: 1.6 + R() * 2.6, w: 0.9 + R() * 1.1, a: R() * 6, va: (R() - 0.5) * 0.3,
        life: 520 + R() * 520, age: 0, c: FLECK_COLORS[(R() * FLECK_COLORS.length) | 0],
      })
    }
    if (!raf.current) raf.current = requestAnimationFrame(loop)
  }

  /** One irregular blob: foil never tears in perfect circles. */
  const blob = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) => {
    const R = rand.current
    const pts = 11
    ctx.beginPath()
    for (let i = 0; i <= pts; i++) {
      const a = rot + (i / pts) * Math.PI * 2
      const rr = r * (0.8 + R() * 0.36)
      const px = x + Math.cos(a) * rr
      const py = y + Math.sin(a) * rr
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
  }

  const mark = (cx: number, cy: number) => {
    const g = grid.current
    if (!g) return
    const rr = (BRUSH * 0.95) ** 2
    const c0 = Math.max(0, Math.floor((cx - BRUSH) / CELL))
    const c1 = Math.min(g.cols - 1, Math.floor((cx + BRUSH) / CELL))
    const r0 = Math.max(0, Math.floor((cy - BRUSH) / CELL))
    const r1 = Math.min(g.rows - 1, Math.floor((cy + BRUSH) / CELL))
    for (let r = r0; r <= r1; r++) {
      for (let q = c0; q <= c1; q++) {
        const i = r * g.cols + q
        if (g.hit[i]) continue
        const dx = (q + 0.5) * CELL - cx
        const dy = (r + 0.5) * CELL - cy
        if (dx * dx + dy * dy <= rr) {
          g.hit[i] = 1
          g.n++
        }
      }
    }
  }

  const finish = (fromX?: number, fromY?: number) => {
    if (finished.current) return
    finished.current = true
    drawing.current = false
    setDone(true)
    onReveal?.()
    const c = canvas.current
    const ctx = c?.getContext('2d')
    const w = wrap.current
    if (!c || !ctx || !w || reduced.current) {
      setGone(true)
      return
    }
    const rect = w.getBoundingClientRect()
    const k = c.width / rect.width
    const cx = (fromX ?? rect.width / 2) * k
    const cy = (fromY ?? rect.height / 2) * k
    const far = Math.hypot(Math.max(cx, c.width - cx), Math.max(cy, c.height - cy)) * 1.08
    const t0 = performance.now()
    for (let i = 0; i < 4; i++) emit(Math.random() * rect.width, Math.random() * rect.height, 6, 0.8)
    const step = (now: number) => {
      const p = Math.max(0, Math.min(1, (now - t0) / WIPE_MS))
      const e = 1 - (1 - p) ** 3
      const r = far * e
      ctx.globalCompositeOperation = 'destination-out'
      const g = ctx.createRadialGradient(cx, cy, r * 0.55, cx, cy, Math.max(r, 1))
      g.addColorStop(0, 'rgba(0,0,0,1)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, Math.max(r, 1), 0, Math.PI * 2)
      ctx.fill()
      if (p < 1) {
        if (Math.random() < 0.5) {
          const a = Math.random() * Math.PI * 2
          emit(cx / k + Math.cos(a) * (r / k) * 0.85, cy / k + Math.sin(a) * (r / k) * 0.85, 2, 0.7)
        }
        requestAnimationFrame(step)
      } else {
        ctx.clearRect(0, 0, c.width, c.height)
        setGone(true)
      }
    }
    requestAnimationFrame(step)
  }

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top, k: e.currentTarget.width / r.width }
  }

  const gloss = (x: number, y: number) => {
    const w = wrap.current
    if (!w) return
    const r = w.getBoundingClientRect()
    w.style.setProperty('--px', `${(x / r.width) * 100}%`)
    w.style.setProperty('--py', `${(y / r.height) * 100}%`)
  }

  const scratch = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    const p = point(e)
    gloss(p.x, p.y)
    if (!drawing.current || !c || !ctx || finished.current) return
    const from = last.current ?? { x: p.x, y: p.y }
    const dist = Math.hypot(p.x - from.x, p.y - from.y)
    const steps = Math.max(1, Math.ceil(dist / (BRUSH * 0.45)))
    for (let i = 1; i <= steps; i++) {
      const x = from.x + ((p.x - from.x) * i) / steps
      const y = from.y + ((p.y - from.y) * i) / steps
      const rot = rand.current() * 6.28
      // Lit rim on the foil that remains, then the tear itself.
      ctx.globalCompositeOperation = 'source-atop'
      ctx.fillStyle = 'rgba(255,247,238,0.5)'
      blob(ctx, x * p.k, y * p.k, (BRUSH + 2.6) * p.k, rot)
      ctx.fill()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = '#000'
      blob(ctx, x * p.k, y * p.k, BRUSH * p.k, rot + 1)
      ctx.fill()
      mark(x, y)
    }
    if (dist > 2) emit(p.x, p.y, Math.min(3, 1 + dist / 18))
    last.current = { x: p.x, y: p.y }
    lastPoint.current = { x: p.x, y: p.y }
    dirty.current = true
    const g = grid.current
    if (g && g.n / (g.cols * g.rows) > CLEAR_RATIO) finish(p.x, p.y)
  }

  return (
    <>
      <div className={`scratch${done ? ' is-done' : ''}`} ref={wrap}>
        {children}
        {!gone && (
          <>
            <canvas
              ref={canvas}
              className="scratch__foil"
              aria-hidden="true"
              onPointerDown={(e) => {
                if (finished.current) return
                drawing.current = true
                dirty.current = true
                if (!touched) setTouched(true)
                e.currentTarget.setPointerCapture(e.pointerId)
                last.current = null
                scratch(e)
              }}
              onPointerMove={scratch}
              onPointerUp={() => {
                drawing.current = false
                last.current = null
              }}
              onPointerCancel={() => {
                drawing.current = false
                last.current = null
              }}
            />
            <canvas ref={fxCanvas} className="scratch__fx" aria-hidden="true" />
            <span className="scratch__gloss" aria-hidden="true" />
          </>
        )}
      </div>
      {done ? (
        after
      ) : (
        <div className={`scratch__help${touched ? ' is-quiet' : ''}`}>
          <p className="hint">{scratchCard.hint}</p>
          <button type="button" className="link" onClick={() => finish(lastPoint.current?.x, lastPoint.current?.y)}>
            {scratchCard.revealAll}
          </button>
        </div>
      )}
    </>
  )
}
