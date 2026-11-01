import { memo, useRef, type ReactNode } from 'react'

export const PLANETS = [
  { name: 'Mercure', r: 21, spin: 90 },
  { name: 'Vénus', r: 29, spin: 120 },
  { name: 'Terre', r: 30, spin: 46 },
  { name: 'Mars', r: 24, spin: 60 },
  { name: 'Jupiter', r: 41, spin: 24 },
  { name: 'Saturne', r: 27, spin: 28 },
  { name: 'Uranus', r: 32, spin: 40 },
  { name: 'Neptune', r: 31, spin: 36 },
] as const

/** One 200-unit wide strip of texture per planet; it is repeated twice and slides to fake the rotation. */
function tile(k: number): ReactNode {
  switch (k) {
    case 0: // Mercure: grey rock, craters
      return (
        <>
          <rect x="-20" y="0" width="240" height="100" fill="#9b938b" />
          <rect x="-20" y="20" width="240" height="26" fill="#b0a89f" opacity=".5" />
          {[[20, 45, 7], [55, 62, 5], [90, 40, 8], [130, 56, 6], [165, 36, 5], [40, 30, 4], [110, 72, 4], [182, 62, 7], [70, 28, 3], [146, 30, 3]].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#6f6860" opacity=".55" />
              <path d={`M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y}`} stroke="#d8d0c6" strokeWidth="1" fill="none" opacity=".55" transform={`rotate(-30 ${x} ${y})`} />
            </g>
          ))}
        </>
      )
    case 1: // Vénus: pale yellow, thick clouds
      return (
        <>
          <rect x="-20" y="0" width="240" height="100" fill="#e3c98f" />
          {[28, 40, 52, 64, 74].map((y, i) => (
            <path key={i} d={`M0 ${y} q25 ${i % 2 ? -9 : 9} 50 0 t50 0 t50 0 t50 0`} stroke={i % 2 ? '#fff1c7' : '#b98e4f'} strokeWidth={7 - i} fill="none" opacity={0.5} strokeLinecap="round" />
          ))}
          <ellipse cx="60" cy="48" rx="26" ry="7" fill="#fff4d2" opacity=".35" />
          <ellipse cx="150" cy="60" rx="22" ry="6" fill="#a87b3e" opacity=".3" />
        </>
      )
    case 2: // Terre: ocean, continents
      return (
        <>
          <rect x="-20" y="0" width="240" height="100" fill="#2863b6" />
          <rect x="-20" y="30" width="240" height="40" fill="#3a82d4" opacity=".35" />
          <path d="M18 36 q8 -14 24 -10 t12 14 q-4 16 -16 16 t-20 -20z" fill="#4e9a4f" stroke="#8c8a4a" strokeWidth="1.2" />
          <path d="M34 62 q6 -6 14 0 t4 16 q-8 10 -14 2 t-4 -18z" fill="#5aa656" stroke="#8c8a4a" strokeWidth="1.2" />
          <path d="M92 30 q14 -10 28 -2 t4 14 q-10 8 -18 4 t-14 -16z" fill="#4e9a4f" stroke="#8c8a4a" strokeWidth="1.2" />
          <path d="M104 50 q10 -4 18 4 t0 20 q-8 10 -16 0 t-8 -14z" fill="#b59a52" stroke="#8c7a46" strokeWidth="1.2" />
          <path d="M148 36 q18 -12 34 -2 t2 16 q-14 6 -24 2 t-14 -10z" fill="#4e9a4f" stroke="#8c8a4a" strokeWidth="1.2" />
          <path d="M160 64 q10 -4 18 2 t-2 10 q-12 4 -16 -2z" fill="#5aa656" stroke="#8c8a4a" strokeWidth="1.2" />
        </>
      )
    case 3: // Mars: rust, dark patches
      return (
        <>
          <rect x="-20" y="0" width="240" height="100" fill="#c1583a" />
          <path d="M10 46 q18 -14 40 -4 t30 8 q-10 14 -34 12 t-36 -16z" fill="#8f3a26" opacity=".65" />
          <path d="M104 58 q16 -12 34 -2 t24 6 q-8 12 -30 10 t-28 -14z" fill="#8f3a26" opacity=".55" />
          <ellipse cx="70" cy="62" rx="22" ry="8" fill="#e09a68" opacity=".5" />
          <ellipse cx="170" cy="38" rx="20" ry="7" fill="#e09a68" opacity=".45" />
        </>
      )
    case 4: // Jupiter: bands, red spot
      return (
        <>
          {['#e1c699', '#b8895c', '#efd9b3', '#a5744a', '#dfb985', '#c79a6c', '#ecd3a6', '#9c6b46', '#d9b384', '#bf8f62', '#e6cba0'].map((c, i) => (
            <rect key={i} x="-20" y={4 + i * 8.8} width="240" height="9.4" fill={c} />
          ))}
          {[22, 40, 58, 72].map((y, i) => (
            <path key={i} d={`M0 ${y} q25 ${i % 2 ? -4 : 4} 50 0 t50 0 t50 0 t50 0`} stroke="#fff3da" strokeWidth="1.2" fill="none" opacity=".4" />
          ))}
          <ellipse cx="120" cy="63" rx="13" ry="7.5" fill="#b4573a" />
          <ellipse cx="120" cy="63" rx="13" ry="7.5" fill="none" stroke="#e8b48a" strokeWidth="1.6" opacity=".7" />
          <ellipse cx="40" cy="38" rx="8" ry="2.6" fill="#fff3da" opacity=".45" />
        </>
      )
    case 5: // Saturne: soft golden bands
      return (
        <>
          {['#e8d3a0', '#d6b97c', '#ecdcb2', '#cdb07a', '#e6d1a0', '#d2b57c', '#eadaa9'].map((c, i) => (
            <rect key={i} x="-20" y={14 + i * 10.2} width="240" height="10.6" fill={c} />
          ))}
          <path d="M0 50 q25 3 50 0 t50 0 t50 0 t50 0" stroke="#fff6dc" strokeWidth="1.2" fill="none" opacity=".35" />
        </>
      )
    case 6: // Uranus: pale cyan, almost smooth
      return (
        <>
          <rect x="-20" y="0" width="240" height="100" fill="#8fd6d8" />
          <rect x="-20" y="36" width="240" height="16" fill="#b9eef0" opacity=".45" />
          <rect x="-20" y="62" width="240" height="9" fill="#6fbcc2" opacity=".4" />
        </>
      )
    default: // Neptune: deep blue, storms
      return (
        <>
          <rect x="-20" y="0" width="240" height="100" fill="#2c47b9" />
          <rect x="-20" y="30" width="240" height="14" fill="#223a9c" opacity=".7" />
          <rect x="-20" y="58" width="240" height="10" fill="#3e63d6" opacity=".6" />
          <ellipse cx="70" cy="56" rx="14" ry="6" fill="#16256f" opacity=".85" />
          <path d="M96 52 q14 -4 26 0" stroke="#e8f0ff" strokeWidth="1.6" fill="none" opacity=".7" strokeLinecap="round" />
          <path d="M150 40 q12 -4 22 0" stroke="#e8f0ff" strokeWidth="1.2" fill="none" opacity=".55" strokeLinecap="round" />
        </>
      )
  }
}

function Ring({ k, front }: { k: number; front: boolean }) {
  if (k === 5) {
    const d = front ? 'A47 13 0 0 0 97 50' : 'A47 13 0 0 1 97 50'
    const d2 = front ? 'A38 10.5 0 0 0 88 50' : 'A38 10.5 0 0 1 88 50'
    return (
      <g transform="rotate(-18 50 50)" fill="none">
        <path d={`M3 50 ${d}`} stroke="#d9c28f" strokeWidth="5" opacity=".95" />
        <path d={`M12 50 ${d2}`} stroke="#b59f6d" strokeWidth="4" opacity=".95" />
        <path d={`M3 50 ${d}`} stroke="#fff3cf" strokeWidth=".8" opacity=".5" />
      </g>
    )
  }
  if (k === 6) {
    const d = front ? 'A9 46 0 0 0 50 96' : 'A9 46 0 0 1 50 96'
    return (
      <g transform="rotate(14 50 50)" fill="none">
        <path d={`M50 4 ${d}`} stroke="#d4f4f6" strokeWidth="1.4" opacity=".55" />
      </g>
    )
  }
  return null
}

let uid = 0

/** A shaded, slowly rotating planet. `light` is the direction (degrees) the sunlight comes from. */
export const Planet = memo(function Planet({ k, spin = true, light = -135 }: { k: number; spin?: boolean; light?: number }) {
  const [id] = useId0()
  const { r, spin: dur } = PLANETS[k]
  const lx = 50 + Math.cos((light * Math.PI) / 180) * r * 0.45
  const ly = 50 + Math.sin((light * Math.PI) / 180) * r * 0.45
  const slide = (d: number) =>
    spin ? <animateTransform attributeName="transform" type="translate" from="0 0" to="-200 0" dur={`${d}s`} repeatCount="indefinite" /> : null
  return (
    <svg viewBox="0 0 100 100" className="pl-svg" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={`c${id}`}><circle cx="50" cy="50" r={r} /></clipPath>
        <radialGradient id={`s${id}`} gradientUnits="userSpaceOnUse" cx={lx} cy={ly} r={r * 1.75}>
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset=".28" stopColor="#fff" stopOpacity="0" />
          <stop offset=".62" stopColor="#0a0618" stopOpacity=".5" />
          <stop offset=".9" stopColor="#05030f" stopOpacity=".92" />
        </radialGradient>
        <radialGradient id={`a${id}`} cx="50%" cy="50%" r="50%">
          <stop offset=".82" stopColor="#bfe0ff" stopOpacity="0" />
          <stop offset="1" stopColor="#bfe0ff" stopOpacity={k === 2 ? 0.5 : k === 1 ? 0.35 : 0.2} />
        </radialGradient>
      </defs>
      <Ring k={k} front={false} />
      <circle cx="50" cy="50" r={r + 3.5} fill={`url(#a${id})`} />
      <g clipPath={`url(#c${id})`}>
        <g transform={`translate(${50 - 40} 50) translate(0 -50)`}>
          <g>
            {slide(dur)}
            <g>{tile(k)}</g>
            <g transform="translate(200 0)">{tile(k)}</g>
          </g>
        </g>
        {k === 2 && (
          <g>
            <g opacity=".6">
              {slide(dur * 0.6)}
              {[0, 200].map((o) => (
                <g key={o} transform={`translate(${o} 0)`} fill="#fff">
                  <ellipse cx="30" cy="40" rx="22" ry="3.2" />
                  <ellipse cx="80" cy="58" rx="26" ry="3" />
                  <ellipse cx="130" cy="36" rx="18" ry="2.8" />
                  <ellipse cx="170" cy="66" rx="24" ry="3.2" />
                </g>
              ))}
            </g>
            <ellipse cx="50" cy={50 - r + 1} rx="14" ry="5" fill="#fff" opacity=".8" />
            <ellipse cx="50" cy={50 + r - 1} rx="14" ry="5" fill="#fff" opacity=".8" />
          </g>
        )}
        {k === 3 && <ellipse cx="50" cy={50 - r + 1} rx="9" ry="3.6" fill="#fff" opacity=".75" />}
        <circle cx="50" cy="50" r={r} fill={`url(#s${id})`} />
      </g>
      <Ring k={k} front />
    </svg>
  )
})

function useId0(): [string] {
  // Stable, unique ids for the SVG defs (React 18 `useId` returns ':' characters that are awkward in url()).
  const ref = useRefOnce(() => `pl${++uid}`)
  return [ref]
}

function useRefOnce<T>(make: () => T): T {
  const r = useRef<T | null>(null)
  if (r.current === null) r.current = make()
  return r.current
}
