import type { CSSProperties } from 'react'

/** Shared gold-foil gradient for the printed details of the card (referenced as url(#rsGold)). */
export function GoldDefs() {
  return (
    <svg width="0" height="0" className="rs-defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="rsGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8803f" />
          <stop offset="0.35" stopColor="#e6c98f" />
          <stop offset="0.6" stopColor="#b88c4d" />
          <stop offset="1" stopColor="#d9b77a" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const PLATE_RINGS = [
  { cx: 60, cy: 47, r: 27 },
  { cx: 60, cy: 47, r: 20.5 },
]
const FORK = 'M20 20v14.5c0 4 3 5.5 6 5.5s6-1.5 6-5.500V20M26 40v31M26 20v11'
const KNIFE = 'M95 19c6 6 7.5 19 1.5 31.500V71'

/** Top view of a laid table: a plate, a fork and a knife. Printed in gold, with a pale offset for the pressed look. */
export function PlaceSetting({ className }: { className?: string }) {
  const lines = (stroke: string, w: number) => (
    <g fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {PLATE_RINGS.map((c) => (
        <circle key={c.r} {...c} />
      ))}
      <circle cx="60" cy="47" r="24" strokeDasharray="0.1 3.3" strokeWidth={w * 1.6} />
      <path d={FORK} />
      <path d={KNIFE} />
    </g>
  )
  return (
    <svg className={className} viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      <g transform="translate(0.6 0.7)" opacity="0.9">{lines('#fffaf2', 0.9)}</g>
      {lines('url(#rsGold)', 0.9)}
    </svg>
  )
}

/** Circular postmark-style stamp for the back of the card. */
export function Stamp({ text, className }: { text: string; className?: string }) {
  const t = text.toUpperCase()
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        <path id="rsStampPath" d="M50 50m-37 0a37 37 0 1 1 74 0a37 37 0 1 1-74 0" />
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="0.8">
        <circle cx="50" cy="50" r="47" />
        <circle cx="50" cy="50" r="27" strokeDasharray="1.2 2.2" />
      </g>
      <text fill="currentColor" fontSize="8.2" letterSpacing="1.4" fontFamily="Inter, system-ui, sans-serif" fontWeight="500">
        <textPath href="#rsStampPath" textLength="226" lengthAdjust="spacing">{`${t} · ${t} · `}</textPath>
      </text>
      <path d="M50 38l3.5 12-3.5 12-3.5-12z" fill="currentColor" />
    </svg>
  )
}

const TINTS: [string, string][] = [
  ['#f4e6dc', '#dcc0b8'],
  ['#efdcd2', '#c9a09b'],
  ['#f3e4d2', '#d9bf94'],
  ['#ead9d1', '#b98d88'],
  ['#f1e1d6', '#cfb0a6'],
]

/** Illustrated plate used in place of a photo: a lettered dinner plate whose rim changes from one idea to the next. */
export function PlateArt({ letter, index, className }: { letter: string; index: number; className?: string }) {
  const [a, b] = TINTS[index % TINTS.length]
  const dashes = [26, 18, 32, 14, 22][index % 5]
  const id = `rsPlate${index}`
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
      style={{ '--spin': `${(index % 2 ? -1 : 1) * 10}deg` } as CSSProperties}
    >
      <defs>
        <radialGradient id={id} cx="38%" cy="32%" r="80%">
          <stop offset="0" stopColor="#fffaf2" />
          <stop offset="0.45" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="70" rx="26" ry="3.4" fill="rgba(52,30,34,0.18)" />
      <circle cx="40" cy="38" r="31" fill={`url(#${id})`} stroke="rgba(142,118,107,0.45)" strokeWidth="0.8" />
      <circle cx="40" cy="38" r="24" fill="none" stroke="rgba(142,118,107,0.4)" strokeWidth="0.7" />
      <circle
        className="rs-plate__rim"
        cx="40" cy="38" r="27.5" fill="none" stroke="url(#rsGold)" strokeWidth="1.5" strokeLinecap="round"
        strokeDasharray={`0.1 ${((2 * Math.PI * 27.5) / dashes - 0.1).toFixed(2)}`}
      />
      <text
        x="40" y="46.5" textAnchor="middle" fontSize="23" fontStyle="italic" fill="#4d2028"
        fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="500"
      >
        {letter}
      </text>
    </svg>
  )
}

/** First letter of a name once its article is removed (« L’Astronome » -> A). */
export function monogramOf(name: string): string {
  const s = name.replace(/^(l[’']|le\s+|la\s+|les\s+)/i, '').trim()
  return (s[0] ?? name[0] ?? '·').toUpperCase()
}
