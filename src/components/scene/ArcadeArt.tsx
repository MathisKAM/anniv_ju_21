import type { CSSProperties, ReactNode } from 'react'

/** Shared geometry of the arcade room (portrait viewBox, 400 x 560). */
export const W = 400
export const H = 560
/** Centre and size of the FIFA screen once its cabinet has moved to the middle of the room. */
export const FOCUS = { x: 200, y: 496, scale: 1.3 }

export type GameKey = 'minecraft' | 'rocket' | 'siege' | 'fifa'

export interface Game {
  key: GameKey
  lines: string[]
  theme: string
  /** Base centre of the cabinet and its depth scale. */
  x: number
  y: number
  s: number
  /** Side the visible flank is on (the one facing the middle of the room). */
  side: 1 | -1
}

/** Same order as the question options. */
export const GAMES: Game[] = [
  { key: 'minecraft', lines: ['MINECRAFT'], theme: '#a78bfa', x: 284, y: 318, s: 0.84, side: -1 },
  { key: 'rocket', lines: ['ROCKET LEAGUE'], theme: '#f472b6', x: 98, y: 540, s: 1, side: 1 },
  { key: 'siege', lines: ['RAINBOW SIX', 'SIEGE'], theme: '#3b82f6', x: 116, y: 318, s: 0.84, side: 1 },
  { key: 'fifa', lines: ['FIFA'], theme: '#22d3ee', x: 302, y: 540, s: 1, side: -1 },
]
/** Back row first so the front row overlaps it. */
export const DRAW_ORDER = [2, 0, 1, 3]

const SCREEN = { x: -56, y: -176, w: 112, h: 96 }

export function ArcadeDefs() {
  return (
    <defs>
      <filter id="acGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="acGlowW" x="-20%" y="-200%" width="140%" height="500%">
        <feGaussianBlur stdDeviation="3.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="acSmoke" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.2" />
      </filter>
      <linearGradient id="acWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#06041a" />
        <stop offset=".55" stopColor="#120a30" />
        <stop offset="1" stopColor="#1d0e40" />
      </linearGradient>
      <linearGradient id="acFloor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a0e3a" />
        <stop offset=".5" stopColor="#0d0824" />
        <stop offset="1" stopColor="#07041a" />
      </linearGradient>
      <linearGradient id="acNeonH" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f472b6" />
        <stop offset=".5" stopColor="#a78bfa" />
        <stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
      <radialGradient id="acBlobP" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#f472b6" stopOpacity=".34" />
        <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="acBlobB" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#4f7cff" stopOpacity=".36" />
        <stop offset="1" stopColor="#4f7cff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="acVig" cx=".5" cy=".5" r=".72">
        <stop offset=".55" stopColor="#030210" stopOpacity="0" />
        <stop offset="1" stopColor="#030210" stopOpacity=".72" />
      </radialGradient>
      <linearGradient id="acScrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#05030f" stopOpacity=".78" />
        <stop offset="1" stopColor="#05030f" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="acBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#241a52" />
        <stop offset=".4" stopColor="#150f35" />
        <stop offset="1" stopColor="#0a0720" />
      </linearGradient>
      <linearGradient id="acSide" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#120d2e" />
        <stop offset="1" stopColor="#07051a" />
      </linearGradient>
      <linearGradient id="acPanel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2a2060" />
        <stop offset="1" stopColor="#140e35" />
      </linearGradient>
      <linearGradient id="acGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".2" />
        <stop offset=".4" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <pattern id="acScan" width="4" height="3" patternUnits="userSpaceOnUse">
        <rect width="4" height="1" fill="#000" opacity=".22" />
      </pattern>
      <pattern id="acHex" width="10.39" height="18" patternUnits="userSpaceOnUse">
        <path
          d="M0,3 L5.2,0 L10.39,3 M0,3 V9 M10.39,3 V9 M0,9 L5.2,12 L10.39,9 M5.2,12 V18"
          fill="none"
          stroke="#3b82f6"
          strokeWidth=".5"
          opacity=".35"
        />
      </pattern>
      <clipPath id="acScreen">
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx="3" />
      </clipPath>
      <linearGradient id="acFifaSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0a1240" />
        <stop offset="1" stopColor="#2a2a78" />
      </linearGradient>
      <linearGradient id="acMcSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6ab9ff" />
        <stop offset="1" stopColor="#d4efff" />
      </linearGradient>
      <linearGradient id="acRlField" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0f6a78" />
        <stop offset="1" stopColor="#07304a" />
      </linearGradient>
      <linearGradient id="acRlWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#050c26" />
        <stop offset="1" stopColor="#10306a" />
      </linearGradient>
      <linearGradient id="acSgBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#0a1020" />
        <stop offset="1" stopColor="#1c2c4c" />
      </linearGradient>
      <radialGradient id="acBall" cx=".35" cy=".3" r=".8">
        <stop offset="0" stopColor="#fff" />
        <stop offset=".7" stopColor="#dfe5f5" />
        <stop offset="1" stopColor="#8d97b8" />
      </radialGradient>
      <radialGradient id="acSmokeG" cx=".5" cy=".5" r=".5">
        <stop offset="0" stopColor="#e2e8f0" stopOpacity=".95" />
        <stop offset=".6" stopColor="#94a3b8" stopOpacity=".8" />
        <stop offset="1" stopColor="#64748b" stopOpacity="0" />
      </radialGradient>
      {GAMES.map((g) => (
        <g key={g.key}>
          <linearGradient id={`acMq-${g.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={g.theme} stopOpacity=".42" />
            <stop offset="1" stopColor="#0b0724" />
          </linearGradient>
          <radialGradient id={`acHalo-${g.key}`} cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor={g.theme} stopOpacity=".55" />
            <stop offset="1" stopColor={g.theme} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`acStreak-${g.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={g.theme} stopOpacity=".42" />
            <stop offset="1" stopColor={g.theme} stopOpacity="0" />
          </linearGradient>
        </g>
      ))}
    </defs>
  )
}

const MOTES = [
  [30, 150, 0], [72, 250, 3.2], [118, 90, 5.1], [168, 210, 1.4], [214, 130, 6.6], [250, 280, 2.3], [296, 170, 4.4],
  [338, 110, 7.7], [372, 240, 0.9], [58, 400, 5.6], [150, 470, 2.9], [250, 420, 7], [340, 380, 3.8], [210, 330, 1.9],
]

/** Dark room: wall, glossy floor, neon strips and drifting light motes. */
export function ArcadeRoom() {
  const grid: ReactNode[] = []
  for (let b = -400; b <= 800; b += 100) {
    const x0 = 200 + ((b - 200) * (290 - 160)) / (560 - 160)
    grid.push(<path key={`r${b}`} d={`M${x0} 290 L${b} 560`} />)
  }
  for (let k = 1; k <= 7; k++) {
    const y = 290 + 270 * (k / 7) ** 2
    grid.push(<path key={`h${k}`} d={`M0 ${y} H${W}`} />)
  }
  return (
    <g className="ac-roomfx" aria-hidden="true">
      <rect width={W} height="292" fill="url(#acWall)" />
      <rect y="290" width={W} height="270" fill="url(#acFloor)" />
      <circle cx="40" cy="190" r="150" fill="url(#acBlobP)" />
      <circle cx="372" cy="170" r="160" fill="url(#acBlobB)" />
      <g className="ac-wallpanels" fill="#a78bfa" opacity=".08">
        {[60, 130, 270, 340].map((x) => (
          <rect key={x} x={x} y="52" width="1.4" height="238" />
        ))}
      </g>
      <g className="ac-neon" filter="url(#acGlowW)">
        <rect x="198.4" y="64" width="3.2" height="226" rx="1.6" fill="#a78bfa" style={{ '--nd': '0.2s' } as CSSProperties} />
        <rect x="9" y="40" width="3" height="250" rx="1.5" fill="#f472b6" style={{ '--nd': '0.5s' } as CSSProperties} />
        <rect x="388" y="40" width="3" height="250" rx="1.5" fill="#38bdf8" style={{ '--nd': '0.8s' } as CSSProperties} />
        <rect x="0" y="289" width={W} height="3.4" fill="url(#acNeonH)" style={{ '--nd': '0s' } as CSSProperties} />
      </g>
      <g className="ac-grid" fill="none" stroke="#a78bfa" strokeOpacity=".16" strokeWidth=".8">
        {grid}
      </g>
      <g className="ac-neon" filter="url(#acGlowW)" opacity=".8">
        <path d="M28 296 L-74 560 L-58 560 L36 296Z" fill="#f472b6" style={{ '--nd': '0.6s' } as CSSProperties} />
        <path d="M372 296 L474 560 L458 560 L364 296Z" fill="#38bdf8" style={{ '--nd': '0.9s' } as CSSProperties} />
      </g>
      <g className="ac-motes" fill="#e9d5ff">
        {MOTES.map(([x, y, d], i) => (
          <circle key={i} className="ac-mote" cx={x} cy={y} r={1 + (i % 3) * 0.55} style={{ animationDelay: `${-d}s` }} />
        ))}
      </g>
    </g>
  )
}

/** Pitch trapezoid between two depths of the mini FIFA screen. */
const fifaHalf = (y: number) => 26 + ((y + 22) / 70) * 44

function Player({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="1" rx="3.6" ry="1.1" fill="#000" opacity=".3" />
      <rect x="-1.4" y="-3" width="1.2" height="4" fill="#f3f4f6" />
      <rect x=".2" y="-3" width="1.2" height="4" fill="#f3f4f6" />
      <rect x="-2.6" y="-9" width="5.2" height="7" rx="1.6" fill={c} />
      <circle cy="-11" r="2" fill="#f1c9a5" />
    </g>
  )
}

function FifaScreen() {
  const ys = [-22, -14, -6.5, 1, 10, 21, 34, 48]
  return (
    <g transform="translate(0 -128)">
      <rect x="-56" y="-48" width="112" height="96" fill="url(#acFifaSky)" />
      <rect x="-56" y="-48" width="112" height="28" fill="#0e1244" />
      <g fill="#f5d0fe" opacity=".5">
        {Array.from({ length: 22 }, (_, i) => (
          <circle key={i} cx={-52 + ((i * 29) % 104)} cy={-44 + ((i * 11) % 22)} r=".9" />
        ))}
      </g>
      {ys.slice(0, -1).map((y0, i) => {
        const y1 = ys[i + 1]
        return (
          <path
            key={i}
            d={`M${-fifaHalf(y0)} ${y0} H${fifaHalf(y0)} L${fifaHalf(y1)} ${y1} H${-fifaHalf(y1)}Z`}
            fill={i % 2 ? '#1f9a4c' : '#26b05a'}
          />
        )
      })}
      <g fill="none" stroke="#e8fff0" strokeWidth=".9" opacity=".85">
        <path d={`M${-fifaHalf(-22)} -22 L${-fifaHalf(48)} 48 M${fifaHalf(-22)} -22 L${fifaHalf(48)} 48`} />
        <ellipse cy="14" rx="22" ry="7" />
        <path d="M-40 14 H40" />
        <path d="M-14 -22 V-14 H14 V-22" />
      </g>
      <rect x="-9" y="-27" width="18" height="6" fill="none" stroke="#fff" strokeWidth="1" />
      <path d="M-9 -27 L-7 -21 M9 -27 L7 -21 M-3 -27 V-21 M3 -27 V-21" stroke="#fff" strokeWidth=".4" opacity=".6" />
      <Player x={-22} y={6} s={0.72} c="#ef4444" />
      <Player x={9} y={-6} s={0.55} c="#3b82f6" />
      <Player x={26} y={14} s={0.8} c="#ef4444" />
      <Player x={-8} y={30} s={1.1} c="#3b82f6" />
      <g transform="translate(12 34)">
        <ellipse cy="5" rx="5" ry="1.4" fill="#000" opacity=".35" />
        <g className="ac-fifa-ball">
          <circle r="5" fill="url(#acBall)" />
          <path d="M0 -2 L2 -.6 L1.3 1.8 H-1.3 L-2 -.6Z M-5 0 L-2 -.6 M5 0 L2 -.6 M0 -5 V-2 M-3 4 L-1.3 1.8 M3 4 L1.3 1.8" fill="#1b1b2a" stroke="#1b1b2a" strokeWidth=".6" />
        </g>
      </g>
      <g transform="translate(-52 -44)">
        <rect width="38" height="9" rx="2" fill="#06061c" opacity=".85" />
        <rect x="2" y="2" width="5" height="5" rx="1" fill="#ef4444" />
        <rect x="31" y="2" width="5" height="5" rx="1" fill="#3b82f6" />
        <text x="19" y="7" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">0 - 0</text>
      </g>
    </g>
  )
}

const MC_HEIGHTS = [3, 3, 3, 4, 4, 3, 2, 2, 3, 3, 4, 4, 3, 3]

function McBlock({ x, y, kind, size = 8 }: { x: number; y: number; kind: 'grass' | 'dirt' | 'plank' | 'roof' | 'ore'; size?: number }) {
  const c = { grass: '#5aa832', dirt: '#8a5a32', plank: '#b88a50', roof: '#a23b3b', ore: '#8a5a32' }[kind]
  const d = size / 4
  return (
    <g>
      <rect x={x} y={y} width={size} height={size} fill={c} />
      {kind === 'grass' ? <rect x={x} y={y} width={size} height={d} fill="#7bd048" /> : null}
      {kind === 'plank' ? <rect x={x} y={y + size / 2 - 0.4} width={size} height=".8" fill="#6e4a22" /> : null}
      {kind === 'roof' ? <rect x={x} y={y + size - d} width={size} height={d} fill="#7a2626" /> : null}
      {kind === 'ore' ? <rect x={x + d} y={y + d} width={d * 2} height={d * 2} fill="#5eead4" /> : null}
      <rect x={x} y={y} width={size} height={size} fill="none" stroke="#000" strokeOpacity=".28" strokeWidth=".6" />
    </g>
  )
}

function MinecraftScreen() {
  return (
    <g transform="translate(0 -128)">
      <rect x="-56" y="-48" width="112" height="96" fill="url(#acMcSky)" />
      <rect x="26" y="-40" width="11" height="11" fill="#ffe066" />
      <g className="ac-mc-cloud" fill="#fff" opacity=".92">
        <rect x="-44" y="-34" width="22" height="5" />
        <rect x="-38" y="-39" width="11" height="5" />
        <rect x="2" y="-24" width="20" height="5" />
        <rect x="8" y="-29" width="9" height="5" />
      </g>
      {MC_HEIGHTS.map((h, c) =>
        Array.from({ length: h }, (_, r) => (
          <McBlock key={`${c}-${r}`} x={-56 + c * 8} y={48 - (h - r) * 8} kind={r === 0 ? 'grass' : r === 2 && c % 5 === 1 ? 'ore' : 'dirt'} />
        )),
      )}
      <rect x="-31" y="-1" width="6" height="17" fill="#6b4423" />
      <rect x="-31" y="-1" width="2" height="17" fill="#4e3118" />
      <g fill="#2f8f35">
        <rect x="-41" y="-15" width="26" height="16" />
        <rect x="-37" y="-21" width="18" height="6" />
      </g>
      <g fill="#1f6d27">
        <rect x="-41" y="-9" width="6" height="4" />
        <rect x="-30" y="-13" width="6" height="4" />
        <rect x="-23" y="-3" width="8" height="4" />
        <rect x="-35" y="-19" width="5" height="3" />
      </g>
    </g>
  )
}

function Car({ flame = true }: { flame?: boolean }) {
  return (
    <g>
      {flame ? (
        <g className="ac-rl-flame">
          <path d="M-19 -6 L-40 -3 L-19 -1Z" fill="#ff8a1f" />
          <path d="M-19 -5 L-31 -3.2 L-19 -2Z" fill="#ffe08a" />
        </g>
      ) : null}
      <path d="M-19 0 L-19 -5 Q-19 -7 -16 -7.5 L-9 -9 L-4 -15 Q-3 -16 -1 -16 L8 -16 Q10 -16 11.5 -14 L15 -9 L19 -7.5 Q21 -7 21 -4 L21 0Z" fill="#2f6bff" />
      <path d="M-3 -9 L0 -14 L8 -14 L11 -9Z" fill="#cfe8ff" />
      <rect x="-19" y="-4.2" width="40" height="1.8" fill="#ff8a1f" />
      {[-11, 12].map((x) => (
        <g key={x} transform={`translate(${x} 0)`}>
          <circle r="4.4" fill="#0b0b14" />
          <circle r="2" fill="#b8c2d8" />
        </g>
      ))}
    </g>
  )
}

function RlBall({ r = 8 }: { r?: number }) {
  return (
    <g>
      <circle r={r} fill="url(#acBall)" />
      <path d={`M${-r} 0 Q0 ${-r * 0.5} ${r} 0 M${-r * 0.7} ${r * 0.7} Q0 ${r * 0.1} ${r * 0.7} ${r * 0.7}`} fill="none" stroke="#ff8a1f" strokeWidth={r * 0.18} />
      <circle r={r} fill="none" stroke="#1d4ed8" strokeOpacity=".5" strokeWidth=".7" />
    </g>
  )
}

function RocketField() {
  return (
    <>
      <rect x="-56" y="-48" width="112" height="40" fill="url(#acRlWall)" />
      <rect x="-56" y="-48" width="38" height="40" fill="#2f6bff" opacity=".28" />
      <rect x="18" y="-48" width="38" height="40" fill="#ff8a1f" opacity=".26" />
      <path d="M-56 -8 H56" stroke="#7dd3fc" strokeWidth="1.2" opacity=".7" />
      <path d="M-56 -8 H56 L56 48 H-56Z" fill="url(#acRlField)" />
      {[-8, 6, 20, 36].map((y, i) => (
        <path key={y} d={`M-56 ${y} H56`} stroke="#7dd3fc" strokeOpacity={0.1 + i * 0.05} strokeWidth=".8" />
      ))}
      <ellipse cx="0" cy="22" rx="30" ry="8" fill="none" stroke="#bae6fd" strokeOpacity=".45" strokeWidth=".9" />
      <path d="M0 -8 V48" stroke="#bae6fd" strokeOpacity=".3" strokeWidth=".8" />
    </>
  )
}

function RocketScreen() {
  return (
    <g transform="translate(0 -128)">
      <RocketField />
      {[[-40, 40], [40, 40], [-20, 10]].map(([x, y], i) => (
        <circle key={i} className="ac-rl-pad" cx={x} cy={y} r="2.6" fill="#ff8a1f" style={{ animationDelay: `${-i * 0.6}s` }} />
      ))}
      <ellipse cx="-22" cy="30" rx="22" ry="3" fill="#000" opacity=".35" />
      <g transform="translate(-22 30)">
        <Car />
      </g>
      <g transform="translate(24 20)">
        <ellipse cy="10" rx="9" ry="2.4" fill="#000" opacity=".35" />
        <RlBall />
      </g>
    </g>
  )
}

function SiegeScreen() {
  return (
    <g transform="translate(0 -128)">
      <rect x="-56" y="-48" width="112" height="96" fill="url(#acSgBg)" />
      <rect x="-56" y="-48" width="112" height="96" fill="url(#acHex)" />
      <rect x="-56" y="-48" width="112" height="96" fill="#0b1220" opacity=".25" />
      <path d="M-56 30 H56" stroke="#3b82f6" strokeOpacity=".4" strokeWidth=".8" />
      <g className="ac-sg-sil">
        <path d="M-32 48 L-28 24 Q-24 14 -11 11 L11 11 Q24 14 28 24 L32 48Z" fill="#060a14" stroke="#60a5fa" strokeOpacity=".7" strokeWidth=".8" />
        <path d="M-12 11 L0 22 L12 11" fill="none" stroke="#60a5fa" strokeOpacity=".5" strokeWidth=".7" />
        <rect x="-5" y="2" width="10" height="9" fill="#060a14" />
        <path d="M-12 -6 Q-12 -19 0 -19 Q12 -19 12 -6 L12 3 Q0 9 -12 3Z" fill="#060a14" stroke="#60a5fa" strokeOpacity=".7" strokeWidth=".8" />
        <path d="M-12 -8 Q0 -12 12 -8 L12 -10 Q0 -14 -12 -10Z" fill="#1e3a8a" />
        <rect x="-9" y="-6" width="18" height="4" rx="1.6" fill="#7dd3fc" filter="url(#acGlow)" />
        <path d="M-5 4 H5" stroke="#1e3a8a" strokeWidth="1.2" />
      </g>
      <g className="ac-sg-ring" fill="none" stroke="#fbbf24" strokeWidth="1">
        <circle cy="-2" r="26" strokeDasharray="8 5" opacity=".85" />
      </g>
      <g stroke="#fbbf24" strokeWidth="1.1" fill="none">
        <path d="M-37 -2 H-29 M29 -2 H37 M0 -39 V-31 M0 27 V35" />
        <path d="M-50 -40 V-30 M-50 -40 H-40 M50 -40 V-30 M50 -40 H40 M-50 38 V28 M-50 38 H-40 M50 38 V28 M50 38 H40" stroke="#93c5fd" />
      </g>
      <path d="M0 -26 L22.5 -13 V13 L0 26 L-22.5 13 V-13Z" transform="translate(0 -2) scale(1.18)" fill="none" stroke="#3b82f6" strokeOpacity=".5" strokeWidth=".7" />
    </g>
  )
}

export function GameScreen({ game }: { game: GameKey }) {
  return game === 'fifa' ? <FifaScreen /> : game === 'minecraft' ? <MinecraftScreen /> : game === 'rocket' ? <RocketScreen /> : <SiegeScreen />
}

/* ---------- wrong-answer animations, played on the cabinet's own screen ---------- */

const MC_BUILD: { x: number; y: number; kind: 'grass' | 'plank' | 'roof' }[] = (() => {
  const out: { x: number; y: number; kind: 'grass' | 'plank' | 'roof' }[] = []
  for (let c = 0; c < 11; c++) out.push({ x: -55 + c * 10, y: 38, kind: 'grass' })
  for (const y of [28, 18, 8]) for (let c = 3; c <= 7; c++) if (!(c === 5 && y > 8)) out.push({ x: -55 + c * 10, y, kind: 'plank' })
  const roof: [number, number, number][] = [[-2, 2, 8], [-12, 3, 7], [-22, 4, 6], [-32, 5, 5]]
  for (const [y, a, b] of roof) for (let c = a; c <= b; c++) out.push({ x: -55 + c * 10, y, kind: 'roof' })
  return out
})()

const MC_BLOCK_STEP = 48
export const MC_PLAY_MS = 3100

function MinecraftPlay() {
  const boom = MC_BUILD.length * MC_BLOCK_STEP + 240
  return (
    <g className="ac-play ac-play--mc" transform="translate(0 -128)">
      <rect x="-56" y="-48" width="112" height="96" fill="url(#acMcSky)" />
      <rect x="26" y="-40" width="11" height="11" fill="#ffe066" />
      {MC_BUILD.map((b, i) => (
        <g
          key={i}
          className="ac-mcb"
          style={
            {
              animationDelay: `${i * MC_BLOCK_STEP}ms, ${boom}ms`,
              '--dx': `${(((i * 37) % 90) - 45) * 1.1}px`,
              '--dy': `${-24 - ((i * 53) % 52)}px`,
              '--rot': `${((i * 71) % 360) - 180}deg`,
            } as CSSProperties
          }
        >
          <McBlock x={b.x} y={b.y} kind={b.kind} size={10} />
        </g>
      ))}
      <rect className="ac-mc-flash" x="-56" y="-48" width="112" height="96" fill="#fff" style={{ animationDelay: `${boom}ms` }} />
    </g>
  )
}

export const RL_PLAY_MS = 2900

function RocketPlay() {
  return (
    <g className="ac-play ac-play--rl" transform="translate(0 -128)">
      <RocketField />
      <g className="ac-rl-lines" stroke="#e0f2fe" strokeWidth="1" opacity=".0">
        {[18, 26, 34, 40].map((y, i) => (
          <path key={y} d={`M${-50 + i * 9} ${y} h${22 + i * 4}`} />
        ))}
      </g>
      <g transform="translate(14 30)">
        <ellipse className="ac-rl-shadow" cy="0" rx="9" ry="2.4" fill="#000" opacity=".35" />
      </g>
      <g transform="translate(14 -28)">
        <g className="ac-rl-ball">
          <RlBall />
        </g>
      </g>
      <g transform="translate(0 30)">
        <g className="ac-rl-x">
          <g className="ac-rl-y">
            <Car />
          </g>
        </g>
      </g>
    </g>
  )
}

export const SG_PLAY_MS = 2700

const SMOKE = [
  [-14, 34, 16], [8, 30, 16], [-30, 20, 15], [18, 14, 16], [-8, 8, 18], [-26, -8, 16], [22, -10, 16], [0, -22, 17], [-34, -30, 14], [30, -30, 14], [-12, -38, 14], [12, 40, 14],
]

function SiegePlay() {
  return (
    <g className="ac-play ac-play--sg" transform="translate(0 -128)">
      <rect x="-56" y="-48" width="112" height="96" fill="url(#acSgBg)" />
      <rect x="-56" y="-48" width="112" height="96" fill="url(#acHex)" />
      <g className="ac-sg-can" transform="translate(-14 38)">
        <g className="ac-sg-can__i">
          <rect x="-3.4" y="-6" width="6.8" height="12" rx="2" fill="#9ca3af" stroke="#4b5563" strokeWidth=".6" />
          <rect x="-3.4" y="-6" width="6.8" height="3" rx="1" fill="#374151" />
        </g>
      </g>
      <g filter="url(#acSmoke)">
        {SMOKE.map(([x, y, r], i) => (
          <circle
            key={i}
            className="ac-sg-puff"
            cx={x}
            cy={y}
            r={r}
            fill="url(#acSmokeG)"
            style={{ animationDelay: `${450 + i * 130}ms`, transformOrigin: `${x}px ${y}px` }}
          />
        ))}
      </g>
    </g>
  )
}

export function GamePlay({ game }: { game: GameKey }) {
  return game === 'minecraft' ? <MinecraftPlay /> : game === 'rocket' ? <RocketPlay /> : game === 'siege' ? <SiegePlay /> : null
}

export const PLAY_MS: Record<GameKey, number> = { minecraft: MC_PLAY_MS, rocket: RL_PLAY_MS, siege: SG_PLAY_MS, fifa: 0 }

/* ---------- the cabinet ---------- */

export function Cabinet({ g, play }: { g: Game; play?: ReactNode }) {
  const t = g.theme
  return (
    <>
      <g className="ac-move">
        <g className="ac-refl" aria-hidden="true">
          <ellipse cx="0" cy="8" rx="112" ry="20" fill={`url(#acHalo-${g.key})`} className="ac-refl__pool" />
          <rect className="ac-refl__s" x="-52" y="3" width="104" height="74" fill={`url(#acStreak-${g.key})`} />
          <ellipse className="ac-halo" cx="0" cy="-128" rx="104" ry="92" fill={`url(#acHalo-${g.key})`} />
        </g>
        {g.key === 'fifa' ? (
          <g className="ac-rays" aria-hidden="true" transform="translate(0 -128)">
            <g className="ac-rays__i">
              {Array.from({ length: 12 }, (_, i) => (
                <path key={i} d="M0 0 L-9 -150 L9 -150Z" fill="#e0f7ff" transform={`rotate(${i * 30})`} />
              ))}
            </g>
          </g>
        ) : null}
        <g className="ac-lift">
          <g transform={`scale(${g.side} 1)`}>
            <path d="M75 0 L88 -6 L88 -214 L75 -229Z" fill="url(#acSide)" />
            <rect className="ac-neon-s" x="84.8" y="-205" width="1.8" height="190" fill={t} filter="url(#acGlow)" opacity=".7" />
          </g>
          <path d="M-75 0 V-216 Q-75 -232 -59 -232 H59 Q75 -232 75 -216 V0Z" fill="url(#acBody)" stroke={t} strokeOpacity=".3" strokeWidth=".8" />
          <g className="ac-neon-s" filter="url(#acGlow)">
            <rect x="-73.4" y="-212" width="2.6" height="204" rx="1.3" fill={t} />
            <rect x="70.8" y="-212" width="2.6" height="204" rx="1.3" fill={t} />
          </g>

          <g className="ac-mq">
            <rect x="-64" y="-228" width="128" height="40" rx="3" fill={`url(#acMq-${g.key})`} stroke={t} strokeOpacity=".75" strokeWidth="1" />
            {g.lines.map((line, i) => {
              const two = g.lines.length > 1
              const size = two ? (i ? 15 : 12.5) : g.key === 'fifa' ? 27 : g.key === 'minecraft' ? 18 : 14.5
              const len = two ? (i ? 56 : 104) : g.key === 'fifa' ? 64 : g.key === 'minecraft' ? 108 : 112
              const y = two ? -207 + i * 15 : g.key === 'fifa' ? -199 : -203
              return (
                <g key={line}>
                  <text className="ac-mq__t" x="0" y={y} textAnchor="middle" fontSize={size} textLength={len} lengthAdjust="spacingAndGlyphs" fill={t} filter="url(#acGlow)">
                    {line}
                  </text>
                  <text className="ac-mq__t" x="0" y={y} textAnchor="middle" fontSize={size} textLength={len} lengthAdjust="spacingAndGlyphs" fill="#fff">
                    {line}
                  </text>
                </g>
              )
            })}
          </g>

          <rect x="-60" y="-180" width="120" height="104" rx="6" fill="#06040f" stroke={t} strokeOpacity=".5" />
          <g clipPath="url(#acScreen)" className="ac-screen">
            <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#05040f" />
            <g className="ac-content">
              <GameScreen game={g.key} />
            </g>
            {play}
            <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="url(#acScan)" />
            <rect className="ac-glare" x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#eaffff" />
            <rect className="ac-off" x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#04030c" />
            <path d="M-56 -176 H18 L-18 -80 H-56Z" fill="url(#acGlass)" />
          </g>
          <rect x="-56" y="-176" width="112" height="96" rx="3" fill="none" stroke={t} strokeOpacity=".7" strokeWidth="1.2" className="ac-tmold" />

          <path d="M-70 -74 H70 L76 -50 H-76Z" fill="url(#acPanel)" stroke={t} strokeOpacity=".45" strokeWidth=".8" />
          <g transform="translate(-36 -63)">
            <circle r="5" fill="#0a0720" />
            <path d="M0 0 L0 -7" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" />
            <circle cy="-8.4" r="3" fill="#f43f5e" />
          </g>
          {[[8, '#f472b6'], [20, '#22d3ee'], [32, '#fbbf24']].map(([x, c], i) => (
            <circle key={i} cx={x as number} cy={-62 + i * 0.8} r="3.2" fill={c as string} stroke="#05030f" strokeWidth=".8" />
          ))}
          <circle className="ac-led" cx="60" cy="-62" r="2.2" fill="#4ade80" />

          <rect x="-75" y="-47" width="150" height="41" fill="#0d0a28" />
          <rect x="-75" y="-6" width="150" height="6" fill="#05030f" />
          <g className="ac-neon-s" filter="url(#acGlow)">
            <rect x="-62" y="-43" width="124" height="2.2" rx="1.1" fill={t} />
            <rect x="-62" y="-12" width="124" height="2.2" rx="1.1" fill={t} />
          </g>
          <rect x="-6" y="-37" width="12" height="20" rx="2" fill="#05030f" stroke={t} strokeOpacity=".6" />
          <rect x="-1.2" y="-33" width="2.4" height="12" rx="1" fill="#fbbf24" opacity=".9" />
          <rect className="ac-ring" x="-86" y="-240" width="182" height="248" rx="10" fill="none" stroke="#d9b77a" strokeWidth="2" strokeDasharray="6 5" />
        </g>
      </g>
    </>
  )
}
