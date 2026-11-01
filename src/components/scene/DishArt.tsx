import { rng } from '../../fx/noise'

interface Pt { x: number; y: number; a: number; s: number; k: number }

/** Seeded points inside an ellipse, sorted from back to front so overlapping pieces stack naturally. */
function scatter(seed: number, n: number, rx: number, ry: number, cx = 0, cy = 0): Pt[] {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const a = r() * Math.PI * 2
    const d = Math.sqrt(r())
    return { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, a: r() * 360, s: 0.8 + r() * 0.45, k: r() }
  }).sort((p, q) => p.y - q.y)
}

const COQUILLETTES = scatter(11, 58, 38, 23, 0, -3)
const HAM = scatter(23, 8, 30, 16, 0, -6)
const PARSLEY = scatter(5, 10, 34, 20, 0, -4)
const NOODLES = (() => {
  const r = rng(7)
  return Array.from({ length: 26 }, (_, i) => ({
    rx: 14 + r() * 28,
    ry: 8 + r() * 15,
    rot: r() * 180,
    cx: (r() - 0.5) * 10,
    cy: -2 - i * 0.28,
    w: 1.7 + r() * 0.9,
    c: i % 3 === 0 ? '#dfae50' : i % 3 === 1 ? '#f1d58a' : '#e8c26c',
  }))
})()
const DICE = scatter(31, 9, 18, 9, 1, -12)
const FRIES = scatter(41, 24, 21, 15, 30, -4)
const SUGAR = scatter(53, 46, 28, 14, 0, -14)
const SPOTS = scatter(61, 16, 38, 24, 0, 2)

export function TableDefs() {
  return (
    <defs>
      <pattern id="tbGing" width="44" height="44" patternUnits="userSpaceOnUse">
        <rect width="44" height="44" fill="#fbf3ea" />
        <rect width="44" height="22" fill="#d27b82" opacity=".3" />
        <rect width="22" height="44" fill="#d27b82" opacity=".3" />
      </pattern>
      <pattern id="tbWoodP" width="80" height="440" patternUnits="userSpaceOnUse">
        <rect width="80" height="440" fill="#7b4c2c" />
        <rect width="2" height="440" fill="#5a3219" opacity=".7" />
        <path d="M14 0 C20 120 8 260 16 440 M44 0 C38 140 52 280 46 440 M66 0 C70 100 60 300 68 440" stroke="#8f5c37" strokeWidth="1.2" fill="none" opacity=".6" />
      </pattern>
      <radialGradient id="tbPlate" cx="38%" cy="32%" r="80%">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#ece2d4" />
      </radialGradient>
      <radialGradient id="tbWell" cx="46%" cy="40%" r="70%">
        <stop offset="0" stopColor="#fffdf8" />
        <stop offset=".7" stopColor="#f3eadd" />
        <stop offset="1" stopColor="#e3d6c4" />
      </radialGradient>
      <radialGradient id="tbSauce" cx="40%" cy="30%" r="80%">
        <stop offset="0" stopColor="#f26c4c" />
        <stop offset=".55" stopColor="#cf3022" />
        <stop offset="1" stopColor="#8f1710" />
      </radialGradient>
      <radialGradient id="tbCrepe" cx="40%" cy="30%" r="85%">
        <stop offset="0" stopColor="#f6dc9f" />
        <stop offset="1" stopColor="#dfa550" />
      </radialGradient>
      <radialGradient id="tbSteak" cx="38%" cy="30%" r="85%">
        <stop offset="0" stopColor="#9a5532" />
        <stop offset="1" stopColor="#53271a" />
      </radialGradient>
      <linearGradient id="tbFry" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f7d062" />
        <stop offset="1" stopColor="#dfa033" />
      </linearGradient>
      <linearGradient id="tbHam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f5b0ad" />
        <stop offset="1" stopColor="#df7a82" />
      </linearGradient>
      <linearGradient id="tbSteel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f6f8" />
        <stop offset=".5" stopColor="#c5ccd3" />
        <stop offset="1" stopColor="#9aa3ac" />
      </linearGradient>
      <radialGradient id="tbLight" gradientUnits="userSpaceOnUse" cx="90" cy="60" r="420">
        <stop offset="0" stopColor="#ffdca0" stopOpacity=".42" />
        <stop offset=".5" stopColor="#ffdca0" stopOpacity=".1" />
        <stop offset="1" stopColor="#ffdca0" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="tbVig" cx="50%" cy="45%" r="75%">
        <stop offset=".55" stopColor="#2a0f0a" stopOpacity="0" />
        <stop offset="1" stopColor="#2a0f0a" stopOpacity=".5" />
      </radialGradient>
      <radialGradient id="tbSpot" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fff2cc" stopOpacity=".85" />
        <stop offset=".6" stopColor="#ffe3a1" stopOpacity=".3" />
        <stop offset="1" stopColor="#ffe3a1" stopOpacity="0" />
      </radialGradient>
      <filter id="tbBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id="tbBlurS" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <filter id="tbSteamBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
      <clipPath id="tbSauceClip">
        <path d="M-22 -10 C-26 -22 -6 -30 8 -26 C24 -24 30 -10 22 0 C16 8 0 6 -8 8 C-18 8 -20 0 -22 -10Z" />
      </clipPath>
      <clipPath id="tbSteakClip">
        <path d="M-40 -6 C-42 -22 -22 -30 -8 -28 C8 -30 20 -20 18 -6 C16 8 0 14 -14 12 C-30 12 -39 4 -40 -6Z" />
      </clipPath>
    </defs>
  )
}

export function PlateBase() {
  return (
    <g>
      <ellipse cy="4.5" rx="77" ry="59" fill="#c9bba9" />
      <ellipse rx="77" ry="59" fill="url(#tbPlate)" stroke="#dccfbd" strokeWidth=".8" />
      <ellipse rx="72" ry="54.5" fill="none" stroke="#d9b77a" strokeWidth=".9" opacity=".85" />
      <ellipse rx="56" ry="42" fill="url(#tbWell)" stroke="#e1d4c2" strokeWidth="1" />
      <path d="M-63 -24 A70 52 0 0 1 -22 -50" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity=".85" fill="none" />
    </g>
  )
}

/** A: coquillettes with ham. */
export function PastaHam() {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="46" ry="31" fill="#e9d29a" opacity=".5" />
      <ellipse cx="0" cy="-2" rx="41" ry="27" fill="#f2dfa6" />
      {COQUILLETTES.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(0)}) scale(${p.s.toFixed(2)})`}>
          <path d="M-6.5 1.5 Q0 -7 6.5 1.5" stroke="#d9b45c" strokeWidth="5.6" strokeLinecap="round" fill="none" />
          <path d="M-6.5 1.5 Q0 -7 6.5 1.5" stroke={p.k > 0.5 ? '#f6dc8e' : '#efce74'} strokeWidth="4.4" strokeLinecap="round" fill="none" />
          <path d="M-4 0 Q0 -4.6 4 0" stroke="#fff3c4" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity=".8" />
        </g>
      ))}
      <ellipse cx="-4" cy="-10" rx="22" ry="8" fill="#fff8de" opacity=".28" />
      {HAM.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(p.a * 0.5).toFixed(0)})`}>
          <rect x="-6.5" y="-4.6" width="13" height="9.2" rx="2.6" fill="url(#tbHam)" stroke="#c9666d" strokeWidth=".7" />
          <rect x="-5.4" y="-3.8" width="10.8" height="2.6" rx="1.3" fill="#fff" opacity=".35" />
          <path d="M-5 3.2 h10" stroke="#fbe3d8" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
        </g>
      ))}
      {PARSLEY.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y - 1} r={0.9 + p.k * 0.9} fill={p.k > 0.4 ? '#4f9d3c' : '#6bb752'} />
      ))}
      {PARSLEY.slice(0, 6).map((p, i) => (
        <circle key={`p${i}`} cx={-p.x * 0.8} cy={p.y * 0.9 - 2} r=".7" fill="#4a3a2c" opacity=".7" />
      ))}
    </g>
  )
}

/** B: spaghetti with tomato sauce, the right answer. */
export function PastaTomato() {
  return (
    <g>
      <ellipse cx="0" cy="3" rx="46" ry="31" fill="#e8c26c" opacity=".45" />
      <ellipse cx="0" cy="-1" rx="42" ry="28" fill="#e6bf66" />
      {NOODLES.map((n, i) => (
        <ellipse key={i} cx={n.cx} cy={n.cy} rx={n.rx} ry={n.ry} fill="none" stroke={n.c} strokeWidth={n.w} transform={`rotate(${n.rot.toFixed(0)})`} opacity=".95" />
      ))}
      <ellipse cx="-6" cy="-8" rx="26" ry="9" fill="#fff0bd" opacity=".22" />
      {/* sauce */}
      <path d="M-24 -9 C-28 -22 -6 -31 8 -27 C26 -25 32 -10 23 1 C17 9 0 7 -8 9 C-19 9 -22 0 -24 -9Z" fill="#8f1710" opacity=".55" transform="translate(1.5 3)" />
      <path d="M-22 -10 C-26 -22 -6 -30 8 -26 C24 -24 30 -10 22 0 C16 8 0 6 -8 8 C-18 8 -20 0 -22 -10Z" fill="url(#tbSauce)" />
      <path d="M-14 7 C-14 13 -8 14 -8 8Z M10 5 C12 12 18 11 17 3Z M-24 -2 C-30 0 -28 8 -22 5Z" fill="#c42b1f" />
      {DICE.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={1.8 + p.k * 1.6} fill={p.k > 0.5 ? '#e24630' : '#a81f16'} opacity=".9" />
          <circle cx={p.x - 0.6} cy={p.y - 0.7} r=".6" fill="#fff" opacity=".6" />
        </g>
      ))}
      <path d="M-15 -18 C-8 -23 4 -24 12 -20" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".55" />
      <path d="M-18 -10 C-17 -13 -15 -14 -13 -14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity=".45" />
      <g clipPath="url(#tbSauceClip)">
        <rect className="tb-shine" x="-44" y="-40" width="12" height="60" fill="#fff" opacity=".5" transform="skewX(-22)" />
      </g>
      {/* basil + parmesan */}
      {[[-4, -22, -20], [6, -24, 25], [0, -18, 4]].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d="M0 0 C-7 -4 -9 -13 0 -18 C9 -13 7 -4 0 0Z" fill={i === 2 ? '#4aa752' : '#38933f'} />
          <path d="M0 0 V-15" stroke="#256e2e" strokeWidth=".9" />
          <path d="M0 -6 l-3 -3 M0 -10 l3 -3 M0 -10 l-3 -3" stroke="#256e2e" strokeWidth=".6" fill="none" />
        </g>
      ))}
      {[[-18, -14], [14, -16], [18, -6], [-12, 0]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} q3 -3.4 6 -.6`} stroke="#f8eac0" strokeWidth="2" strokeLinecap="round" fill="none" />
      ))}
      {/* a few sauce splashes on the plate */}
      <circle cx="-46" cy="14" r="1.6" fill="#c42b1f" opacity=".7" />
      <circle cx="44" cy="-14" r="1.2" fill="#c42b1f" opacity=".6" />
    </g>
  )
}

/** C: minced steak with fries. */
export function SteakFries() {
  return (
    <g>
      {/* lettuce */}
      <g transform="translate(-36 -22) rotate(-24)">
        <path d="M0 0 C-10 -6 -12 -18 0 -22 C12 -18 10 -6 0 0Z" fill="#7cc65b" stroke="#4f9c3a" strokeWidth=".8" />
        <path d="M0 0 V-18 M0 -8 l-5 -5 M0 -12 l5 -4" stroke="#b6e293" strokeWidth=".9" fill="none" />
      </g>
      {/* ketchup */}
      <path d="M-4 24 C-12 22 -10 30 -2 31 C8 32 14 28 10 24 C6 20 4 26 -4 24Z" fill="#c0261f" />
      <path d="M-5 25 C-3 24 0 25 1 26" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".55" fill="none" />
      {/* steak */}
      <path d="M-40 -6 C-42 -22 -22 -30 -8 -28 C8 -30 20 -20 18 -6 C16 8 0 14 -14 12 C-30 12 -39 4 -40 -6Z" fill="#3e1b10" transform="translate(1 3)" opacity=".5" />
      <path d="M-40 -6 C-42 -22 -22 -30 -8 -28 C8 -30 20 -20 18 -6 C16 8 0 14 -14 12 C-30 12 -39 4 -40 -6Z" fill="url(#tbSteak)" stroke="#3a190f" strokeWidth="1.2" />
      <g clipPath="url(#tbSteakClip)">
        {[-22, -8, 6, 20].map((x, i) => (
          <rect key={i} x={x} y="-40" width="5.4" height="60" fill="#2c1209" opacity=".62" transform="rotate(38)" />
        ))}
        {SPOTS.slice(0, 9).map((p, i) => (
          <circle key={i} cx={p.x * 0.7 - 10} cy={p.y * 0.6 - 8} r={0.8 + p.k * 1.2} fill="#c07a4c" opacity=".45" />
        ))}
        <ellipse cx="-18" cy="-18" rx="14" ry="5" fill="#fff" opacity=".18" transform="rotate(-16 -18 -18)" />
      </g>
      <g transform="translate(-14 -7) rotate(-8)">
        <rect x="-6" y="-4" width="12" height="8" rx="2" fill="#f7d96d" stroke="#e0b542" strokeWidth=".7" />
        <rect x="-5" y="-3.2" width="9" height="2.4" rx="1.2" fill="#fff6c4" opacity=".8" />
      </g>
      {[[-26, 2], [-4, 6], [8, -14]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="#6fb858" />
      ))}
      {/* fries */}
      {FRIES.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(p.a * 0.45 - 40).toFixed(0)})`}>
          <rect x="-3.1" y="-15" width="6.2" height={26 + p.k * 6} rx="2" fill="url(#tbFry)" stroke="#c98a24" strokeWidth=".5" />
          <rect x="-2" y="-13" width="1.6" height={20 + p.k * 5} rx=".8" fill="#fff0a8" opacity=".7" />
          {p.k > 0.55 && <circle cx="1" cy="-4" r=".7" fill="#b87518" opacity=".7" />}
        </g>
      ))}
      {FRIES.filter((_, i) => i % 3 === 0).map((p, i) => (
        <circle key={i} cx={p.x + 2} cy={p.y - 6} r=".7" fill="#fff" opacity=".9" />
      ))}
    </g>
  )
}

/** D: crêpes with chocolate and strawberry. */
export function Crepes() {
  return (
    <g>
      {/* chocolate puddle */}
      <path d="M-46 14 C-52 22 -40 30 -30 26 C-22 22 -30 12 -46 14Z" fill="#4a2616" />
      <path d="M-45 16 C-42 14 -38 15 -36 17" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity=".4" fill="none" />
      {/* bottom crêpe */}
      <ellipse cx="0" cy="5" rx="46" ry="32" fill="#b8792f" opacity=".5" />
      <ellipse cx="0" cy="2" rx="46" ry="32" fill="url(#tbCrepe)" stroke="#c48a3c" strokeWidth=".9" />
      {SPOTS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={1.2 + p.k * 2.4} fill="#b9772f" opacity={0.18 + p.k * 0.2} />
      ))}
      <ellipse cx="0" cy="2" rx="38" ry="26" fill="none" stroke="#c48a3c" strokeWidth=".8" strokeDasharray="2 3" opacity=".5" />
      {/* folded half */}
      <path d="M-36 -2 C-36 -28 36 -28 36 -2 Q0 9 -36 -2Z" fill="#e0a653" opacity=".6" transform="translate(0 3)" />
      <path d="M-36 -2 C-36 -28 36 -28 36 -2 Q0 9 -36 -2Z" fill="url(#tbCrepe)" stroke="#bd8138" strokeWidth=".9" />
      <path d="M-34 -3 Q0 8 34 -3" stroke="#bd8138" strokeWidth="1" fill="none" opacity=".7" />
      {/* folded quarter */}
      <path d="M-6 6 L-26 -14 C-12 -34 20 -34 32 -16 Z" fill="#c48a3c" opacity=".5" transform="translate(1 3)" />
      <path d="M-6 6 L-26 -14 C-12 -34 20 -34 32 -16 Z" fill="#f4d48a" stroke="#bd8138" strokeWidth=".9" />
      <path d="M-6 6 L32 -16" stroke="#bd8138" strokeWidth="1" opacity=".6" />
      {[[-12, -18], [6, -24], [18, -18], [-4, -10], [12, -8]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.6 + (i % 3) * 0.7} fill="#b9772f" opacity=".3" />
      ))}
      {/* chocolate drizzle + sugar */}
      <path d="M-24 -14 q5 -8 10 0 t10 0 t10 0 t10 0" stroke="#4a2616" strokeWidth="2.3" strokeLinecap="round" fill="none" />
      <path d="M-20 -6 q5 -7 10 0 t10 0 t10 0" stroke="#5a301b" strokeWidth="1.9" strokeLinecap="round" fill="none" />
      {SUGAR.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={0.7 + p.k * 0.8} fill="#fff" opacity=".9" />
      ))}
      {/* strawberry + mint */}
      <g transform="translate(28 8) rotate(14)">
        <path d="M0 -9 C11 -9 13 3 0 12 C-13 3 -11 -9 0 -9Z" fill="#d6283f" stroke="#a31428" strokeWidth=".8" />
        {[[-4, -2], [3, -3], [0, 3], [-5, 4], [5, 2]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx=".8" ry="1.3" fill="#fbe3a0" />
        ))}
        <path d="M-6 -9 l6 3 l6 -3 l-3 -3 l-3 2 l-3 -2z" fill="#3f9a45" />
        <ellipse cx="-3.6" cy="-4" rx="2" ry="3.2" fill="#fff" opacity=".35" transform="rotate(20)" />
      </g>
      <g transform="translate(-30 -12) rotate(-30)">
        <path d="M0 0 C-5 -3 -6 -9 0 -12 C6 -9 5 -3 0 0Z" fill="#4fb06a" />
        <path d="M0 0 V-10" stroke="#2f8548" strokeWidth=".8" />
      </g>
    </g>
  )
}

export function Cutlery({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) {
  return (
    <g className="tb-cutlery" transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-54" y="-14" width="108" height="30" rx="4" fill="#d79aa0" opacity=".9" transform="rotate(-3)" />
      <path d="M-54 -2 H54 M-54 8 H54" stroke="#fff" strokeWidth="1" opacity=".35" transform="rotate(-3)" />
      <ellipse cx="2" cy="12" rx="48" ry="5" fill="#000" opacity=".16" filter="url(#tbBlurS)" />
      <g className="tb-fork" transform="translate(-6 -3)">
        <rect x="-4" y="-2.4" width="48" height="4.8" rx="2.4" fill="url(#tbSteel)" />
        <rect x="-34" y="-6.8" width="30" height="13.6" rx="3.6" fill="url(#tbSteel)" />
        <path d="M-33 -2.4 H-8 M-33 2.4 H-8" stroke="#8d97a1" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <g className="tb-knife" transform="translate(-6 11)">
        <rect x="-4" y="-2.8" width="46" height="5.6" rx="2.8" fill="#3b2a24" />
        <path d="M-34 -4 H-5 C0 -4 2 -2 2 0 V3 H-34 C-37 3 -37 -4 -34 -4Z" fill="url(#tbSteel)" />
      </g>
    </g>
  )
}

export function Glass({ x, y, wine = false }: { x: number; y: number; wine?: boolean }) {
  return (
    <g className={`tb-glass${wine ? ' tb-glass--wine' : ''}`} transform={`translate(${x} ${y})`}>
      <ellipse cx="8" cy="9" rx="15" ry="11" fill="#000" opacity=".2" filter="url(#tbBlurS)" />
      <ellipse rx="15.5" ry="13.5" fill="rgba(255,255,255,.35)" stroke="#fff" strokeWidth="1.6" />
      <ellipse rx="11.6" ry="10" fill={wine ? '#7d1a36' : 'rgba(150,200,232,.55)'} />
      <ellipse cx="2" cy="2.4" rx="9" ry="7" fill={wine ? '#5e1126' : 'rgba(110,170,215,.45)'} opacity=".7" />
      <path d="M-11 -5 A12 10 0 0 1 -2 -10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity=".9" />
      <ellipse className="tb-glint" cx="-5" cy="-3" rx="2.4" ry="1.4" fill="#fff" />
    </g>
  )
}

export function Vase({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="9" cy="10" rx="15" ry="11" fill="#000" opacity=".22" filter="url(#tbBlurS)" />
      <circle r="12.4" fill="#f6f0e6" stroke="#d9cdbd" strokeWidth="1" />
      <circle r="9" fill="#7f9ab3" opacity=".35" />
      <g className="tb-flowers">
        {[[-7, -5, 7.6, '#e98a9c'], [6, -6, 7, '#f4b3bd'], [0, 5, 7.4, '#ee9aa9'], [8, 4, 5.4, '#fff4ec']].map(([fx, fy, r, c], i) => (
          <g key={i} transform={`translate(${fx} ${fy})`}>
            <circle r={r as number} fill={c as string} />
            <circle r={(r as number) * 0.66} fill="#fff" opacity=".28" />
            <path d={`M${-(r as number) * 0.4} 0 q${(r as number) * 0.4} ${-(r as number) * 0.7} ${(r as number) * 0.8} 0`} stroke="#c25f75" strokeWidth=".9" fill="none" opacity=".7" />
            <circle r={(r as number) * 0.22} fill="#f6d36a" />
          </g>
        ))}
        {[[-12, 4, -30], [12, -2, 20], [-2, -12, 80]].map(([lx, ly, r], i) => (
          <ellipse key={i} cx={lx} cy={ly} rx="6.4" ry="2.6" fill="#4d9a45" transform={`rotate(${r} ${lx} ${ly})`} />
        ))}
      </g>
    </g>
  )
}
