import { memo, type CSSProperties } from 'react'

/** The cake is drawn in a 320 x 320 box; every position below is in that space. */
export const BOX = 320

const CX = 160
const L = 62
const R = 258
const RX = 98

export interface CandleSpec {
  x: number
  base: number
  h: number
  /** Y of the wick tip, where the flame is born. */
  wick: number
  lean: number
  fd: number
  tone: number
}

const H = [60, 70, 56, 64, 58]
const LEAN = [1, 0.9, 1.12, 1, 0.95]
const FD = [1.9, 2.3, 1.7, 2.1, 2.0]

/** Candles are spread on the top of the cake; the middle one stands a little further back. */
export function layoutCandles(n: number): CandleSpec[] {
  const m = (n - 1) / 2
  return Array.from({ length: n }, (_, i) => {
    const off = i - m
    const depth = m ? 1 - Math.abs(off) / m : 1
    const base = 154 - 7 * depth
    const h = H[i % H.length]
    return { x: CX + off * 44, base, h, wick: base - h - 8, lean: LEAN[i % LEAN.length], fd: FD[i % FD.length], tone: i % 2 }
  })
}

/** The icing edge: a soft irregular wave plus a few rounded drips. */
const frostPoints = (() => {
  const drips = [
    { x: 84, d: 22, w: 5 },
    { x: 131, d: 11, w: 4.5 },
    { x: 176, d: 26, w: 5.5 },
    { x: 222, d: 15, w: 5 },
    { x: 248, d: 9, w: 4 },
  ]
  const pts: string[] = []
  for (let x = L; x <= R; x += 2) {
    const u = (x - CX) / RX
    const s = Math.sqrt(Math.max(0, 1 - u * u))
    let y = 150 + 22 * s + 11 + 3.2 * Math.sin(x * 0.17) + 2.4 * Math.sin(x * 0.43 + 1)
    for (const d of drips) y += d.d * Math.exp(-(((x - d.x) / d.w) ** 2))
    pts.push(`${x} ${y.toFixed(1)}`)
  }
  return pts
})()
const FROST = `M${L} 140 L${frostPoints.join(' L')} L${R} 140 Z`
const FROST_EDGE = `M${frostPoints.join(' L')}`

/** Front curve of the base goes through the bottom of the ellipse: sweep flag 0 from left to right. */
const BODY_PATH = `M${L} 150 V262 A${RX} 15 0 0 0 ${R} 262 V150 Z`
const ribbon = (y: number, h: number) => `M${L} ${y} A${RX} 15 0 0 0 ${R} ${y} V${y + h} A${RX} 15 0 0 1 ${L} ${y + h} Z`

const ROSETTES = Array.from({ length: 10 }, (_, k) => {
  const t = ((k * 36 + 18) * Math.PI) / 180
  return { x: CX + 80 * Math.cos(t), y: 150 + 15.5 * Math.sin(t), front: Math.sin(t) > 0, berry: k === 1 || k === 4 || k === 7, k }
})
const PEARLS = Array.from({ length: 11 }, (_, k) => {
  const t = Math.PI * (0.09 + (k / 10) * 0.82)
  return { x: CX + (RX - 2) * Math.cos(t), y: 262 + 14 * Math.sin(t) - 3 }
})
const LEAFS = [
  { x: 134, y: 137, r: 20, s: 1 },
  { x: 192, y: 138, r: -35, s: 0.8 },
  { x: 146, y: 168, r: 62, s: 0.9 },
  { x: 214, y: 162, r: 10, s: 0.75 },
  { x: 104, y: 154, r: 80, s: 0.7 },
]

function Defs() {
  return (
    <defs>
      <linearGradient id="bdSponge" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f3e0ba" />
        <stop offset="1" stopColor="#d9b484" />
      </linearGradient>
      <linearGradient id="bdSide" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#2a0d12" stopOpacity=".5" />
        <stop offset=".2" stopColor="#2a0d12" stopOpacity="0" />
        <stop offset=".38" stopColor="#fff" stopOpacity=".12" />
        <stop offset=".58" stopColor="#2a0d12" stopOpacity="0" />
        <stop offset="1" stopColor="#2a0d12" stopOpacity=".55" />
      </linearGradient>
      <linearGradient id="bdFrost" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#c99a9a" />
        <stop offset=".35" stopColor="#f2d8d2" />
        <stop offset=".68" stopColor="#e3bcb6" />
        <stop offset="1" stopColor="#b48184" />
      </linearGradient>
      <radialGradient id="bdTop" cx=".42" cy=".38" r=".75">
        <stop offset="0" stopColor="#fdeee8" />
        <stop offset=".55" stopColor="#edcdc7" />
        <stop offset="1" stopColor="#d6a7a5" />
      </radialGradient>
      <linearGradient id="bdCream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fffaf1" />
        <stop offset="1" stopColor="#efdfcd" />
      </linearGradient>
      <radialGradient id="bdRos" cx=".4" cy=".35" r=".7">
        <stop offset="0" stopColor="#fffdf8" />
        <stop offset=".6" stopColor="#f6e8da" />
        <stop offset="1" stopColor="#dcc0b2" />
      </radialGradient>
      <radialGradient id="bdBerry" cx=".38" cy=".32" r=".8">
        <stop offset="0" stopColor="#d4636f" />
        <stop offset=".6" stopColor="#a13447" />
        <stop offset="1" stopColor="#6e1c2c" />
      </radialGradient>
      <radialGradient id="bdGold" cx=".35" cy=".3" r=".8">
        <stop offset="0" stopColor="#fff2cf" />
        <stop offset=".6" stopColor="#d9b77a" />
        <stop offset="1" stopColor="#a8803f" />
      </radialGradient>
      <radialGradient id="bdPlate" cx=".5" cy=".4" r=".75">
        <stop offset="0" stopColor="#fffaf3" />
        <stop offset=".7" stopColor="#efdfd3" />
        <stop offset="1" stopColor="#d9c1b5" />
      </radialGradient>
      <radialGradient id="bdShadow">
        <stop offset="0" stopColor="#000" stopOpacity=".6" />
        <stop offset=".6" stopColor="#000" stopOpacity=".25" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="bdWax" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#cdb5a9" />
        <stop offset=".35" stopColor="#fff7ee" />
        <stop offset=".7" stopColor="#f2e0d3" />
        <stop offset="1" stopColor="#bfa397" />
      </linearGradient>
      <pattern id="bdStripe0" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
        <rect width="13" height="5.5" fill="#c4777c" opacity=".78" />
      </pattern>
      <pattern id="bdStripe1" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
        <rect width="13" height="5.5" fill="#d9b77a" opacity=".85" />
      </pattern>
      <radialGradient id="bdFlame" cx=".5" cy=".8" r=".72">
        <stop offset="0" stopColor="#fffbe8" />
        <stop offset=".3" stopColor="#ffd983" />
        <stop offset=".66" stopColor="#f6a53f" />
        <stop offset="1" stopColor="#f07a28" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bdCore" cx=".5" cy=".75" r=".7">
        <stop offset="0" stopColor="#fff" />
        <stop offset=".6" stopColor="#ffeab0" />
        <stop offset="1" stopColor="#ffdc8c" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bdHalo">
        <stop offset="0" stopColor="#ffd08a" stopOpacity=".62" />
        <stop offset=".38" stopColor="#ffa655" stopOpacity=".22" />
        <stop offset="1" stopColor="#ff8c3c" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="bdPool">
        <stop offset="0" stopColor="#ffd9a0" stopOpacity=".6" />
        <stop offset=".5" stopColor="#ffb878" stopOpacity=".2" />
        <stop offset="1" stopColor="#ffb878" stopOpacity="0" />
      </radialGradient>
      <clipPath id="bdBody">
        <path d={BODY_PATH} />
      </clipPath>
      <clipPath id="bdCake">
        <path d={BODY_PATH} />
        <ellipse cx={CX} cy="150" rx={RX} ry="22" />
      </clipPath>
    </defs>
  )
}

/** Plate, sponge layers, icing and decorations. Static, so it is drawn once. */
export const CakeArt = memo(function CakeArt() {
  return (
    <g>
      <Defs />
      {/* table shadow and plate */}
      <ellipse cx={CX} cy="288" rx="172" ry="25" fill="url(#bdShadow)" />
      <ellipse cx={CX} cy="282" rx="142" ry="19" fill="#a98f85" />
      <ellipse cx={CX} cy="275" rx="142" ry="19" fill="url(#bdPlate)" stroke="#d9b77a" strokeOpacity=".55" strokeWidth=".8" />
      <ellipse cx={CX} cy="276" rx="124" ry="15.5" fill="none" stroke="#a85c61" strokeOpacity=".22" strokeWidth="1" />
      <ellipse cx={CX} cy="276" rx="132" ry="17" fill="none" stroke="#d9b77a" strokeOpacity=".4" strokeWidth=".6" strokeDasharray="1.2 3.2" />
      <path d="M40 270 A126 17 0 0 1 120 257" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx={CX} cy="270" rx="106" ry="14" fill="rgba(60,20,30,.34)" />

      {/* body */}
      <g clipPath="url(#bdBody)">
        <rect x={L} y="140" width={RX * 2} height="150" fill="url(#bdSponge)" />
        <path d={ribbon(210, 11)} fill="url(#bdCream)" />
        <path d={ribbon(236, 4)} fill="#b25b66" opacity=".92" />
        <path d={ribbon(210, 11)} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".6" />
        <path d={FROST_EDGE} fill="none" stroke="#5a2430" strokeOpacity=".28" strokeWidth="3" transform="translate(0 2.6)" />
        <path d={FROST} fill="url(#bdFrost)" />
        <path d={FROST_EDGE} fill="none" stroke="#fff" strokeOpacity=".32" strokeWidth="1.1" transform="translate(0 -1.6)" />
        <rect x={L} y="140" width={RX * 2} height="150" fill="url(#bdSide)" />
        <rect x="106" y="152" width="9" height="116" rx="4.5" fill="#fff" opacity=".13" />
      </g>
      {PEARLS.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="2.7" fill="url(#bdGold)" />
          <circle cx={p.x - 0.8} cy={p.y - 0.9} r=".7" fill="#fff" opacity=".85" />
        </g>
      ))}

      {/* top */}
      <ellipse cx={CX} cy="150" rx={RX} ry="22" fill="url(#bdTop)" />
      <ellipse cx={CX} cy="150" rx="92" ry="19" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".9" />
      <path d="M96 146 Q128 132 170 134" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="106" cy="145" rx="9" ry="2.2" fill="#fff" opacity=".4" transform="rotate(-12 106 145)" />
      {ROSETTES.map((r) => {
        const s = r.front ? 1.1 : 0.9
        return (
          <g key={r.k} transform={`translate(${r.x.toFixed(1)} ${r.y.toFixed(1)}) scale(${s})`}>
            <ellipse cx="1.2" cy="6" rx="8" ry="2.6" fill="#7a3340" opacity=".28" />
            {r.berry ? (
              <>
                <circle r="7.4" fill="url(#bdBerry)" />
                {[[-3, -2], [2, -3], [3, 2], [-1.5, 2.6], [0.4, 0]].map(([dx, dy], j) => (
                  <circle key={j} cx={dx} cy={dy} r="1.7" fill="#e07d88" opacity=".5" />
                ))}
                <ellipse cx="-2.6" cy="-3.6" rx="1.8" ry="1.1" fill="#fff" opacity=".6" />
              </>
            ) : (
              <>
                <circle r="8" fill="url(#bdRos)" />
                <path d="M-4.6 1.2 C-4.6 -4.2 3.4 -5.4 4.6 0 C4.8 3.6 -1 4.8 -2.4 1.4 C-2.8 -1 1 -1.8 1.6 0.4" fill="none" stroke="#a85c61" strokeOpacity=".42" strokeWidth=".8" strokeLinecap="round" />
                {r.k % 2 === 0 && <circle cx="0.3" cy="-0.4" r="1.9" fill="url(#bdGold)" />}
              </>
            )}
          </g>
        )
      })}
      {LEAFS.map((f, i) => (
        <path key={i} d="M0 -3.4 L2.4 -.6 L1 3.2 L-1.8 2.4 L-2.4 -1.2Z" fill="#d9b77a" opacity=".82" transform={`translate(${f.x} ${f.y}) rotate(${f.r}) scale(${f.s})`} />
      ))}
    </g>
  )
})

/** The candle itself: wax, stripes, wick and the shadow it casts on the icing. */
export function CandleBody({ c, lit, out, style }: { c: CandleSpec; lit: boolean; out: boolean; style: CSSProperties }) {
  return (
    <g className={`bd-cd${lit ? ' is-lit' : ''}${out ? ' is-out' : ''}`} transform={`translate(${c.x} ${c.wick})`} style={style}>
      <ellipse cx="9" cy={c.h + 9.5} rx="15" ry="3.2" fill="#46141e" opacity=".34" />
      <ellipse cx="0" cy={c.h + 9} rx="8.2" ry="2.7" fill="#fbeee2" />
      <rect x="-5.5" y="8" width="11" height={c.h} rx="2.4" fill="url(#bdWax)" />
      <rect x="-5.5" y="8" width="11" height={c.h} rx="2.4" fill={`url(#bdStripe${c.tone})`} />
      <rect x="2.2" y="12" width="1.6" height={c.h - 8} rx=".8" fill="#fff" opacity=".4" />
      <rect x="-5.5" y={c.h - 4} width="11" height="12" rx="2.4" fill="#6b2a35" opacity=".08" />
      <ellipse cx="0" cy="8.4" rx="5.5" ry="1.8" fill="#fff3e6" />
      <ellipse cx="0" cy="8.6" rx="3.8" ry="1.1" fill="#e9cdb6" />
      <ellipse className="bd-wg" cx="0" cy="8.6" rx="5" ry="1.6" fill="#ffd9a0" />
      <path d="M3.2 8.6 v6.4 q0 2.2 -1.6 2.2 q-1.6 0 -1.6 -2.2 V9Z" fill="#fff4ea" />
      <path d="M0 9 C-0.7 5 0.9 2.4 0.3 -0.6" fill="none" stroke="#3a2420" strokeWidth="1.5" strokeLinecap="round" />
      <circle className="bd-ember" cx="0.3" cy="-0.6" r="1.7" fill="#ff9b3d" />
    </g>
  )
}

const WISPS = [
  'M0 0 C5 -14 -7 -26 1 -44 S9 -72 -2 -98',
  'M0 0 C-6 -12 6 -30 -1 -46 S-9 -78 4 -104',
  'M0 0 C3 -18 -4 -22 3 -40 S-4 -66 5 -90',
]

/** Flame, halo, spark and the wisps of smoke released when the candle goes out. */
export function CandleFlame({ c, lit, out, style }: { c: CandleSpec; lit: boolean; out: boolean; style: CSSProperties }) {
  return (
    <g className={`bd-cf${lit ? ' is-lit' : ''}${out ? ' is-out' : ''}`} transform={`translate(${c.x} ${c.wick})`} style={style}>
      <g className="bd-halo">
        <circle className="bd-hb" cx="0" cy="-16" r="62" fill="url(#bdHalo)" />
      </g>
      <g className="bd-lean">
        <g className="bd-ign">
          <g className="bd-fa">
            <path d="M0.8 -31 C2.6 -23 9 -15.5 8.2 -8 C7.6 -2 4 1 0 1 C-4.2 1 -8 -2.4 -8 -8.4 C-8 -16 -2.4 -23.5 0.8 -31Z" fill="url(#bdFlame)" />
            <path className="bd-core" d="M0.4 -19 C1.4 -14 4.4 -10 4 -5.5 C3.6 -1.6 1.8 0 0 0 C-1.8 0 -3.8 -1.8 -4 -5.8 C-4.2 -10 -0.6 -14 0.4 -19Z" fill="url(#bdCore)" />
            <ellipse cx="0" cy="-2.2" rx="2.6" ry="3.6" fill="#7fa6ff" opacity=".26" />
          </g>
        </g>
      </g>
      <path className="bd-spark" d="M0 -9 L1.2 -1.2 L9 0 L1.2 1.2 L0 9 L-1.2 1.2 L-9 0 L-1.2 -1.2Z" fill="#fff1d8" transform="translate(0 -4)" />
      {out && (
        <g className="bd-smoke">
          {WISPS.map((d, i) => (
            <g key={i} style={{ '--wi': i } as CSSProperties}>
              <path className="bd-wp bd-wp--soft" d={d} pathLength={100} />
              <path className="bd-wp bd-wp--thin" d={d} pathLength={100} />
            </g>
          ))}
        </g>
      )}
    </g>
  )
}

/** Soft light thrown by the flames on the cake and the plate, plus the dimming of the unlit cake. */
export function CakeLight({ cands, lit, out }: { cands: CandleSpec[]; lit: boolean[]; out: boolean[] }) {
  return (
    <>
      <g clipPath="url(#bdCake)">
        <rect className="bd-shade" x="40" y="120" width="240" height="170" fill="#1b070c" />
        {cands.map((c, i) => (
          <circle key={i} className={`bd-pool${lit[i] && !out[i] ? ' is-lit' : ''}`} cx={c.x} cy={c.base + 6} r="84" fill="url(#bdPool)" />
        ))}
      </g>
      <ellipse className="bd-plate-glow" cx={CX} cy="276" rx="140" ry="18" fill="url(#bdPool)" />
    </>
  )
}
