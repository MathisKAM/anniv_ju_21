import type { CSSProperties } from 'react'
import type { TrophyId } from '../../content/trophies'

/** Gradients shared by every trophy (rendered once, referenced by id). */
export function TrophyDefs() {
  return (
    <svg width="0" height="0" className="tro-defs" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="tg-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6e4a1c" />
          <stop offset=".22" stopColor="#d9b77a" />
          <stop offset=".42" stopColor="#fff0c4" />
          <stop offset=".64" stopColor="#c8973f" />
          <stop offset="1" stopColor="#6a4518" />
        </linearGradient>
        <linearGradient id="tg-gold-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0c4" />
          <stop offset=".45" stopColor="#d9b77a" />
          <stop offset="1" stopColor="#7d5722" />
        </linearGradient>
        <linearGradient id="tg-rose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe3d3" />
          <stop offset=".5" stopColor="#e2a38f" />
          <stop offset="1" stopColor="#a85c61" />
        </linearGradient>
        <linearGradient id="tg-crystal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".92" />
          <stop offset=".5" stopColor="#cfe2ff" stopOpacity=".38" />
          <stop offset="1" stopColor="#9db8ee" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id="tg-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4b6c4" />
          <stop offset="1" stopColor="#8e3f78" />
        </linearGradient>
        <linearGradient id="tg-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2c4d7c" />
          <stop offset="1" stopColor="#14264a" />
        </linearGradient>
        <radialGradient id="tg-face" cx=".38" cy=".3" r=".85">
          <stop offset="0" stopColor="#fff3cc" />
          <stop offset=".5" stopColor="#e2bd78" />
          <stop offset="1" stopColor="#97692a" />
        </radialGradient>
        <radialGradient id="tg-nose" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#ff9a8f" />
          <stop offset=".6" stopColor="#d6323f" />
          <stop offset="1" stopColor="#7d1522" />
        </radialGradient>
        <radialGradient id="tg-ruby" cx=".35" cy=".25" r=".9">
          <stop offset="0" stopColor="#ffc2cc" />
          <stop offset=".45" stopColor="#d33a56" />
          <stop offset="1" stopColor="#6a1226" />
        </radialGradient>
        <pattern id="tg-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" fill="none" stroke="#9fc4f2" strokeOpacity=".35" strokeWidth=".5" />
        </pattern>
      </defs>
    </svg>
  )
}

const STAR = 'M0 -1 Q0 0 1 0 Q0 0 0 1 Q0 0 -1 0 Q0 0 0 -1Z'

function Glint({ x, y, s = 6, delay = 0 }: { x: number; y: number; s?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="glint" d={STAR} fill="#fff8e1" style={{ animationDelay: `${delay}s` } as CSSProperties} />
    </g>
  )
}

/** A bright band sweeping across a shape: the glint of polished metal. */
function Shine({ id, d, delay = 0 }: { id: string; d: string; delay?: number }) {
  return (
    <g clipPath={`url(#${id})`}>
      <clipPath id={id}><path d={d} /></clipPath>
      <rect className="shine" x="-30" y="-10" width="16" height="170" fill="#fffbe8" opacity=".5" style={{ animationDelay: `${delay}s` } as CSSProperties} />
    </g>
  )
}

const BASE_DARK = '#7d5722'

function Memoire() {
  const bowl = 'M28 18 H92 C92 58 80 80 60 84 C40 80 28 58 28 18 Z'
  const pts: [number, number][] = [[44, 32], [58, 44], [76, 32], [72, 58], [52, 62]]
  return (
    <g>
      <path d="M30 28 C8 26 10 62 40 66" fill="none" stroke="url(#tg-gold)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M90 28 C112 26 110 62 80 66" fill="none" stroke="url(#tg-gold)" strokeWidth="4.5" strokeLinecap="round" />
      <rect x="55" y="82" width="10" height="26" fill="url(#tg-gold)" />
      <ellipse cx="60" cy="96" rx="11" ry="5" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <path d="M36 128 C36 114 48 108 60 108 C72 108 84 114 84 128 Z" fill="url(#tg-gold)" />
      <rect x="30" y="126" width="60" height="9" rx="3" fill="url(#tg-gold-v)" />
      <path d={bowl} fill="url(#tg-crystal)" stroke="url(#tg-gold)" strokeWidth="1.6" />
      <path d="M33 24 C35 52 43 70 54 78" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="#fff3cc" strokeOpacity=".85" strokeWidth=".9" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === 1 ? 2.4 : 1.7} fill="#fff8e1" />)}
      <rect x="25" y="13" width="70" height="9" rx="4.5" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <Shine id="sh-mem" d={bowl} />
      <Glint x={58} y={44} s={7} delay={0.4} />
      <Glint x={36} y={22} s={5} delay={1.6} />
      <Glint x={88} y={18} s={4} delay={2.4} />
    </g>
  )
}

function Science() {
  const flask = 'M50 18 H70 V46 L92 96 Q96 108 84 108 H36 Q24 108 28 96 L50 46 Z'
  return (
    <g>
      <g className="orbits" fill="none" stroke="url(#tg-gold)" strokeWidth="1.3">
        <ellipse cx="60" cy="66" rx="54" ry="15" transform="rotate(-28 60 66)" />
        <ellipse cx="60" cy="66" rx="54" ry="15" transform="rotate(28 60 66)" />
      </g>
      <circle cx="12" cy="86" r="3" fill="url(#tg-gold-v)" />
      <circle cx="108" cy="46" r="3" fill="url(#tg-gold-v)" />
      <path d={flask} fill="url(#tg-crystal)" />
      <clipPath id="cp-sci"><path d={flask} /></clipPath>
      <g clipPath="url(#cp-sci)">
        <path className="wave" d="M-20 74 Q-5 66 10 74 T40 74 T70 74 T100 74 T130 74 V116 H-20 Z" fill="url(#tg-liquid)" opacity=".92" />
        <circle className="bub" cx="52" cy="92" r="3" fill="#fff" opacity=".6" />
        <circle className="bub b2" cx="66" cy="86" r="2" fill="#fff" opacity=".6" />
        <circle className="bub b3" cx="74" cy="98" r="3.4" fill="#fff" opacity=".5" />
      </g>
      <path d={flask} fill="none" stroke="#e9f1ff" strokeOpacity=".85" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M54 24 V46 L34 96" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" />
      <rect x="47" y="12" width="26" height="9" rx="3.5" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <rect x="32" y="108" width="56" height="7" rx="2" fill="url(#tg-gold)" />
      <rect x="24" y="115" width="72" height="12" rx="3" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <Shine id="sh-sci" d={flask} delay={1.2} />
      <Glint x={42} y={86} s={6} delay={0.2} />
      <Glint x={96} y={40} s={5} delay={1.8} />
      <Glint x={14} y={80} s={4} delay={2.8} />
    </g>
  )
}

function Beaute() {
  const outer = [0, 60, 120, 180, 240, 300]
  const mid = [36, 108, 180, 252, 324]
  return (
    <g>
      <g className="rays" stroke="url(#tg-gold)" strokeWidth="1.4" strokeLinecap="round" opacity=".7">
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1="60" y1="8" x2="60" y2={i % 2 ? 14 : 4} transform={`rotate(${i * 22.5} 60 54)`} />
        ))}
      </g>
      <path d="M60 76 C57 92 63 104 60 116" fill="none" stroke="url(#tg-gold)" strokeWidth="5" strokeLinecap="round" />
      <path d="M60 98 C46 88 38 92 33 99 C44 104 54 103 60 98Z" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".5" />
      <path d="M60 92 C74 82 82 86 87 93 C76 98 66 97 60 92Z" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".5" />
      {outer.map((a) => (
        <ellipse key={a} cx="60" cy="34" rx="15" ry="21" transform={`rotate(${a} 60 54)`} fill="url(#tg-rose)" stroke="#8e4c4a" strokeWidth=".7" />
      ))}
      {mid.map((a) => (
        <ellipse key={a} cx="60" cy="41" rx="11" ry="15" transform={`rotate(${a} 60 54)`} fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" opacity=".95" />
      ))}
      <circle cx="60" cy="54" r="9.5" fill="url(#tg-gold)" stroke={BASE_DARK} strokeWidth=".6" />
      <path d="M60 54 m-3.5 0 a3.5 3.5 0 1 1 3.5 3.5 a7 7 0 1 1 -7 -7" fill="none" stroke={BASE_DARK} strokeWidth="1" strokeLinecap="round" />
      <path d="M46 126 C46 118 52 114 60 114 C68 114 74 118 74 126Z" fill="url(#tg-gold)" />
      <rect x="36" y="124" width="48" height="11" rx="3" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <Shine id="sh-bea" d="M30 54 A30 30 0 1 0 90 54 A30 30 0 1 0 30 54Z" delay={0.8} />
      <Glint x={44} y={36} s={7} delay={0.3} />
      <Glint x={80} y={64} s={5} delay={1.7} />
      <Glint x={62} y={10} s={5} delay={2.6} />
    </g>
  )
}

function Humour() {
  return (
    <g>
      <path d="M26 44 C4 38 4 76 30 78" fill="none" stroke="url(#tg-gold)" strokeWidth="5" strokeLinecap="round" />
      <path d="M94 44 C116 38 116 76 90 78" fill="none" stroke="url(#tg-gold)" strokeWidth="5" strokeLinecap="round" />
      <rect x="55" y="84" width="10" height="24" fill="url(#tg-gold)" />
      <path d="M38 128 C38 116 48 110 60 110 C72 110 82 116 82 128Z" fill="url(#tg-gold)" />
      <rect x="30" y="126" width="60" height="9" rx="3" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <circle cx="60" cy="52" r="35" fill="url(#tg-face)" stroke="#8a5f24" strokeWidth="1.4" />
      <circle cx="60" cy="52" r="30" fill="none" stroke="#fff3cc" strokeOpacity=".45" strokeWidth=".8" />
      <ellipse cx="37" cy="60" rx="6" ry="4" fill="#e07a86" opacity=".5" />
      <ellipse cx="83" cy="60" rx="6" ry="4" fill="#e07a86" opacity=".5" />
      <path d="M38 34 Q46 29 54 33" fill="none" stroke="#5a3a16" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M65 29 Q74 22 83 28" fill="none" stroke="#5a3a16" strokeWidth="2.4" strokeLinecap="round" />
      <ellipse cx="46" cy="42" rx="4.8" ry="6.4" fill="#3b1a20" />
      <circle cx="47.6" cy="39.6" r="1.7" fill="#fff" />
      <path className="wink" d="M66 44 Q74 36 82 44" fill="none" stroke="#3b1a20" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 62 Q60 68 84 62 Q80 90 60 90 Q40 90 36 62Z" fill="#3b1a20" />
      <path d="M38 63 Q60 69 82 63 L80 69 Q60 75 40 69Z" fill="#fff8ee" />
      <path d="M50 88 Q60 78 70 88 Q60 94 50 88Z" fill="#e07a86" />
      <circle className="nose" cx="60" cy="54" r="7.5" fill="url(#tg-nose)" />
      <circle cx="57.6" cy="51.4" r="2" fill="#fff" opacity=".85" />
      <Shine id="sh-hum" d="M25 52 A35 35 0 1 0 95 52 A35 35 0 1 0 25 52Z" delay={0.6} />
      <Glint x={38} y={28} s={6} delay={0.5} />
      <Glint x={88} y={72} s={5} delay={2} />
      <circle className="conf" cx="14" cy="22" r="2.2" fill="#e07a86" />
      <circle className="conf c2" cx="108" cy="20" r="2" fill="#8fc9d8" />
      <circle className="conf c3" cx="100" cy="100" r="2" fill="#f5d77a" />
    </g>
  )
}

function Archi() {
  const win = (x: number, w: number, y0: number, y1: number, step: number) => {
    let d = ''
    for (let y = y0; y <= y1; y += step) d += `M${x + 2} ${y}H${x + w - 2}`
    return d
  }
  return (
    <g>
      <rect x="22" y="110" width="76" height="6" rx="2" fill="url(#tg-gold)" />
      <rect x="16" y="116" width="88" height="12" rx="3" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <rect x="26" y="30" width="68" height="80" rx="3" fill="url(#tg-blue)" stroke="url(#tg-gold)" strokeWidth="2" />
      <rect x="26" y="30" width="68" height="80" rx="3" fill="url(#tg-grid)" />
      <path d="M30 110 V96 Q30 84 38 84 Q46 84 46 96 V110Z" fill="url(#tg-gold)" />
      <path d="M38 84 V78" stroke="url(#tg-gold)" strokeWidth="1.6" />
      <rect x="48" y="44" width="18" height="66" fill="url(#tg-gold)" />
      <path d="M57 44 V32" stroke="url(#tg-gold)" strokeWidth="2" strokeLinecap="round" />
      <rect x="68" y="66" width="14" height="44" fill="url(#tg-gold-v)" />
      <rect x="84" y="82" width="8" height="28" fill="url(#tg-gold)" />
      <path d={win(48, 18, 52, 104, 8) + win(68, 14, 74, 104, 8) + win(84, 8, 90, 104, 8)} stroke="#1c3258" strokeOpacity=".6" strokeWidth="2.4" fill="none" />
      <path d="M74 6 L62 46 M74 6 L90 40" stroke="url(#tg-gold)" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="74" cy="6" r="3.4" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <path d="M90 40 L91 45" stroke="#e9f1ff" strokeWidth="1.2" strokeLinecap="round" />
      <path fillRule="evenodd" d="M12 112 V68 L46 112 Z M19 103 V85 L33 103 Z" fill="url(#tg-crystal)" stroke="url(#tg-gold)" strokeWidth="2" strokeLinejoin="round" />
      <Shine id="sh-arc" d="M48 44 H66 V110 H48Z M68 66 H82 V110 H68Z" delay={1} />
      <Glint x={57} y={36} s={6} delay={0.3} />
      <Glint x={20} y={80} s={5} delay={1.9} />
      <Glint x={90} y={62} s={4} delay={2.7} />
    </g>
  )
}

function Copine() {
  const bowl = 'M24 22 H96 C96 66 82 88 60 92 C38 88 24 66 24 22 Z'
  const heart = 'M60 70 C30 52 36 28 51 32 C57 33 60 39 60 43 C60 39 63 33 69 32 C84 28 90 52 60 70Z'
  return (
    <g>
      <g className="rays" stroke="url(#tg-gold)" strokeWidth="1.2" strokeLinecap="round" opacity=".6">
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1="60" y1={i % 2 ? 0 : -6} x2="60" y2={i % 2 ? 8 : 6} transform={`rotate(${i * 15} 60 52)`} />
        ))}
      </g>
      <path d="M28 32 C0 26 0 76 38 78" fill="none" stroke="url(#tg-gold)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M92 32 C120 26 120 76 82 78" fill="none" stroke="url(#tg-gold)" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M28 32 C4 28 4 70 36 74" fill="none" stroke="#fff3cc" strokeOpacity=".55" strokeWidth="1" strokeLinecap="round" />
      <rect x="55" y="88" width="10" height="9" fill="url(#tg-gold)" />
      <circle cx="60" cy="102" r="9.5" fill="url(#tg-crystal)" stroke="url(#tg-gold)" strokeWidth="2" />
      <circle cx="56.5" cy="98.5" r="2.4" fill="#fff" opacity=".8" />
      <rect x="56" y="111" width="8" height="8" fill="url(#tg-gold)" />
      <path d="M40 138 C40 125 50 118 60 118 C70 118 80 125 80 138Z" fill="url(#tg-gold)" />
      <rect x="30" y="136" width="60" height="7" rx="2.5" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".6" />
      <rect x="22" y="143" width="76" height="8" rx="3" fill="url(#tg-gold)" stroke={BASE_DARK} strokeWidth=".6" />
      <path d={bowl} fill="url(#tg-gold)" stroke="#8a5f24" strokeWidth="1.2" />
      <path d="M31 28 C33 56 41 74 53 84" fill="none" stroke="#fffbe8" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M89 30 C88 52 82 68 72 78" fill="none" stroke="#7d5722" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      <path d={heart} fill="url(#tg-ruby)" stroke="url(#tg-gold-v)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M45 40 C48 36 53 36 56 40" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
      <rect x="19" y="15" width="82" height="10" rx="5" fill="url(#tg-gold-v)" stroke={BASE_DARK} strokeWidth=".7" />
      {[30, 42, 54, 66, 78, 90].map((x, i) => (
        <circle key={x} cx={x} cy="20" r="2.1" fill={i % 2 ? 'url(#tg-ruby)' : '#eaf3ff'} stroke={BASE_DARK} strokeWidth=".4" />
      ))}
      <path d="M60 -4 L63 4 L71 5 L65 10 L67 18 L60 14 L53 18 L55 10 L49 5 L57 4Z" fill="url(#tg-gold-v)" stroke="#8a5f24" strokeWidth=".8" strokeLinejoin="round" transform="translate(0 3)" />
      <Shine id="sh-cop" d={bowl} delay={0.5} />
      <Glint x={44} y={30} s={8} delay={0.2} />
      <Glint x={92} y={50} s={6} delay={1.4} />
      <Glint x={60} y={0} s={6} delay={2.2} />
      <Glint x={20} y={20} s={5} delay={3} />
    </g>
  )
}

const ART: Record<TrophyId, () => JSX.Element> = {
  memoire: Memoire,
  science: Science,
  beaute: Beaute,
  humour: Humour,
  archi: Archi,
  copine: Copine,
}

export function TrophyArt({ id }: { id: TrophyId }) {
  const Art = ART[id]
  const ultimate = id === 'copine'
  return (
    <svg className="tro__svg" viewBox={ultimate ? '-4 -10 128 168' : '0 0 120 140'} aria-hidden="true" focusable="false">
      <Art />
    </svg>
  )
}
