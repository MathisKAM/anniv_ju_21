import { useEffect, useRef, type CSSProperties } from 'react'

/** Screen-space (viewBox 400 x 560) positions used by the shot, shared with the scene logic. */
export const BALL_START = { x: 200, y: 492 }
export const BALL_END = { x: 226, y: 214 }
const CAM = 1.75
const HORIZON = 262

/** Pitch perspective: eye level at y = 145, goal line at y = 262, near edge at y = 560. */
const EYE = 145
const half = (y: number) => (130 * (y - EYE)) / (262 - EYE)
const depthY = (z: number) => EYE + 415 / z

/* Goal: front frame on the goal line, back frame further away (smaller, higher). */
const GF = { l: 160, r: 240, top: 229, bot: 262 }
const DEPTH = 0.78
const GB = { l: 200 - 40 * DEPTH, r: 200 + 40 * DEPTH, top: EYE + (GF.top - EYE) * DEPTH, bot: EYE + (GF.bot - EYE) * DEPTH }
/** Where the ball hits the back net, in camera space. */
const HIT = { x: 200 + (BALL_END.x - 200) / CAM, y: HORIZON + (BALL_END.y - HORIZON) / CAM }

const NV = 9
const NH = 6
const SEG = 12

/** The back net as a deformable mesh: `t` in 0..1 is the ripple progress after the impact. */
function netPath(t: number) {
  const pt = (x: number, y: number) => {
    if (t <= 0 || t >= 1) return `${x.toFixed(1)} ${y.toFixed(1)}`
    const dx = x - HIT.x
    const dy = y - HIT.y
    const r = Math.hypot(dx, dy)
    const gate = Math.min(1, Math.max(0, (t * 80 - r) / 10))
    const amp = 7 * Math.exp(-3.2 * t) * Math.exp(-r / 30) * gate
    const w = Math.sin(2 * Math.PI * 2.8 * t - r * 0.13)
    return `${(x + (dx / (r + 2)) * amp * w * 0.5).toFixed(1)} ${(y - amp * w).toFixed(1)}`
  }
  let d = ''
  for (let i = 0; i < NV; i++) {
    const x = GB.l + ((GB.r - GB.l) * i) / (NV - 1)
    for (let s = 0; s <= SEG; s++) d += `${s ? 'L' : 'M'}${pt(x, GB.top + ((GB.bot - GB.top) * s) / SEG)}`
  }
  for (let j = 0; j < NH; j++) {
    const y = GB.top + ((GB.bot - GB.top) * j) / (NH - 1)
    for (let s = 0; s <= SEG; s++) d += `${s ? 'L' : 'M'}${pt(GB.l + ((GB.r - GB.l) * s) / SEG, y)}`
  }
  return d
}

const REST = netPath(0)

/** Static side and roof netting (depth lines between the front and the back frame). */
const SIDE_NET = (() => {
  const lerp = (a: number, b: number, k: number) => a + (b - a) * k
  let d = ''
  for (let j = 0; j <= 5; j++) {
    const k = j / 5
    d += `M${GF.l} ${lerp(GF.top, GF.bot, k)} L${GB.l} ${lerp(GB.top, GB.bot, k)}`
    d += `M${GF.r} ${lerp(GF.top, GF.bot, k)} L${GB.r} ${lerp(GB.top, GB.bot, k)}`
  }
  for (let i = 0; i <= 8; i++) {
    const k = i / 8
    d += `M${lerp(GF.l, GF.r, k)} ${GF.top} L${lerp(GB.l, GB.r, k)} ${GB.top}`
  }
  for (const k of [0.33, 0.66]) {
    const yl = lerp(GF.top, GB.top, k)
    d += `M${lerp(GF.l, GB.l, k)} ${yl} H${lerp(GF.r, GB.r, k)}`
    d += `M${lerp(GF.l, GB.l, k)} ${lerp(GF.top, GF.bot, 0)} V${lerp(GF.bot, GB.bot, k)}`
    d += `M${lerp(GF.r, GB.r, k)} ${lerp(GF.top, GF.bot, 0)} V${lerp(GF.bot, GB.bot, k)}`
  }
  return d
})()

const TOWERS = [
  { x: 28, y: 92, k: 2 },
  { x: 372, y: 92, k: 3 },
  { x: 96, y: 106, k: 0 },
  { x: 304, y: 106, k: 1 },
]

const STRIPES = Array.from({ length: 10 }, (_, n) => [depthY(3.55 - n * 0.255), depthY(3.55 - (n + 1) * 0.255)])
const FLASHES = Array.from({ length: 22 }, (_, i) => [40 + ((i * 97) % 320), 148 + ((i * 53) % 96), (i * 0.37) % 2.6])
const STARS = Array.from({ length: 26 }, (_, i) => [(i * 151) % 400, (i * 67) % 130, 0.6 + (i % 3) * 0.4])

const PENT = Array.from({ length: 5 }, (_, k) => {
  const a = ((-90 + 72 * k) * Math.PI) / 180
  return [Math.cos(a), Math.sin(a)]
})

function Ball({ ghost }: { ghost?: boolean }) {
  if (ghost) return <circle r="24" fill="#bfeaff" />
  return (
    <>
      <circle r="24" fill="url(#stBall)" />
      <g className="ac-spin" clipPath="url(#stBallClip)">
        <polygon points={PENT.map(([x, y]) => `${(x * 8.5).toFixed(1)},${(y * 8.5).toFixed(1)}`).join(' ')} fill="#161626" />
        {PENT.map(([x, y], k) => (
          <g key={k}>
            <path d={`M${x * 8.5} ${y * 8.5} L${x * 16} ${y * 16}`} stroke="#161626" strokeWidth="1.4" />
            <circle cx={x * 24} cy={y * 24} r="7.5" fill="#161626" />
          </g>
        ))}
      </g>
      <circle r="24" fill="none" stroke="#2a3050" strokeOpacity=".35" strokeWidth="1" />
      <ellipse cx="-8" cy="-10" rx="8" ry="4.5" fill="#fff" opacity=".55" transform="rotate(-35 -8 -10)" />
    </>
  )
}

/**
 * The stadium seen through the FIFA screen. Everything is driven by the `.sN` step classes of the
 * parent scene (lights on, camera advance, ball, shot, goal); only the net ripple is run here.
 */
export function Stadium({ ripple }: { ripple: boolean }) {
  const back = useRef<SVGPathElement>(null)
  const veil = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (!ripple) return
    const t0 = performance.now()
    let raf = 0
    const set = (d: string) => {
      back.current?.setAttribute('d', d)
      veil.current?.setAttribute('d', d)
    }
    const tick = (now: number) => {
      const t = (now - t0) / 1900
      if (t >= 1) return set(REST)
      set(netPath(t))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ripple])

  const stands = (
    <>
      <rect x="28" y="140" width="344" height="112" fill="#0e0d2c" />
      <rect x="28" y="140" width="344" height="112" fill="url(#stCrowd)" opacity=".7" />
      <g stroke="#05051a" strokeWidth="3">
        <path d="M28 168 H372 M28 196 H372 M28 224 H372" />
      </g>
      <g stroke="#05051a" strokeWidth="2" opacity=".6">
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M${68 + i * 40} 140 V252`} />
        ))}
      </g>
      <path d="M28 140 L28 262 L-410 560 L-600 560 L-600 -20Z" fill="#0b0a26" />
      <path d="M28 140 L28 262 L-410 560 L-600 560 L-600 -20Z" fill="url(#stCrowd)" opacity=".55" />
      <path d="M372 140 L372 262 L810 560 L1000 560 L1000 -20Z" fill="#0b0a26" />
      <path d="M372 140 L372 262 L810 560 L1000 560 L1000 -20Z" fill="url(#stCrowd)" opacity=".55" />
      <path d="M14 118 H386 L372 140 H28Z" fill="#090920" />
      <rect x="28" y="137" width="344" height="3" fill="url(#stLed)" className="ac-led-strip" />
    </>
  )

  return (
    <svg className="ac-stsvg" viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="stSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#04061a" />
          <stop offset=".3" stopColor="#0d1040" />
          <stop offset=".47" stopColor="#3a1d6e" />
          <stop offset=".62" stopColor="#14123a" />
        </linearGradient>
        <linearGradient id="stLed" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset=".5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="stCone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff6d6" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="stFlare" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".95" />
          <stop offset=".3" stopColor="#fff3c4" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="stPool" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fffbe6" stopOpacity=".32" />
          <stop offset="1" stopColor="#fffbe6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="stGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".8" />
          <stop offset=".35" stopColor="#7dd3fc" stopOpacity=".38" />
          <stop offset=".7" stopColor="#f472b6" stopOpacity=".16" />
          <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="stBall" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".7" stopColor="#e3e8f6" />
          <stop offset="1" stopColor="#9199b8" />
        </radialGradient>
        <clipPath id="stBallClip">
          <circle r="24" />
        </clipPath>
        <clipPath id="stPitch">
          <path d={`M${200 - half(262)} 262 H${200 + half(262)} L${200 + half(560)} 560 H${200 - half(560)}Z`} />
        </clipPath>
        <pattern id="stCrowd" width="7" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="#f9a8d4" />
          <circle cx="5" cy="4.5" r="1.1" fill="#93c5fd" />
          <circle cx="4.6" cy="1.2" r=".8" fill="#e5e7eb" />
          <circle cx="1.2" cy="4.8" r=".8" fill="#c4b5fd" />
        </pattern>
        <filter id="stBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <g className="ac-skyfar">
        <rect x="-400" y="-400" width="1200" height="960" fill="url(#stSky)" />
        <g fill="#fff">
          {STARS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity=".55" />
          ))}
        </g>
        <ellipse cx="200" cy="170" rx="260" ry="60" fill="#a855f7" opacity=".18" />
      </g>

      <g className="ac-cam">
        {stands}
        <g className="ac-boards">
          <rect x="28" y="252" width="344" height="10" fill="#080820" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={32 + i * 43} y="254.5" width="36" height="5" rx="1" fill={['#f472b6', '#38bdf8', '#a78bfa', '#22d3ee'][i % 4]} />
          ))}
        </g>
        <path d="M28 262 L372 262 L810 560 L-410 560Z" fill="#0b3a24" />
        <path d={`M${200 - half(262)} 262 H${200 + half(262)} L${200 + half(560)} 560 H${200 - half(560)}Z`} fill="#1c7a3c" />
        <g clipPath="url(#stPitch)">
          {STRIPES.map(([y0, y1], i) =>
            i % 2 ? null : <path key={i} d={`M${200 - half(y0)} ${y0} H${200 + half(y0)} L${200 + half(y1)} ${y1} H${200 - half(y1)}Z`} fill="#27934b" />,
          )}
        </g>
        <g fill="none" stroke="#eafff1" strokeWidth="1.4" opacity=".85">
          <path d={`M${200 - half(262)} 262 H${200 + half(262)}`} />
          <path d={`M${200 - 75} 262 L${200 - (75 * (278.9 - EYE)) / (262 - EYE)} 278.9 H${200 + (75 * (278.9 - EYE)) / (262 - EYE)} L${200 + 75} 262`} />
          <path d={`M${200 - 120} 262 L${200 - (120 * (307.7 - EYE)) / (262 - EYE)} 307.7 H${200 + (120 * (307.7 - EYE)) / (262 - EYE)} L${200 + 120} 262`} />
          <ellipse cx="200" cy="382" rx="3.4" ry="1.3" fill="#eafff1" />
          <path d="M122 307.7 C150 330 250 330 278 307.7" strokeWidth="1.1" opacity=".7" />
        </g>

        <g className="ac-pool">
          <ellipse cx="200" cy="330" rx="210" ry="90" fill="url(#stPool)" />
        </g>

        {TOWERS.map((t) => (
          <g key={t.x}>
            <rect x={t.x - 2.2} y={t.y + 10} width="4.4" height={150 - t.y - 10} fill="#12122e" />
            <rect x={t.x - 22} y={t.y - 10} width="44" height="20" rx="2.5" fill="#15153a" stroke="#34356a" strokeWidth=".8" />
            {Array.from({ length: 8 }, (_, l) => (
              <circle key={l} cx={t.x - 15 + (l % 4) * 10} cy={t.y - 4.5 + Math.floor(l / 4) * 9} r="3.3" fill="#2b2c58" />
            ))}
          </g>
        ))}

        <g className="ac-crowd-flash">
          {FLASHES.map(([x, y, d], i) => (
            <circle key={i} className="ac-cf" cx={x} cy={y} r="1.5" fill="#fff" style={{ animationDelay: `${-d}s` }} />
          ))}
        </g>

        <g className="ac-goal">
          <path d={`M${GF.l} ${GF.bot} L${GF.r} ${GF.bot} L${GB.r} ${GB.bot} L${GB.l} ${GB.bot}Z`} fill="#06150c" opacity=".55" />
          <path d={SIDE_NET} fill="none" stroke="#e8efff" strokeWidth=".5" opacity=".38" />
          <path ref={back} className="ac-net" d={REST} fill="none" stroke="#f1f5ff" strokeWidth=".6" opacity=".7" />
          <path d={`M${GB.l} ${GB.bot} V${GB.top} H${GB.r} V${GB.bot}`} fill="none" stroke="#dfe6ff" strokeWidth="1.1" opacity=".8" />
          <path d={`M${GF.l} ${GF.top} L${GB.l} ${GB.top} M${GF.r} ${GF.top} L${GB.r} ${GB.top}`} stroke="#dfe6ff" strokeWidth=".8" opacity=".7" />
          <path d={`M${GF.l} ${GF.bot} V${GF.top} H${GF.r} V${GF.bot}`} fill="none" stroke="#7dd3fc" strokeWidth="5" strokeLinejoin="round" opacity=".2" className="ac-post-glow" />
          <path d={`M${GF.l} ${GF.bot} V${GF.top} H${GF.r} V${GF.bot}`} fill="none" stroke="#f8faff" strokeWidth="2.5" strokeLinejoin="round" />
        </g>

        <rect className="ac-night" x="-600" y="-600" width="1600" height="1400" fill="#03041a" />

        {TOWERS.map((t) => {
          const dir = t.x < 200 ? 1 : -1
          const tx = t.x + dir * 150
          return (
            <g key={t.x} className="ac-tw" style={{ '--k': t.k } as CSSProperties}>
              <path className="ac-cone" d={`M${t.x - 15} ${t.y + 10} L${t.x + 15} ${t.y + 10} L${tx + 90} 430 L${tx - 90} 430Z`} fill="url(#stCone)" />
              {Array.from({ length: 8 }, (_, l) => (
                <circle
                  key={l}
                  className="ac-lamp"
                  cx={t.x - 15 + (l % 4) * 10}
                  cy={t.y - 4.5 + Math.floor(l / 4) * 9}
                  r="3.3"
                  fill="#fff8dc"
                  style={{ '--l': l } as CSSProperties}
                />
              ))}
              <g className="ac-flare" style={{ transformOrigin: `${t.x}px ${t.y}px` }}>
                <circle cx={t.x} cy={t.y} r="40" fill="url(#stFlare)" />
                <ellipse cx={t.x} cy={t.y} rx="70" ry="2.4" fill="#fff" opacity=".7" />
                <ellipse cx={t.x} cy={t.y} rx="2.4" ry="30" fill="#fff" opacity=".6" />
              </g>
            </g>
          )
        })}
      </g>

      <circle className="ac-gglow" cx="200" cy="222" r="170" fill="url(#stGlow)" />

      <g transform={`translate(${BALL_START.x} ${BALL_START.y})`}>
        <ellipse className="ac-ballshadow" cy="22" rx="22" ry="5" fill="#000" opacity=".4" filter="url(#stBlur)" />
        <circle className="ac-ring ac-ring--strike" r="14" fill="none" stroke="#fff" strokeWidth="3" />
        <g className="ac-ballwrap">
          <g className="ac-settle">
            {[3, 2, 1, 0].map((k) => (
              <g key={k} className="ac-fx" style={{ '--fd': `${120 + k * 38}ms` } as CSSProperties}>
                <g className="ac-fy" style={{ '--fd': `${120 + k * 38}ms` } as CSSProperties}>
                  <g className="ac-fs" style={{ '--fd': `${120 + k * 38}ms` } as CSSProperties}>
                    {k ? (
                      <g className="ac-ghost" style={{ '--gk': k, '--fd': `${120 + k * 38}ms` } as CSSProperties}>
                        <Ball ghost />
                      </g>
                    ) : (
                      <g className="ac-sq">
                        <Ball />
                      </g>
                    )}
                  </g>
                </g>
              </g>
            ))}
          </g>
        </g>
      </g>

      <g transform={`translate(${BALL_END.x} ${BALL_END.y})`}>
        <circle className="ac-ring ac-ring--goal" r="10" fill="none" stroke="#fff" strokeWidth="2.4" />
        <circle className="ac-ring ac-ring--goal2" r="10" fill="none" stroke="#67e8f9" strokeWidth="1.6" />
      </g>

      <g className="ac-cam ac-cam--front">
        <path ref={veil} d={REST} fill="none" stroke="#f1f5ff" strokeWidth=".5" opacity=".22" />
      </g>

      <rect className="ac-flashr" width="400" height="560" fill="url(#stGlow)" />
    </svg>
  )
}
