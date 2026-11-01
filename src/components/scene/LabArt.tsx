/** Static artwork of the lab scene (viewBox 400 x 540): defs, backdrop, bench and metal samples. */
export const LAB_W = 400
export const LAB_H = 540
/** Flask centres on the bench and the y of their base. */
export const FLASK_X = [72, 166, 260, 354]
export const FLASK_Y = 372

/** Top and bottom colour of each metal (solid and puddle). */
export const METALS = [
  { top: '#a9aeb5', bottom: '#555a61', dust: ['#9aa0a7', '#6d727a', '#c1c5ca'] },
  { top: '#e58f4e', bottom: '#98471d', dust: ['#d97a3a', '#b35a28', '#f0a46a'] },
  { top: '#69717c', bottom: '#262a31', dust: ['#59616b', '#3a3f47', '#8a929c'] },
  { top: '#eaf5fc', bottom: '#78a1bf', dust: ['#dcecf7', '#a9c8de', '#ffffff'] },
]

export const FLASK_BODY = 'M-11 -92 L-11 -64 L-35 -8 Q-38 0 -28 0 L28 0 Q38 0 35 -8 L11 -64 L11 -92 Z'

export function LabDefs() {
  return (
    <defs>
      <linearGradient id="labWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b1d25" />
        <stop offset=".6" stopColor="#4a2830" />
        <stop offset="1" stopColor="#2f171d" />
      </linearGradient>
      <linearGradient id="labBench" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6b4a44" />
        <stop offset=".35" stopColor="#4e302f" />
        <stop offset="1" stopColor="#2f1b1d" />
      </linearGradient>
      <linearGradient id="labApron" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b2224" />
        <stop offset="1" stopColor="#1c0f11" />
      </linearGradient>
      <linearGradient id="labSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e9f2f8" />
        <stop offset="1" stopColor="#a9c3d6" />
      </linearGradient>
      <linearGradient id="labWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7d5548" />
        <stop offset="1" stopColor="#4d3029" />
      </linearGradient>
      <linearGradient id="labPaper" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fffaf0" />
        <stop offset=".6" stopColor="#f6ead8" />
        <stop offset="1" stopColor="#ead9bf" />
      </linearGradient>
      <linearGradient id="labLiq" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8fb2cb" />
        <stop offset=".3" stopColor="#f4fbff" />
        <stop offset=".55" stopColor="#b9d3e5" />
        <stop offset="1" stopColor="#6f97b4" />
      </linearGradient>
      <linearGradient id="labPool" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset=".5" stopColor="#b9d3e5" />
        <stop offset="1" stopColor="#6f97b4" />
      </linearGradient>
      <linearGradient id="labStream" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8fb2cb" />
        <stop offset=".4" stopColor="#ffffff" />
        <stop offset="1" stopColor="#7ea3bf" />
      </linearGradient>
      {METALS.map((m, i) => (
        <linearGradient key={i} id={`labM${i}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.top} />
          <stop offset="1" stopColor={m.bottom} />
        </linearGradient>
      ))}
      <radialGradient id="labHalo">
        <stop offset="0" stopColor="#ffe3a6" stopOpacity=".9" />
        <stop offset=".6" stopColor="#d9b77a" stopOpacity=".28" />
        <stop offset="1" stopColor="#d9b77a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="labHeat">
        <stop offset="0" stopColor="#ffb25a" stopOpacity=".95" />
        <stop offset=".55" stopColor="#ff7a2e" stopOpacity=".34" />
        <stop offset="1" stopColor="#ff7a2e" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="labLamp" cx=".5" cy="0" r="1">
        <stop offset="0" stopColor="#fff1cf" stopOpacity=".55" />
        <stop offset=".5" stopColor="#ffe3a6" stopOpacity=".12" />
        <stop offset="1" stopColor="#ffe3a6" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="labVig" cx=".5" cy=".5" r=".75">
        <stop offset=".55" stopColor="#14080b" stopOpacity="0" />
        <stop offset="1" stopColor="#14080b" stopOpacity=".55" />
      </radialGradient>
      <linearGradient id="labGlassSheen" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity=".22" />
        <stop offset=".35" stopColor="#fff" stopOpacity=".02" />
        <stop offset="1" stopColor="#fff" stopOpacity=".12" />
      </linearGradient>
      <filter id="labBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id="labBlurS" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
      <filter id="labSmoke" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <filter id="labRough" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <clipPath id="labFlaskClip">
        <path d={FLASK_BODY} />
      </clipPath>
    </defs>
  )
}

const TUBES = [
  ['#e0829a', 0.55],
  ['#7cc0b0', 0.7],
  ['#d9b77a', 0.45],
  ['#8fa9e0', 0.6],
  ['#e0829a', 0.35],
] as const

/** Wall, window, shelves, glassware, microscope, hanging lamp and the bench itself. */
export function LabBackdrop() {
  return (
    <g aria-hidden="true">
      <rect width={LAB_W} height="240" fill="url(#labWall)" />
      <g stroke="#fff" strokeOpacity=".045" strokeWidth="1">
        {[34, 68, 102, 136, 170, 204].map((y) => <line key={y} x1="0" x2={LAB_W} y1={y} y2={y} />)}
        {[50, 100, 150, 200, 250, 300, 350].map((x) => <line key={x} y1="0" y2="240" x1={x} x2={x} />)}
      </g>

      {/* window */}
      <g transform="translate(18 20)">
        <rect x="-6" y="-6" width="112" height="124" rx="5" fill="#2a1519" />
        <rect width="100" height="112" fill="url(#labSky)" />
        <path d="M0 112 L18 70 L34 88 L54 56 L78 84 L100 62 L100 112Z" fill="#8aa3b6" opacity=".55" />
        <path d="M50 0V112M0 56H100" stroke="#2a1519" strokeWidth="4" />
        <rect x="-10" y="114" width="120" height="8" rx="2" fill="url(#labWood)" />
      </g>

      {/* hanging lamp */}
      <line x1="236" y1="0" x2="236" y2="26" stroke="#1d0e11" strokeWidth="2" />
      <path d="M214 50 Q216 26 236 26 Q256 26 258 50Z" fill="#6b3f45" />
      <path d="M214 50 H258" stroke="#d9b77a" strokeWidth="2" />
      <ellipse cx="236" cy="52" rx="11" ry="5" fill="#fff1cf" />
      <ellipse className="lab-bulb" cx="236" cy="54" rx="32" ry="14" fill="url(#labHalo)" />

      {/* shelf 1 */}
      <g>
        <rect x="136" y="100" width="256" height="7" rx="2" fill="url(#labWood)" />
        <rect x="136" y="107" width="256" height="4" fill="#000" opacity=".25" />
        {/* apothecary bottle */}
        <rect x="150" y="68" width="18" height="32" rx="5" fill="#8a5a2a" />
        <rect x="155" y="58" width="8" height="12" rx="2" fill="#8a5a2a" />
        <rect x="154" y="55" width="10" height="5" rx="2" fill="#d9b77a" />
        <rect x="153" y="76" width="12" height="14" rx="2" fill="#f7eee6" opacity=".8" />
        <rect x="152" y="70" width="3" height="26" rx="1.5" fill="#fff" opacity=".22" />
        {/* round flask */}
        <circle cx="198" cy="84" r="15" fill="#7cc0b0" opacity=".55" />
        <circle cx="198" cy="84" r="15" fill="none" stroke="#fff" strokeOpacity=".4" />
        <rect x="194" y="58" width="8" height="12" rx="1" fill="#fff" opacity=".16" stroke="#fff" strokeOpacity=".4" />
        <path d="M185 82 Q198 90 211 82" stroke="#fff" strokeOpacity=".5" fill="none" />
        {/* beaker with bubbles */}
        <path d="M236 72 H264 L262 100 H238Z" fill="#8fa9e0" opacity=".42" />
        <path d="M236 72 H264 L262 100 H238Z" fill="none" stroke="#fff" strokeOpacity=".45" />
        <path d="M239 80 H261 M240 90 H260" stroke="#fff" strokeOpacity=".4" />
        {[[244, 0], [250, 1.1], [256, 2.2]].map(([x, d]) => (
          <circle key={x} className="lab-bub" cx={x} cy="98" r="2" fill="#fff" opacity=".7" style={{ animationDelay: `${-d}s` }} />
        ))}
        {/* jars */}
        {[[286, '#d9b77a'], [314, '#e0829a']].map(([x, c]) => (
          <g key={x} transform={`translate(${x} 100)`}>
            <rect x="-9" y="-26" width="18" height="26" rx="3" fill={c as string} opacity=".8" />
            <rect x="-10" y="-31" width="20" height="6" rx="2" fill="#f7eee6" />
            <rect x="-6" y="-18" width="12" height="9" rx="1" fill="#f7eee6" opacity=".85" />
          </g>
        ))}
        {/* books */}
        <rect x="346" y="84" width="40" height="8" rx="1.5" fill="#a85c61" />
        <rect x="350" y="92" width="36" height="8" rx="1.5" fill="#d9b77a" />
        <rect x="352" y="76" width="30" height="8" rx="1.5" fill="#dcc0b8" />
      </g>

      {/* shelf 2 */}
      <g>
        <rect x="136" y="176" width="256" height="7" rx="2" fill="url(#labWood)" />
        <rect x="136" y="183" width="256" height="4" fill="#000" opacity=".25" />
        {[[160, '#e0829a'], [194, '#d9b77a']].map(([x, c]) => (
          <g key={x} transform={`translate(${x} 176)`}>
            <path d="M-4 -34 V-22 L-17 0 H17 L4 -22 V-34Z" fill="#fff" opacity=".12" stroke="#fff" strokeOpacity=".45" />
            <path d="M-12 -8 L-8 -12 H8 L12 -8 L17 0 H-17Z" fill={c as string} opacity=".6" />
          </g>
        ))}
        {/* test tube rack */}
        <g transform="translate(226 176)">
          <rect x="0" y="-8" width="64" height="8" rx="2" fill="url(#labWood)" />
          {TUBES.map(([c, h], i) => (
            <g key={i} transform={`translate(${6 + i * 12} 0)`}>
              <rect x="-4" y="-40" width="8" height="40" rx="4" fill="#fff" opacity=".1" stroke="#fff" strokeOpacity=".4" />
              <rect x="-3" y={-3 - 30 * h} width="6" height={3 + 30 * h} rx="3" fill={c} opacity=".75" />
            </g>
          ))}
        </g>
        <rect x="316" y="152" width="22" height="24" rx="3" fill="#8e766b" opacity=".85" />
        <rect x="314" y="147" width="26" height="6" rx="2" fill="#f7eee6" />
        <rect x="352" y="150" width="30" height="26" rx="3" fill="#4d2028" stroke="#d9b77a" strokeOpacity=".5" />
        <text x="367" y="168" textAnchor="middle" fontSize="11" fill="#d9b77a" fontFamily="Inter, sans-serif">Ga</text>
      </g>

      {/* microscope */}
      <g transform="translate(46 238)">
        <rect x="-30" y="-8" width="56" height="9" rx="3" fill="#2d2227" />
        <rect x="-26" y="-9" width="48" height="2" fill="#fff" opacity=".18" />
        <path d="M14 -8 Q34 -34 14 -64 L6 -60 Q20 -36 4 -12Z" fill="#3e2e34" />
        <rect x="-14" y="-24" width="30" height="4" rx="1" fill="#cfd3d8" />
        <g transform="rotate(-18 -2 -62)">
          <rect x="-9" y="-92" width="14" height="52" rx="3" fill="#d9d2cc" />
          <rect x="-7" y="-100" width="10" height="10" rx="2" fill="#2d2227" />
          <rect x="-8" y="-44" width="12" height="6" rx="2" fill="#2d2227" />
        </g>
        <circle cx="10" cy="-34" r="5" fill="#d9b77a" />
      </g>

      {/* bench */}
      <rect y="236" width={LAB_W} height="268" fill="url(#labBench)" />
      <rect y="236" width={LAB_W} height="3" fill="#a87c6e" opacity=".5" />
      <g stroke="#000" strokeOpacity=".12" fill="none">
        <path d="M0 270 Q120 262 400 274" />
        <path d="M0 330 Q200 322 400 336" />
        <path d="M0 448 Q160 440 400 452" />
      </g>
      <ellipse cx="236" cy="372" rx="200" ry="90" fill="url(#labLamp)" />
      <rect y="500" width={LAB_W} height="40" fill="url(#labApron)" />
      <rect y="500" width={LAB_W} height="3" fill="#d9b77a" opacity=".4" />
    </g>
  )
}

const CHUNKS = [
  'M-27 0 L-23 -14 L-10 -19 L-3 -7 L-5 0Z',
  'M-7 0 L-4 -21 L9 -26 L17 -11 L15 0Z',
  'M13 0 L17 -13 L27 -12 L29 0Z',
  'M-20 -13 L-13 -25 L-2 -23 L-8 -10Z',
]
const FACETS = [
  'M-23 -14 L-10 -19 L-14 -8Z',
  'M-4 -21 L9 -26 L4 -12Z',
  'M17 -13 L27 -12 L21 -6Z',
  'M-13 -25 L-2 -23 L-9 -17Z',
]

/** Rough sample of one metal, drawn around the flask base (0,0). */
export function MetalSolid({ i }: { i: number }) {
  return (
    <g>
      {CHUNKS.map((d, k) => (
        <path key={k} d={d} fill={`url(#labM${i})`} stroke="#000" strokeOpacity=".25" strokeWidth=".8" strokeLinejoin="round" />
      ))}
      {FACETS.map((d, k) => (
        <path key={k} d={d} fill="#fff" opacity={i === 3 ? 0.55 : i === 0 ? 0.28 : i === 1 ? 0.32 : 0.2} />
      ))}
      {i === 1 && <path d="M-10 -8 L2 -12" stroke="#ffd2a1" strokeOpacity=".6" strokeWidth="1.4" strokeLinecap="round" />}
    </g>
  )
}
