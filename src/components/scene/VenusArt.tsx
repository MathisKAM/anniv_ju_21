export const VW = 400
export const VH = 480
export const SUN = { x: 200, y: 215 }

const lcg = (seed: number) => () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}

const STARS = (() => {
  const r = lcg(9)
  return Array.from({ length: 46 }, (_, i) => ({
    x: r() * VW,
    y: r() * 392,
    r: 0.5 + r() * 1.1,
    c: ['#ffffff', '#cfe0ff', '#ffe9c4'][i % 3],
    o: 0.35 + r() * 0.5,
    tw: i % 4 === 0,
    d: r() * 5,
  }))
})()

export function SpaceDefs() {
  return (
    <defs>
      <radialGradient id="vnBg" cx="50%" cy="45%" r="75%">
        <stop offset="0" stopColor="#241a52" />
        <stop offset=".55" stopColor="#0f0a2a" />
        <stop offset="1" stopColor="#05030f" />
      </radialGradient>
      <radialGradient id="vnSun" cx="38%" cy="34%" r="70%">
        <stop offset="0" stopColor="#fff6c9" />
        <stop offset=".35" stopColor="#ffd45c" />
        <stop offset=".72" stopColor="#f28d1c" />
        <stop offset="1" stopColor="#c8480c" />
      </radialGradient>
      <radialGradient id="vnSunHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#ffbe46" stopOpacity=".6" />
        <stop offset=".45" stopColor="#ff8c28" stopOpacity=".2" />
        <stop offset="1" stopColor="#ff8c28" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="vnVenusHalo" cx="50%" cy="50%" r="50%">
        <stop offset=".3" stopColor="#ffe9a8" stopOpacity=".55" />
        <stop offset="1" stopColor="#ffe9a8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="vnWin" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fff3c4" stopOpacity=".9" />
        <stop offset=".5" stopColor="#ffd98a" stopOpacity=".35" />
        <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
      </radialGradient>
    </defs>
  )
}

export function Stars() {
  return (
    <g aria-hidden="true" pointerEvents="none">
      {STARS.map((s, i) => (
        <circle
          key={i}
          className={s.tw ? 'vn-tw' : undefined}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill={s.c}
          opacity={s.o}
          style={s.tw ? { animationDelay: `${-s.d}s` } : undefined}
        />
      ))}
    </g>
  )
}

export function Sun() {
  return (
    <g aria-hidden="true" pointerEvents="none" transform={`translate(${SUN.x} ${SUN.y})`}>
      <circle className="vn-sun__halo" r="62" fill="url(#vnSunHalo)" />
      <circle className="vn-sun__rays" r="35" fill="none" stroke="#ffd98a" strokeWidth="9" strokeDasharray="2.5 11" opacity=".38" />
      <circle r="24" fill="url(#vnSun)" />
    </g>
  )
}

/** Progress ring + title, one of the two « année / journée » indicators. */
export function GaugeCard({
  x,
  y,
  title,
  sub,
  value,
  color,
  on,
}: {
  x: number
  y: number
  title: string
  sub: string
  value: number
  color: string
  on: boolean
}) {
  const done = value >= 0.999
  const pct = Math.floor(value * 100)
  return (
    <g className={`vn-card${on ? ' is-on' : ''}${done ? ' is-done' : ''}`} transform={`translate(${x} ${y})`} aria-hidden="true" pointerEvents="none">
      <rect width="184" height="68" rx="14" className="vn-card__bg" />
      <g transform="translate(36 34)">
        <circle r="21" fill="none" stroke="rgba(255,255,255,.16)" strokeWidth="5" />
        <circle
          className="vn-card__ring"
          r="21"
          fill="none"
          stroke={color}
          strokeWidth="5"
          pathLength="100"
          strokeDasharray={`${value * 100} 100`}
          transform="rotate(-90)"
        />
        {done ? (
          <path d="M-7 0 l5 5.2 l9.4 -10.6" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        ) : (
          <text className="vn-card__pct" y="3.6" textAnchor="middle">
            {on ? `${pct}%` : '–'}
          </text>
        )}
      </g>
      <text className="vn-card__t" x="72" y="30">{title}</text>
      <text className="vn-card__s" x="72" y="48">{sub}</text>
    </g>
  )
}
