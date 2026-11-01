import { fbm, ridged, rng } from './noise'

type RGB = [number, number, number]

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const ramp = (stops: RGB[], t: number): RGB => {
  const f = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1)
  const i = Math.floor(f)
  const k = f - i
  const a = stops[i]
  const b = stops[i + 1]
  return [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)]
}

function setup(c: HTMLCanvasElement, maxDpr: number) {
  const w = c.clientWidth
  const h = c.clientHeight
  const dpr = Math.min(maxDpr, window.devicePixelRatio || 1)
  c.width = Math.max(1, Math.round(w * dpr))
  c.height = Math.max(1, Math.round(h * dpr))
  const ctx = c.getContext('2d')
  ctx?.scale(dpr, dpr)
  return { ctx, w, h }
}

interface NebulaOpts {
  seed: number
  scale: number
  strength: number
  stops: RGB[]
  cell: number
  ox: number
  oy: number
  gold: number
}

/** Gas clouds: warped fractal noise plus filaments, painted at low resolution and smoothly upscaled. */
function paintNebula(ctx: CanvasRenderingContext2D, w: number, h: number, o: NebulaOpts) {
  const cw = Math.max(8, Math.ceil(w / o.cell))
  const ch = Math.max(8, Math.ceil(h / o.cell))
  const tmp = document.createElement('canvas')
  tmp.width = cw
  tmp.height = ch
  const t = tmp.getContext('2d')
  if (!t) return
  const img = t.createImageData(cw, ch)
  const d = img.data
  const asp = w / h
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const fx = (x / cw) * asp * o.scale + o.ox
      const fy = (y / ch) * o.scale + o.oy
      const wx = fbm(fx * 0.9 + 5.2, fy * 0.9 + 1.3, o.seed + 1, 3)
      const wy = fbm(fx * 0.9 + 8.1, fy * 0.9 + 4.7, o.seed + 2, 3)
      const dd = fbm(fx + wx * 1.7, fy + wy * 1.7, o.seed, 5)
      const fil = ridged(fx * 1.6 + wx * 1.2, fy * 1.6 + wy * 1.2, o.seed + 9, 3)
      const mask = smooth(0.28, 0.72, fbm(fx * 0.45 + 3, fy * 0.45 + 7, o.seed + 30, 2))
      const dens = smooth(0.4, 0.78, dd) * (0.5 + 0.7 * fil) * mask
      const c = ramp(o.stops, Math.min(1, dens * 1.15))
      const gold = o.gold * fil * dens * dens
      const i = (y * cw + x) * 4
      d[i] = c[0] + 217 * gold
      d[i + 1] = c[1] + 183 * gold
      d[i + 2] = c[2] + 122 * gold
      d[i + 3] = Math.min(255, dens * 255 * o.strength)
    }
  }
  t.putImageData(img, 0, 0)
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(tmp, 0, 0, w, h)
  ctx.restore()
}

/** Furthest layer: deep gradient, gas clouds, Milky Way and a dense field of tiny stars. */
export function paintFar(c: HTMLCanvasElement, low: boolean) {
  const { ctx, w, h } = setup(c, 1.5)
  if (!ctx) return
  const rand = rng(21)
  const base = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.8)
  base.addColorStop(0, '#2c1118')
  base.addColorStop(0.6, '#1d0a10')
  base.addColorStop(1, '#0f0508')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  const cell = low ? 9 : 6
  paintNebula(ctx, w, h, {
    seed: 7, scale: 2.4, strength: 0.55, cell, ox: 0, oy: 0, gold: 0.18,
    stops: [[70, 26, 48], [120, 48, 70], [176, 104, 112], [232, 196, 182]],
  })
  paintNebula(ctx, w, h, {
    seed: 31, scale: 1.5, strength: 0.42, cell: cell + 2, ox: 4, oy: 9, gold: 0,
    stops: [[40, 16, 36], [84, 34, 66], [122, 66, 92]],
  })

  // Milky Way: a faint luminous band with a dense cloud of grains.
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate(-0.5)
  const len = Math.hypot(w, h)
  const band = ctx.createLinearGradient(0, -h * 0.3, 0, h * 0.3)
  band.addColorStop(0, 'rgba(247,220,210,0)')
  band.addColorStop(0.5, 'rgba(247,220,210,0.07)')
  band.addColorStop(1, 'rgba(247,220,210,0)')
  ctx.fillStyle = band
  ctx.fillRect(-len, -h * 0.3, len * 2, h * 0.6)
  const grains = low ? 700 : 1800
  for (let i = 0; i < grains; i++) {
    const x = (rand() - 0.5) * len
    const y = (rand() + rand() + rand() - 1.5) * h * 0.2
    ctx.fillStyle = `rgba(255,236,224,${0.06 + rand() * 0.3})`
    ctx.fillRect(x, y, 0.7, 0.7)
  }
  ctx.restore()

  // Distant stars: tiny, countless.
  const count = low ? 500 : 1300
  for (let i = 0; i < count; i++) {
    const r = 0.25 + rand() * 0.4
    ctx.fillStyle = `rgba(255,240,228,${0.2 + rand() * 0.55})`
    ctx.beginPath()
    ctx.arc(rand() * w, rand() * h, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

const TINTS = ['255,255,255', '255,233,214', '232,222,230', '247,238,230', '240,205,190']

/** Middle layer: sharper stars of varied magnitude, a few bright ones with halos and spikes. */
export function paintMid(c: HTMLCanvasElement, low: boolean) {
  const { ctx, w, h } = setup(c, 2)
  if (!ctx) return
  const rand = rng(88)
  const count = Math.min(low ? 70 : 150, Math.round((w * h) / 7000))
  for (let i = 0; i < count; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 0.5 + rand() ** 4 * 1.1
    const tint = TINTS[Math.floor(rand() * TINTS.length)]
    const a = 0.45 + rand() * 0.5
    ctx.fillStyle = `rgba(${tint},${a})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    if (r > 1) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
      g.addColorStop(0, `rgba(${tint},${a * 0.35})`)
      g.addColorStop(1, `rgba(${tint},0)`)
      ctx.fillStyle = g
      ctx.fillRect(x - r * 5, y - r * 5, r * 10, r * 10)
    }
  }
  const bright = low ? 3 : 6
  for (let i = 0; i < bright; i++) {
    const x = w * (0.08 + rand() * 0.84)
    const y = h * (0.06 + rand() * 0.88)
    const r = 1.5 + rand() * 0.8
    const tint = i % 3 === 0 ? '217,183,122' : TINTS[i % TINTS.length]
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 11)
    g.addColorStop(0, `rgba(${tint},0.5)`)
    g.addColorStop(0.3, `rgba(${tint},0.12)`)
    g.addColorStop(1, `rgba(${tint},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r * 11, y - r * 11, r * 22, r * 22)
    ctx.strokeStyle = `rgba(${tint},0.3)`
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(x - r * 9, y)
    ctx.lineTo(x + r * 9, y)
    ctx.moveTo(x, y - r * 9)
    ctx.lineTo(x, y + r * 9)
    ctx.stroke()
    ctx.fillStyle = `rgba(255,250,240,0.95)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Foreground: a few soft out-of-focus particles and rare close specks. */
export function paintNear(c: HTMLCanvasElement, low: boolean) {
  const { ctx, w, h } = setup(c, 1.5)
  if (!ctx) return
  const rand = rng(404)
  const bokeh = low ? 8 : 16
  const cols = ['247,225,210', '220,160,160', '217,183,122']
  for (let i = 0; i < bokeh; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 4 + rand() ** 2 * 14
    const col = cols[i % cols.length]
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${col},0.02)`)
    g.addColorStop(0.7, `rgba(${col},0.05)`)
    g.addColorStop(0.92, `rgba(${col},0.1)`)
    g.addColorStop(1, `rgba(${col},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  const specks = low ? 12 : 28
  for (let i = 0; i < specks; i++) {
    ctx.fillStyle = `rgba(255,240,226,${0.25 + rand() * 0.4})`
    ctx.beginPath()
    ctx.arc(rand() * w, rand() * h, 0.8 + rand() * 0.9, 0, Math.PI * 2)
    ctx.fill()
  }
}

export interface SphereOpts {
  seed: number
  size: number
  stops: RGB[]
  bands: number
  warp: number
  craters?: boolean
  atmosphere: RGB
  atmo: number
  ring?: boolean
}

const LX = 0.62
const LY = -0.5
const LZ = 0.6
const LN = Math.hypot(LX, LY, LZ)

/** Lit sphere with procedural surface, soft terminator, limb darkening and atmospheric rim. Light comes from the upper right. */
export function paintSphere(c: HTMLCanvasElement, o: SphereOpts) {
  const S = o.size
  const W = o.ring ? Math.round(S * 1.56) : S
  c.width = W
  c.height = S
  const ctx = c.getContext('2d')
  if (!ctx) return
  const R = S * 0.39
  const cx = W / 2
  const cy = S / 2
  const sphere = document.createElement('canvas')
  sphere.width = W
  sphere.height = S
  const sctx = sphere.getContext('2d')
  if (!sctx) return
  const img = sctx.createImageData(W, S)
  const d = img.data
  const lx = LX / LN
  const ly = LY / LN
  const lz = LZ / LN
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < W; x++) {
      const nx = (x - cx) / R
      const ny = (y - cy) / R
      const r2 = nx * nx + ny * ny
      const i = (y * W + x) * 4
      if (r2 <= 1) {
        const r = Math.sqrt(r2)
        const nz = Math.sqrt(1 - r2)
        const l = nx * lx + ny * ly + nz * lz
        const shade = smooth(-0.08, 0.85, l)
        const u = nx / (nz * 0.5 + 0.5)
        const v = ny
        let tex: number
        if (o.craters) {
          const m = fbm(u * 2.2 + 3, v * 2.2 + 1, o.seed, 4)
          const k = ridged(u * 7, v * 7, o.seed + 5, 3)
          tex = mix(m, 1 - k, 0.35)
        } else {
          const wv = fbm(u * 2.4, v * 2.4, o.seed, 3) * o.warp
          const band = 0.5 + 0.5 * Math.sin((v * o.bands + wv) * 6.283)
          tex = 0.62 * band + 0.38 * fbm(u * 5 + 9, v * 5, o.seed + 4, 4)
        }
        const col = ramp(o.stops, tex)
        const k = (0.05 + shade * 1.05) * (0.5 + 0.5 * nz)
        const rim = (1 - nz) ** 3 * smooth(-0.2, 0.7, l) * o.atmo
        d[i] = col[0] * k + o.atmosphere[0] * rim
        d[i + 1] = col[1] * k + o.atmosphere[1] * rim
        d[i + 2] = col[2] * k + o.atmosphere[2] * rim
        d[i + 3] = 255 * Math.min(1, (1 - r) * R)
      } else if (o.atmo > 0) {
        const r = Math.sqrt(r2)
        if (r < 1.16) {
          const lit = smooth(-0.3, 0.8, (nx / r) * lx + (ny / r) * ly + 0.2)
          const a = (1 - (r - 1) / 0.16) ** 2.2 * 0.4 * lit * o.atmo
          d[i] = o.atmosphere[0]
          d[i + 1] = o.atmosphere[1]
          d[i + 2] = o.atmosphere[2]
          d[i + 3] = 255 * a
        }
      }
    }
  }
  sctx.putImageData(img, 0, 0)

  const ringPass = (from: number, to: number) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(-0.3)
    const bands: [number, number, number][] = [
      [1.45, 0.07, 0.16],
      [1.6, 0.1, 0.32],
      [1.75, 0.06, 0.24],
      [1.9, 0.03, 0.12],
    ]
    for (const [k, wd, a] of bands) {
      ctx.strokeStyle = `rgba(226,196,170,${a})`
      ctx.lineWidth = wd * R
      ctx.beginPath()
      ctx.ellipse(0, 0, R * k, R * k * 0.24, 0, from, to)
      ctx.stroke()
    }
    ctx.restore()
  }
  if (o.ring) ringPass(Math.PI, Math.PI * 2)
  ctx.drawImage(sphere, 0, 0)
  if (o.ring) ringPass(0, Math.PI)
}

/** Distant spiral galaxy, seen at a steep angle. */
export function paintGalaxy(c: HTMLCanvasElement) {
  c.width = 360
  c.height = 180
  const ctx = c.getContext('2d')
  if (!ctx) return
  const rand = rng(5)
  ctx.translate(180, 90)
  ctx.rotate(-0.35)
  ctx.scale(1, 0.38)
  const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, 150)
  haze.addColorStop(0, 'rgba(255,226,200,0.5)')
  haze.addColorStop(0.15, 'rgba(230,160,150,0.22)')
  haze.addColorStop(0.5, 'rgba(150,80,100,0.08)')
  haze.addColorStop(1, 'rgba(150,80,100,0)')
  ctx.fillStyle = haze
  ctx.fillRect(-180, -180, 360, 360)
  ctx.globalCompositeOperation = 'lighter'
  for (let k = 0; k < 2; k++) {
    for (let i = 0; i < 900; i++) {
      const th = rand() * 6
      const r = 14 * Math.exp(0.3 * th)
      const ang = th + k * Math.PI
      const sc = r * 0.18
      const x = Math.cos(ang) * r + (rand() + rand() + rand() - 1.5) * sc
      const y = Math.sin(ang) * r + (rand() + rand() + rand() - 1.5) * sc
      ctx.fillStyle = rand() < 0.7 ? `rgba(255,226,208,${0.05 + rand() * 0.35})` : `rgba(220,150,150,${0.05 + rand() * 0.3})`
      ctx.fillRect(x, y, 1, 1)
    }
  }
}
