import type { CSSProperties } from 'react'

const delay = (s: number): CSSProperties => ({ animationDelay: `${-s}s` })

export function FieldDefs() {
  return (
    <defs>
      <linearGradient id="fdSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#78c3ea" />
        <stop offset=".55" stopColor="#c7e7f2" />
        <stop offset="1" stopColor="#fdebc8" />
      </linearGradient>
      <radialGradient id="fdSun" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fffbe0" stopOpacity="1" />
        <stop offset=".25" stopColor="#fff2b4" stopOpacity=".85" />
        <stop offset="1" stopColor="#ffe9a0" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="fdHillA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a8d3c4" />
        <stop offset="1" stopColor="#c6e2c0" />
      </linearGradient>
      <linearGradient id="fdHillB" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#86c486" />
        <stop offset="1" stopColor="#a5d38a" />
      </linearGradient>
      <linearGradient id="fdMeadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a9da72" />
        <stop offset=".45" stopColor="#7cbc4f" />
        <stop offset="1" stopColor="#5a9d41" />
      </linearGradient>
      <linearGradient id="fdWood" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#dba76d" />
        <stop offset=".5" stopColor="#bc844a" />
        <stop offset="1" stopColor="#9a6a39" />
      </linearGradient>
      <radialGradient id="fdSpot" gradientUnits="userSpaceOnUse" cx="150" cy="190" r="210">
        <stop offset="0" stopColor="#0c1a08" stopOpacity="0" />
        <stop offset=".42" stopColor="#0c1a08" stopOpacity=".22" />
        <stop offset="1" stopColor="#0c1a08" stopOpacity=".62" />
      </radialGradient>
      <radialGradient id="fdHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#fff4c0" stopOpacity=".95" />
        <stop offset=".45" stopColor="#ffe08a" stopOpacity=".5" />
        <stop offset="1" stopColor="#ffd070" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="fdRay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3b8" stopOpacity=".32" />
        <stop offset=".7" stopColor="#fff3b8" stopOpacity=".08" />
        <stop offset="1" stopColor="#fff3b8" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="fdWarm" x1="1" y1="0" x2="0" y2=".8">
        <stop offset="0" stopColor="#ffe9a8" stopOpacity=".32" />
        <stop offset=".6" stopColor="#ffe9a8" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="fdVig" cx="50%" cy="48%" r="75%">
        <stop offset=".62" stopColor="#1c2a10" stopOpacity="0" />
        <stop offset="1" stopColor="#1c2a10" stopOpacity=".3" />
      </radialGradient>
      <linearGradient id="hsBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d0894f" />
        <stop offset=".55" stopColor="#b86b38" />
        <stop offset="1" stopColor="#8f4f27" />
      </linearGradient>
      <linearGradient id="hsFar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8f5129" />
        <stop offset="1" stopColor="#6f3d1e" />
      </linearGradient>
      <linearGradient id="dgBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ecbf7c" />
        <stop offset="1" stopColor="#c98e48" />
      </linearGradient>
      <linearGradient id="ctBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f2a65c" />
        <stop offset="1" stopColor="#d9803a" />
      </linearGradient>
      <linearGradient id="rbBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fbf6ee" />
        <stop offset="1" stopColor="#d9d0c4" />
      </linearGradient>
    </defs>
  )
}

function Cloud({ x, y, s, dur, from }: { x: number; y: number; s: number; dur: number; from: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="fd-cloud" style={{ animationDuration: `${dur}s`, '--from': `${(-80 - x) / s}px`, '--to': `${(480 - x) / s}px`, ...delay(from) } as CSSProperties}>
        <ellipse cx="0" cy="8" rx="46" ry="12" fill="#fff" opacity=".95" />
        <circle cx="-16" cy="0" r="16" fill="#fff" />
        <circle cx="6" cy="-6" r="20" fill="#fff" />
        <circle cx="26" cy="2" r="14" fill="#fff" />
        <ellipse cx="2" cy="12" rx="44" ry="7" fill="#dbe9f3" opacity=".7" />
      </g>
    </g>
  )
}

function Tree({ x, y, s, tone = 0 }: { x: number; y: number; s: number; tone?: number }) {
  const dark = ['#3f8742', '#4a9448'][tone]
  const light = ['#5dab55', '#6cba5d'][tone]
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-4" y="-34" width="8" height="36" rx="3" fill="#7a5233" />
      <circle cx="0" cy="-52" r="26" fill={dark} />
      <circle cx="-17" cy="-40" r="19" fill={dark} />
      <circle cx="17" cy="-42" r="20" fill={dark} />
      <circle cx="-6" cy="-60" r="18" fill={light} />
      <circle cx="12" cy="-52" r="14" fill={light} />
      <circle cx="-14" cy="-48" r="9" fill="#7cc96c" opacity=".55" />
    </g>
  )
}

function Flower({ x, y, s = 1, kind, d }: { x: number; y: number; s?: number; kind: 'daisy' | 'poppy' | 'butter' | 'blue'; d: number }) {
  const petals =
    kind === 'daisy'
      ? { c: '#fffdf6', mid: '#f4c542', n: 8 }
      : kind === 'poppy'
        ? { c: '#e04b3e', mid: '#2e1a14', n: 5 }
        : kind === 'butter'
          ? { c: '#f7d24a', mid: '#e29a1c', n: 5 }
          : { c: '#6d8fe0', mid: '#2e3e8c', n: 6 }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="fd-flower" style={delay(d)}>
        <path d="M0 0 C1 -6 -1 -10 0 -16" stroke="#4d9a3a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M0 -6 q-5 -2 -7 -6 q5 0 7 6z" fill="#5eae45" />
        <g transform="translate(0 -17)">
          {Array.from({ length: petals.n }, (_, i) => (
            <ellipse key={i} cx="0" cy="-3.6" rx={kind === 'poppy' ? 3.6 : 1.7} ry={kind === 'poppy' ? 4 : 3.8} fill={petals.c} transform={`rotate(${(360 / petals.n) * i})`} />
          ))}
          <circle r={kind === 'poppy' ? 1.8 : 2.2} fill={petals.mid} />
        </g>
      </g>
    </g>
  )
}

function Tuft({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="fd-tuft">
      <path d="M-6 0 C-6 -8 -9 -12 -11 -15 C-6 -12 -3 -8 -2 0Z" fill="#4f9b3a" />
      <path d="M-2 0 C-2 -10 0 -16 1 -20 C3 -15 3 -8 2 0Z" fill="#5db044" />
      <path d="M2 0 C3 -8 6 -12 10 -14 C7 -9 7 -4 6 0Z" fill="#4f9b3a" />
    </g>
  )
}

export function FieldBack() {
  return (
    <g>
      <rect width="400" height="210" fill="url(#fdSky)" />
      <circle className="fd-sun" cx="332" cy="54" r="74" fill="url(#fdSun)" />
      <circle cx="332" cy="54" r="22" fill="#fffbe6" />
      <Cloud x={80} y={52} s={1} dur={90} from={20} />
      <Cloud x={230} y={30} s={0.7} dur={120} from={70} />
      <Cloud x={340} y={98} s={0.55} dur={110} from={5} />
      <g className="fd-bird" style={delay(0)} fill="none" stroke="#4a5a63" strokeWidth="1.4" strokeLinecap="round">
        <path d="M120 74 q4 -5 8 0 q4 -5 8 0" />
        <path d="M142 66 q3 -4 6 0 q3 -4 6 0" />
      </g>
      <path d="M0 150 C50 124 96 120 150 136 C210 152 250 118 310 122 C350 124 380 136 400 130 V210 H0Z" fill="url(#fdHillA)" />
      <path d="M0 168 C60 142 120 150 176 158 C240 166 300 138 400 156 V210 H0Z" fill="url(#fdHillB)" />
      {/* distant trees and barn */}
      <g opacity=".9">
        {[[30, 158, 0.42], [52, 160, 0.5], [78, 156, 0.36], [292, 150, 0.4], [318, 152, 0.5], [346, 148, 0.36], [372, 154, 0.46], [118, 162, 0.34], [250, 160, 0.34]].map(([x, y, s], i) => (
          <Tree key={i} x={x} y={y} s={s} tone={i % 2} />
        ))}
      </g>
      <g transform="translate(206 160)">
        <rect x="-16" y="-17" width="32" height="17" fill="#b8473c" />
        <path d="M-19 -17 L0 -32 L19 -17Z" fill="#7d2f2a" />
        <rect x="-5" y="-11" width="10" height="11" fill="#f3e3c8" />
        <path d="M-5 -11 L5 0 M5 -11 L-5 0" stroke="#b8473c" strokeWidth="1" />
        <rect x="-13" y="-27" width="6" height="8" fill="#9b958d" />
      </g>
      <Tree x={44} y={176} s={0.95} />
      <Tree x={372} y={180} s={0.7} tone={1} />
      <rect y="170" width="400" height="170" fill="url(#fdMeadow)" />
      <path d="M0 190 C80 180 160 186 240 182 C320 178 360 184 400 180 V196 H0Z" fill="#c0e68a" opacity=".22" />
      <ellipse cx="120" cy="300" rx="170" ry="22" fill="#fff" opacity=".07" />
      {/* fence */}
      <g>
        <ellipse cx="200" cy="198" rx="230" ry="5" fill="#2f5a1c" opacity=".22" />
        {[...Array(11)].map((_, i) => (
          <g key={i} transform={`translate(${i * 40 - 4} 0)`}>
            <rect x="-4" y="164" width="9" height="34" rx="3" fill="url(#fdWood)" />
            <path d="M-4 167 q4.5 -6 9 0z" fill="#e8bd88" />
          </g>
        ))}
        <rect x="-4" y="171" width="408" height="5.5" rx="2" fill="url(#fdWood)" />
        <rect x="-4" y="184" width="408" height="5.5" rx="2" fill="url(#fdWood)" />
        <rect x="-4" y="171" width="408" height="1.4" fill="#f1cf9c" opacity=".7" />
        <rect x="-4" y="184" width="408" height="1.4" fill="#f1cf9c" opacity=".7" />
      </g>
      {/* meadow details */}
      {[[20, 224, 1.2], [96, 216, 0.9], [188, 226, 1], [352, 232, 1.1], [270, 214, 0.8], [388, 218, 0.9], [60, 332, 1.5], [300, 330, 1.6], [200, 326, 1.4]].map(([x, y, s], i) => (
        <Tuft key={i} x={x} y={y} s={s} />
      ))}
      {[[30, 238, 'daisy', 1], [86, 232, 'butter', 0.9], [176, 240, 'blue', 0.9], [212, 218, 'daisy', 0.8], [302, 240, 'poppy', 1], [384, 250, 'daisy', 1], [120, 222, 'poppy', 0.8], [340, 218, 'butter', 0.8]].map(([x, y, k, s], i) => (
        <Flower key={i} x={x as number} y={y as number} s={s as number} kind={k as 'daisy'} d={i * 0.7} />
      ))}
    </g>
  )
}

export function FieldFront() {
  return (
    <g pointerEvents="none">
      {[[14, 322, 'poppy', 1.5], [40, 334, 'daisy', 1.6], [112, 328, 'blue', 1.4], [158, 330, 'butter', 1.5], [230, 332, 'daisy', 1.7], [270, 326, 'poppy', 1.4], [390, 326, 'blue', 1.5], [330, 336, 'daisy', 1.6]].map(([x, y, k, s], i) => (
        <Flower key={i} x={x as number} y={y as number} s={s as number} kind={k as 'daisy'} d={i * 0.9 + 0.4} />
      ))}
      <g className="fd-fly" style={delay(0)}>
        <g transform="translate(0 0)">
          <g className="fd-wing" fill="#f5a3b8" stroke="#c9657f" strokeWidth=".6">
            <path d="M0 0 C-5 -7 -10 -5 -9 0 C-8 4 -3 3 0 0Z" />
            <path d="M0 0 C5 -7 10 -5 9 0 C8 4 3 3 0 0Z" />
          </g>
          <rect x="-.7" y="-3" width="1.4" height="7" rx=".7" fill="#4a2a24" />
        </g>
      </g>
    </g>
  )
}

export function Bush() {
  return (
    <g className="bush" transform="translate(358 316)" pointerEvents="none">
      <ellipse cx="0" cy="2" rx="44" ry="7" fill="#1d3a10" opacity=".3" />
      <g transform="translate(4 -40)">
        <g className="bush__ears">
          <ellipse cx="-4" cy="-8" rx="3.4" ry="11" fill="#e9e2d8" transform="rotate(-8)" />
          <ellipse cx="-4" cy="-8" rx="1.6" ry="8" fill="#e6a9b0" transform="rotate(-8)" />
          <ellipse cx="5" cy="-8" rx="3.4" ry="11" fill="#e9e2d8" transform="rotate(10)" />
          <ellipse cx="5" cy="-8" rx="1.6" ry="8" fill="#e6a9b0" transform="rotate(10)" />
        </g>
      </g>
      <g className="bush__leaves">
        <circle cx="-22" cy="-14" r="20" fill="#3b8340" />
        <circle cx="18" cy="-16" r="22" fill="#3b8340" />
        <circle cx="-2" cy="-26" r="22" fill="#468f45" />
        <circle cx="-30" cy="-6" r="13" fill="#468f45" />
        <circle cx="30" cy="-6" r="14" fill="#468f45" />
        <circle cx="-8" cy="-32" r="12" fill="#5bab52" />
        <circle cx="14" cy="-24" r="10" fill="#5bab52" />
        <circle cx="-22" cy="-20" r="8" fill="#6ec063" opacity=".7" />
        {[[-16, -10], [8, -6], [22, -20], [-2, -22], [-28, -2]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.2" fill="#d6455b" />
        ))}
      </g>
    </g>
  )
}

/** Chestnut horse, facing right. Origin: ground, centre of the body. */
export function Horse() {
  const leg = (x: number, fill: string, sock?: boolean) => (
    <>
      <path d={`M${x - 10} -72 C${x - 9} -50 ${x - 6} -34 ${x - 5} -22 L${x - 4.6} -9 L${x + 4.6} -9 L${x + 5} -22 C${x + 6} -34 ${x + 9} -50 ${x + 10} -72Z`} fill={fill} />
      {sock && <path d={`M${x - 5} -22 L${x - 4.6} -9 L${x + 4.6} -9 L${x + 5} -22 C${x + 2} -24 ${x - 2} -24 ${x - 5} -22Z`} fill="#f6ecdc" />}
      <path d={`M${x - 5.6} -10 h11.2 l1.4 10 h-14z`} fill="#2a1d14" />
    </>
  )
  return (
    <g className="hs">
      <ellipse className="an-shadow" cx="4" cy="2" rx="80" ry="8" />
      <g className="hs__sway">
        <g transform="translate(0 -10)">
          <g className="hs__tail">
          <g className="hs__tail-i" transform="translate(-56 -90)">
            <path d="M0 0 C-14 4 -24 22 -22 46 C-21 62 -16 72 -12 80 C-8 64 -6 50 -3 38 C0 24 4 10 0 0Z" fill="#4a2a18" />
            <path d="M-6 6 C-14 22 -14 44 -12 66 M-2 8 C-8 26 -8 48 -8 70" stroke="#6b4129" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </g>
        </g>
        </g>
        <g>
          {leg(-28, 'url(#hsFar)')}
          {leg(30, 'url(#hsFar)')}
        </g>
        <g className="hs__hind">{leg(-46, 'url(#hsBody)', true)}</g>
        <g className="hs__stamp">{leg(44, 'url(#hsBody)', true)}</g>
        <g transform="translate(0 -10)">
        <g className="hs__body">
          <path d="M-60 -84 C-60 -100 -42 -108 -16 -106 C6 -105 22 -108 38 -110 C52 -110 56 -96 54 -80 C52 -64 46 -54 28 -52 C8 -50 -14 -50 -32 -52 C-52 -54 -60 -68 -60 -84Z" fill="url(#hsBody)" />
          <path d="M-52 -96 C-38 -106 -10 -104 14 -105 C28 -106 38 -108 46 -106 C30 -100 6 -98 -16 -97 C-34 -96 -46 -92 -52 -96Z" fill="#e8a56c" opacity=".5" />
          <path d="M-56 -70 C-48 -58 -30 -56 -10 -56 C14 -56 34 -58 50 -70 C46 -56 36 -52 20 -50 C-4 -49 -28 -50 -44 -54 C-52 -58 -56 -64 -56 -70Z" fill="#7a4120" opacity=".35" />
          <ellipse cx="-38" cy="-80" rx="17" ry="20" fill="#c7793f" opacity=".5" />
        </g>
        <g className="hs__head">
          <g className="hs__head-i">
            <path d="M22 -110 C34 -128 46 -144 58 -154 L76 -142 C68 -128 64 -110 56 -88 C50 -78 38 -80 26 -88Z" fill="url(#hsBody)" />
            <path d="M20 -108 C24 -126 38 -146 56 -162 C62 -156 58 -148 52 -142 C56 -138 50 -130 46 -126 C48 -120 42 -114 40 -106 C34 -100 26 -102 20 -108Z" fill="#4a2a18" />
            <path d="M52 -158 C60 -164 72 -162 78 -154 C88 -140 97 -124 97 -115 C97 -108 90 -105 84 -108 C75 -113 67 -124 61 -136 C56 -142 51 -150 52 -158Z" fill="url(#hsBody)" />
            <path d="M68 -152 C74 -148 86 -130 94 -116 C90 -113 85 -113 80 -119 C74 -128 68 -140 66 -148Z" fill="#f8eedd" opacity=".9" />
            <ellipse cx="91" cy="-112" rx="7.5" ry="5.4" fill="#6e4a38" transform="rotate(28 91 -112)" />
            <circle cx="93" cy="-111" r="1.6" fill="#2a1a14" />
            <g className="hs__ear" style={{ transformOrigin: '60px -158px' }}>
              <g className="hs__ear-i" style={{ transformOrigin: '60px -158px' }}>
                <path d="M56 -158 L55 -174 L65 -160Z" fill="#a85f31" />
                <path d="M57 -161 L57 -170 L62 -161Z" fill="#e2a79a" />
              </g>
            </g>
            <path d="M54 -158 C56 -150 62 -148 66 -152 C64 -158 58 -162 54 -158Z" fill="#4a2a18" />
            <ellipse cx="71" cy="-145" rx="3.8" ry="3" fill="#fbf4ea" />
            <circle cx="71.6" cy="-145" r="2.3" fill="#2a1a14" />
            <circle cx="72.2" cy="-145.8" r=".8" fill="#fff" />
            <ellipse className="hs__lid" cx="71" cy="-145" rx="4.4" ry="3.6" fill="#b4693a" style={{ transformOrigin: '71px -148px' }} />
            <path className="hs__lash" d="M66.6 -144.4 q4.4 2.6 8.8 0" fill="none" stroke="#3a2216" strokeWidth="1.1" strokeLinecap="round" />
          </g>
        </g>
        <g className="hs__zzz" aria-hidden="true" fill="#fff" stroke="#6d8aa8" strokeWidth=".6" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontWeight="600">
          <text x="100" y="-150" fontSize="14" style={delay(0)}>z</text>
          <text x="110" y="-162" fontSize="18" style={delay(0.9)}>z</text>
          <text x="122" y="-176" fontSize="22" style={delay(1.8)}>Z</text>
        </g>
        </g>
        <g className="hs__rings" fill="none" stroke="#fff3b8" strokeWidth="2">
          <circle className="hs__ring" cx="46" cy="-36" r="9" />
          <circle className="hs__ring" cx="-46" cy="-34" r="9" style={{ animationDelay: '.2s' }} />
          <circle className="hs__ring" cx="-28" cy="-34" r="9" style={{ animationDelay: '.4s' }} />
          <circle className="hs__ring" cx="30" cy="-36" r="9" style={{ animationDelay: '.6s' }} />
        </g>
      </g>
    </g>
  )
}

/** Golden dog, facing left. */
export function Dog() {
  const leg = (x: number, cls: string, fill: string) => (
    <g className={`dg__leg ${cls}`} style={{ transformOrigin: `${x}px -22px` }}>
      <rect x={x - 4.4} y="-24" width="8.8" height="22" rx="4.4" fill={fill} />
      <ellipse cx={x - 0.6} cy="-1.4" rx="6.4" ry="3.2" fill="#f6e6c8" />
    </g>
  )
  return (
    <g className="dg">
      <ellipse className="an-shadow" cx="-4" cy="2" rx="52" ry="6" />
      <g className="dg__slide">
        <g className="dg__flip">
          <g className="dg__bounce">
            <g className="dg__tail" style={{ transformOrigin: '28px -38px' }}>
              <g className="dg__tail-i" style={{ transformOrigin: '28px -38px' }}>
                <path d="M28 -38 C40 -40 48 -52 46 -66 C45 -72 38 -72 38 -64 C38 -54 32 -48 24 -44Z" fill="url(#dgBody)" />
              </g>
            </g>
            {leg(-12, 'dg__leg--b', '#c18740')}
            {leg(14, 'dg__leg--a', '#c18740')}
            <g className="dg__torso">
              <path d="M32 -36 C32 -50 12 -54 -6 -52 C-24 -52 -36 -48 -38 -34 C-40 -20 -26 -14 -8 -14 C12 -14 32 -20 32 -36Z" fill="url(#dgBody)" />
              <ellipse cx="22" cy="-28" rx="13" ry="14" fill="#e2a95e" opacity=".55" />
              <path d="M-30 -44 C-22 -52 -2 -54 14 -50 C0 -48 -20 -48 -30 -44Z" fill="#f4d69c" opacity=".6" />
              <ellipse cx="-30" cy="-28" rx="10" ry="13" fill="#f3d39c" />
            </g>
            {leg(-26, 'dg__leg--a', '#d49c52')}
            {leg(28, 'dg__leg--b', '#d49c52')}
            <g className="dg__head" style={{ transformOrigin: '-34px -40px' }}>
              <g className="dg__head-i" style={{ transformOrigin: '-34px -40px' }}>
                <path d="M-44 -42 C-42 -38 -36 -36 -30 -34 L-32 -46Z" fill="#c8893f" />
                <path d="M-36 -34 q-4 6 -2 12" stroke="#c4373c" strokeWidth="5.4" fill="none" strokeLinecap="round" />
                <circle cx="-38" cy="-21" r="3.2" fill="#f1c24a" stroke="#c99a22" strokeWidth=".8" />
                <circle cx="-47" cy="-55" r="14" fill="#e6b26a" />
                <ellipse cx="-63" cy="-49" rx="12.5" ry="9" fill="#f3d19c" />
                <circle cx="-74" cy="-51" r="4" fill="#2a1a14" />
                <circle cx="-75" cy="-52.4" r="1.1" fill="#fff" opacity=".8" />
                <path d="M-72 -45 q8 6 16 2" stroke="#7a4a22" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <path className="dg__tongue" d="M-66 -44 q1 9 6 8 q4 -2 3 -9z" fill="#ec7d8a" />
                <circle cx="-53" cy="-58" r="2.7" fill="#2a1a14" />
                <circle cx="-52.2" cy="-59" r=".9" fill="#fff" />
                <path d="M-58 -64 q4 -3 8 -1" stroke="#7a4a22" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                <g className="dg__ear" style={{ transformOrigin: '-44px -66px' }}>
                  <path d="M-46 -66 C-36 -72 -26 -62 -29 -46 C-31 -38 -39 -38 -43 -47Z" fill="#b07338" />
                  <path d="M-42 -62 C-36 -64 -32 -58 -34 -50" stroke="#c98a4a" strokeWidth="2" fill="none" strokeLinecap="round" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  )
}

/** Ginger tabby, facing right. */
export function Cat() {
  const leg = (x: number, cls: string, fill: string, pivot = -18) => (
    <g className={`ct__leg ${cls}`} style={{ transformOrigin: `${x}px ${pivot}px` }}>
      <rect x={x - 3.4} y="-20" width="6.8" height="19" rx="3.4" fill={fill} />
      <ellipse cx={x + 0.8} cy="-1.2" rx="5" ry="2.8" fill="#fbf1e4" />
    </g>
  )
  return (
    <g className="ct">
      <ellipse className="an-shadow" cx="0" cy="2" rx="36" ry="5" />
      <g className="ct__slide">
        <g className="ct__flip">
          <g className="ct__bounce">
            <g className="ct__tail" style={{ transformOrigin: '-26px -30px' }}>
              <g className="ct__tail-i" style={{ transformOrigin: '-26px -30px' }}>
                <path d="M-26 -30 C-46 -32 -54 -52 -42 -66 C-38 -70 -33 -66 -35 -60" stroke="#e08a44" strokeWidth="7.4" fill="none" strokeLinecap="round" />
                <path d="M-26 -30 C-46 -32 -54 -52 -42 -66 C-38 -70 -33 -66 -35 -60" stroke="#a85a22" strokeWidth="7.4" fill="none" strokeDasharray="3.4 6.6" />
              </g>
            </g>
            {leg(-20, 'ct__leg--b', '#d9803a')}
            {leg(14, 'ct__leg--a', '#d9803a')}
            <g className="ct__torso">
              <path d="M-30 -26 C-30 -40 -12 -44 6 -42 C24 -42 32 -36 32 -26 C32 -16 20 -12 4 -12 C-14 -12 -30 -14 -30 -26Z" fill="url(#ctBody)" />
              <path d="M-14 -40 q-3 8 0 16 M-4 -42 q-3 9 0 18 M6 -42 q-2 8 0 17" stroke="#b05f26" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity=".75" />
              <ellipse cx="22" cy="-22" rx="9" ry="10" fill="#fbf1e4" />
            </g>
            {leg(-8, 'ct__leg--a', '#e8964e')}
            <g className="ct__paw" style={{ transformOrigin: '24px -20px' }}>{leg(24, 'ct__leg--b', '#e8964e', -20)}</g>
            <g className="ct__head" style={{ transformOrigin: '28px -34px' }}>
              <g className="ct__head-i" style={{ transformOrigin: '28px -34px' }}>
                <path d="M28 -54 L29 -70 L40 -58Z" fill="#e8964e" />
                <path d="M30 -57 L31 -65 L36 -59Z" fill="#eaa7a4" />
                <path d="M44 -58 L52 -70 L53 -53Z" fill="#e8964e" />
                <path d="M46 -57 L51 -65 L51 -56Z" fill="#eaa7a4" />
                <ellipse cx="40" cy="-45" rx="14" ry="12" fill="#f0a05a" />
                <ellipse cx="40" cy="-39" rx="8" ry="6" fill="#fbf1e4" />
                <path d="M36 -56 q1 4 0 7 M40 -57 q0 4 0 7 M44 -56 q-1 4 0 7" stroke="#b05f26" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <g className="ct__eyes">
                  <ellipse cx="34" cy="-46" rx="3.2" ry="3.5" fill="#9fd27a" />
                  <ellipse cx="46" cy="-46" rx="3.2" ry="3.5" fill="#9fd27a" />
                  <ellipse className="ct__pupil" cx="34" cy="-46" rx="1.2" ry="3" fill="#1d1511" />
                  <ellipse className="ct__pupil" cx="46" cy="-46" rx="1.2" ry="3" fill="#1d1511" />
                  <circle cx="34.8" cy="-47.4" r=".8" fill="#fff" />
                  <circle cx="46.8" cy="-47.4" r=".8" fill="#fff" />
                </g>
                <path d="M38 -41.6 h4 l-2 2.6z" fill="#e58f95" />
                <path d="M40 -39 q-3 3 -5 1 M40 -39 q3 3 5 1" stroke="#7a4a2a" strokeWidth=".9" fill="none" strokeLinecap="round" />
                <path d="M30 -40 l-9 -2 M30 -38 l-9 2 M50 -40 l9 -2 M50 -38 l9 2" stroke="#fff" strokeWidth=".8" opacity=".85" strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  )
}

/** Grey-white rabbit sitting up, facing right. */
export function Rabbit() {
  return (
    <g className="rb">
      <ellipse className="an-shadow" cx="0" cy="2" rx="24" ry="4.4" />
      <g className="rb__slide">
        <g className="rb__hop">
          <circle cx="-19" cy="-10" r="6.4" fill="#fffaf2" />
          <path d="M-18 0 C-24 -14 -16 -30 0 -33 C14 -33 21 -18 19 0Z" fill="url(#rbBody)" />
          <ellipse cx="-8" cy="-9" rx="12.5" ry="9.5" fill="#fff9ef" />
          <ellipse cx="8" cy="-2.4" rx="10" ry="3.6" fill="#f2eadf" />
          <ellipse cx="13" cy="-11" rx="3.6" ry="6" fill="#f2eadf" />
          <g className="rb__head" style={{ transformOrigin: '10px -34px' }}>
            <g className="rb__ears" style={{ transformOrigin: '10px -46px' }}>
              <g className="rb__ear rb__ear--a" style={{ transformOrigin: '8px -48px' }}>
                <ellipse cx="3" cy="-66" rx="5.2" ry="17" fill="#d8cfc2" transform="rotate(-12 8 -48)" />
                <ellipse cx="3" cy="-66" rx="2.4" ry="12.5" fill="#efb2b6" transform="rotate(-12 8 -48)" />
              </g>
              <g className="rb__ear rb__ear--b" style={{ transformOrigin: '14px -48px' }}>
                <ellipse cx="14" cy="-67" rx="5.4" ry="18" fill="#fbf6ee" transform="rotate(8 14 -48)" stroke="#e7ddcf" strokeWidth=".8" />
                <ellipse cx="14" cy="-67" rx="2.6" ry="13" fill="#f5bcc0" transform="rotate(8 14 -48)" />
              </g>
            </g>
            <ellipse cx="13" cy="-40" rx="13" ry="10.5" fill="#fffaf2" />
            <ellipse cx="22" cy="-37" rx="7.5" ry="6" fill="#fff" />
            <circle className="rb__nose" cx="28" cy="-39" r="2.1" fill="#e58f9a" />
            <path d="M28 -37 v2.6 M28 -34.4 q-3 2 -5 .6 M28 -34.4 q3 2 5 .6" stroke="#b88a86" strokeWidth=".8" fill="none" strokeLinecap="round" />
            <circle cx="17" cy="-44" r="2.5" fill="#2a1d1a" />
            <circle cx="17.8" cy="-45" r=".9" fill="#fff" />
            <ellipse cx="15" cy="-35" rx="3.6" ry="2.4" fill="#f9c9cd" opacity=".6" />
            <path d="M26 -37 l12 -3 M26 -36 l12 1 M26 -35 l11 5" stroke="#d6cdc0" strokeWidth=".8" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </g>
  )
}
