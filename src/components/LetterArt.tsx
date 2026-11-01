import { memo } from 'react'
import type { CSSProperties } from 'react'
import { rng } from '../fx/noise'

/* ---------- geometry (computed once) ---------- */

const C = 60
type Pt = [number, number]

/** Smooth closed outline through noisy radii (Catmull-Rom converted to cubic Beziers). */
function blob(seed: number, radius: number, n: number, amp: number): string {
  const r = rng(seed)
  const pts: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rad = radius * (1 + (r() - 0.5) * 2 * amp)
    pts.push([C + Math.cos(a) * rad, C + Math.sin(a) * rad])
  }
  const f = (v: number) => v.toFixed(2)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}

const RIM = blob(7, 49, 15, 0.075)
const LIP = blob(21, 33.5, 11, 0.03)
const HEART = 'M60 77C44 65 40.5 53 47.5 46.5C53.5 41.5 58.8 45 60 50.5C61.2 45 66.5 41.5 72.5 46.5C79.5 53 76 65 60 77Z'

const SHARDS = 7
const CRACK_C: Pt = [58.5, 57]
const CRACK_R = [0, 13, 27, 43, 62, 80]

const crackLines: Pt[][] = []
const shards: { points: string; ox: number; oy: number; dx: number; dy: number; rot: number; dl: number }[] = []
{
  const r = rng(91)
  const step = (Math.PI * 2) / SHARDS
  const base = -0.35
  const angles: number[] = []
  for (let k = 0; k < SHARDS; k++) angles.push(base + k * step + (r() - 0.5) * step * 0.42)
  for (const a of angles) {
    const line: Pt[] = []
    for (const rad of CRACK_R) {
      const j = rad === 0 ? 0 : (r() - 0.5) * 7
      line.push([CRACK_C[0] + Math.cos(a) * rad - Math.sin(a) * j, CRACK_C[1] + Math.sin(a) * rad + Math.cos(a) * j])
    }
    crackLines.push(line)
  }
  for (let k = 0; k < SHARDS; k++) {
    const l1 = crackLines[k]
    const l2 = crackLines[(k + 1) % SHARDS]
    const mid = (angles[k] + (k + 1 < SHARDS ? angles[k + 1] : angles[0] + Math.PI * 2)) / 2
    const pts: Pt[] = [...l1, [CRACK_C[0] + Math.cos(mid) * 92, CRACK_C[1] + Math.sin(mid) * 92], ...[...l2].reverse()]
    const reach = 22 + r() * 8
    shards.push({
      points: pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '),
      ox: CRACK_C[0] + Math.cos(mid) * 28,
      oy: CRACK_C[1] + Math.sin(mid) * 28,
      dx: Math.cos(mid) * reach * (1.1 + r() * 0.5) + (r() - 0.5) * 8,
      dy: Math.sin(mid) * reach * 0.8 + 18 + r() * 26,
      rot: (r() < 0.5 ? -1 : 1) * (16 + r() * 40),
      dl: Math.round(r() * 110),
    })
  }
}

/** Small loose chips thrown by the impact. */
const chips = (() => {
  const r = rng(5)
  return Array.from({ length: 11 }, (_, i) => {
    const a = r() * Math.PI * 2
    const d = 10 + r() * 30
    const x = C + Math.cos(a) * d
    const y = C + Math.sin(a) * d
    const s = 2.2 + r() * 3.6
    const pts: Pt[] = [
      [x + (r() - 0.5) * s, y - s * (0.6 + r() * 0.5)],
      [x + s * (0.7 + r() * 0.5), y + s * (0.3 + r() * 0.4)],
      [x - s * (0.6 + r() * 0.4), y + s * (0.5 + r() * 0.4)],
    ]
    return {
      points: pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '),
      ox: x,
      oy: y,
      dx: Math.cos(a) * (34 + r() * 38),
      dy: Math.sin(a) * (22 + r() * 20) + 30 + r() * 40,
      rot: (r() - 0.5) * 360,
      dl: 40 + Math.round(r() * 160),
      tone: i % 3,
    }
  })
})()

/* ---------- the wax seal ---------- */

/**
 * Wax seal drawn in SVG: a raised, irregular rim, a pressed centre, a heart debossed into the wax,
 * a soft specular filter for relief and a rare sheen. When `breaking`, hairline cracks propagate, then the
 * wax splits along them into independent shards (clipped copies of the same artwork) plus a few loose chips.
 */
function WaxSealImpl({ breaking }: { breaking: boolean }) {
  return (
    <svg
      className={`lt-svg${breaking ? ' is-breaking' : ''}`}
      viewBox="0 0 120 120"
      width="100%"
      height="100%"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="ltRim" cx="36%" cy="30%" r="82%">
          <stop offset="0" stopColor="#8d3c49" />
          <stop offset="0.42" stopColor="#6a2631" />
          <stop offset="1" stopColor="#401820" />
        </radialGradient>
        <radialGradient id="ltCenter" cx="62%" cy="68%" r="78%">
          <stop offset="0" stopColor="#7a303c" />
          <stop offset="0.6" stopColor="#5b222c" />
          <stop offset="1" stopColor="#3b141b" />
        </radialGradient>
        <linearGradient id="ltLip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2d0f15" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#5b222c" stopOpacity="0" />
          <stop offset="1" stopColor="#d99a9a" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="ltHeartFill" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#2a0d13" />
          <stop offset="1" stopColor="#4e1d27" />
        </linearGradient>
        <linearGradient id="ltSheenGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe7e0" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffe7e0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe7e0" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ltShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0.55" stopColor="#2a0e13" stopOpacity="0.5" />
          <stop offset="1" stopColor="#2a0e13" stopOpacity="0" />
        </radialGradient>
        <filter id="ltRelief" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="h" />
          <feSpecularLighting in="h" surfaceScale="5" specularConstant="0.7" specularExponent="26" lightingColor="#ffe9e2" result="s">
            <feDistantLight azimuth="235" elevation="48" />
          </feSpecularLighting>
          <feComposite in="s" in2="SourceAlpha" operator="in" result="sc" />
          <feComponentTransfer in="sc" result="sl">
            <feFuncA type="linear" slope="0.55" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="sl" />
          </feMerge>
        </filter>
        <clipPath id="ltRimClip">
          <path d={RIM} />
        </clipPath>
        {shards.map((s, i) => (
          <clipPath id={`ltShard${i}`} key={i}>
            <polygon points={s.points} />
          </clipPath>
        ))}
        <path id="ltHeart" d={HEART} />
        <g id="ltWax">
          <g filter="url(#ltRelief)">
            <path d={RIM} fill="url(#ltRim)" />
            <g clipPath="url(#ltRimClip)">
              <ellipse cx="38" cy="36" rx="22" ry="15" fill="#a64d5b" opacity="0.22" transform="rotate(-24 38 36)" />
              <ellipse cx="84" cy="86" rx="24" ry="14" fill="#1f070c" opacity="0.28" transform="rotate(-28 84 86)" />
              <ellipse cx="93" cy="38" rx="9" ry="14" fill="#7d2f3a" opacity="0.25" />
              <path d={RIM} fill="none" stroke="#2a0d13" strokeWidth="5" opacity="0.35" />
            </g>
            <path d={LIP} fill="url(#ltCenter)" />
            <path d={LIP} fill="none" stroke="url(#ltLip)" strokeWidth="1.9" />
          </g>
          <use href="#ltHeart" transform="translate(0.9 1.2)" fill="#f0b2a8" opacity="0.42" />
          <use href="#ltHeart" fill="url(#ltHeartFill)" />
          <path d="M49.5 47.5C53 45 57 46.6 58.4 50" fill="none" stroke="#000" strokeWidth="1.1" strokeLinecap="round" opacity="0.28" />
          <g clipPath="url(#ltRimClip)">
            <g className="lt-sheen-g">
              <rect className="lt-sheen" x="-34" y="-20" width="22" height="160" fill="url(#ltSheenGrad)" />
            </g>
          </g>
        </g>
      </defs>

      <ellipse className="lt-seal-shadow" cx="63" cy="71" rx="57" ry="50" fill="url(#ltShadow)" />
      <use className="lt-intact" href="#ltWax" />

      <g className="lt-cracks" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {crackLines.map((l, i) => {
          const d = 'M' + l.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')
          const st = { '--cd': `${150 + i * 34}ms` } as CSSProperties
          return (
            <g key={i} style={st}>
              <path className="lt-crack lt-crack--lit" d={d} pathLength={1} transform="translate(0.7 0.8)" />
              <path className="lt-crack" d={d} pathLength={1} />
            </g>
          )
        })}
      </g>

      <g className="lt-shards">
        {shards.map((s, i) => {
          const st = {
            '--dx': `${s.dx.toFixed(1)}px`,
            '--dy': `${s.dy.toFixed(1)}px`,
            '--rot': `${s.rot.toFixed(0)}deg`,
            '--dl': `${s.dl}ms`,
            transformOrigin: `${s.ox.toFixed(1)}px ${s.oy.toFixed(1)}px`,
          } as CSSProperties
          return (
            <g className="lt-shard" key={i} style={st}>
              <use href="#ltWax" clipPath={`url(#ltShard${i})`} />
            </g>
          )
        })}
        {chips.map((c, i) => {
          const st = {
            '--dx': `${c.dx.toFixed(1)}px`,
            '--dy': `${c.dy.toFixed(1)}px`,
            '--rot': `${c.rot.toFixed(0)}deg`,
            '--dl': `${c.dl}ms`,
            transformOrigin: `${c.ox.toFixed(1)}px ${c.oy.toFixed(1)}px`,
          } as CSSProperties
          return (
            <g className="lt-chip" key={i} style={st}>
              <polygon points={c.points} fill={c.tone === 0 ? '#6a2631' : c.tone === 1 ? '#8d3c49' : '#4a1b24'} />
              <polygon points={c.points} fill="none" stroke="#e8aaa0" strokeWidth="0.5" opacity="0.5" />
            </g>
          )
        })}
      </g>
    </svg>
  )
}

export const WaxSeal = memo(WaxSealImpl)

/* ---------- ink-like word reveal ---------- */

export function wordsOf(text: string): string[] {
  return text.split(/\s+/).filter(Boolean)
}

/** Shows a text word by word, each word wiped in like fresh ink. Full text stays available to screen readers. */
export function Ink({
  text,
  start,
  per,
  className,
}: {
  text: string
  start: number
  per: number
  className?: string
}) {
  const words = wordsOf(text)
  return (
    <p className={className}>
      <span className="lt-sr">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className="lt-w" style={{ animationDelay: `${Math.round(start + i * per)}ms` }}>
              {w}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </p>
  )
}
