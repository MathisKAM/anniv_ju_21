import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react'
import { Check } from 'lucide-react'
import { solarText as T } from '../content/quiz'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { prefersReducedMotion } from '../fx/env'
import { PLANETS, Planet } from './PlanetArt'

const VW = 350
const VH = 330
const CX = 175
const CY = 165
const ANG = [205, 335, 120, 40, 235, 315, 165, 10]
const TRAY = [5, 0, 7, 2, 4, 1, 6, 3]
const BAY_OF = TRAY.reduce<number[]>((acc, p, b) => {
  acc[p] = b
  return acc
}, [])
const TRAY_BOX = 64
const SNAP = 42

interface Layout {
  sx: number
  sy: number
  sw: number
  sh: number
  bays: { x: number; y: number }[]
}

const orbitR = (k: number) => 36 + k * 16.5

export function SolarGame({ solved, onSolved }: { solved: boolean; onSolved: () => void }) {
  const reduced = useRef(prefersReducedMotion()).current
  const cardRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const bayRefs = useRef<(HTMLDivElement | null)[]>([])
  const fx = useRef<FxHandle>(null)

  const [L, setL] = useState<Layout | null>(null)
  const [placed, setPlaced] = useState<boolean[]>(() => Array(8).fill(solved))
  const [phase, setPhase] = useState<'play' | 'done'>(solved ? 'done' : 'play')
  const [sel, setSel] = useState<number | null>(null)
  const [hot, setHot] = useState<number | null>(null)
  const [drag, setDrag] = useState<{ p: number; x: number; y: number; vx: number } | null>(null)
  const [shake, setShake] = useState<{ p: number; k: number } | null>(null)
  const [msg, setMsg] = useState('')
  const [pulse, setPulse] = useState<number | null>(null)
  const [rev, setRev] = useState(0)
  const streak = useRef(0)
  const gesture = useRef<{ p: number; sx: number; sy: number; moved: boolean; lx: number } | null>(null)
  const placedRef = useRef(placed)
  placedRef.current = placed

  const measure = useCallback(() => {
    const card = cardRef.current
    const scene = sceneRef.current
    if (!card || !scene) return
    const c = card.getBoundingClientRect()
    const s = scene.getBoundingClientRect()
    if (!c.width) return
    setL({
      sx: s.left - c.left,
      sy: s.top - c.top,
      sw: s.width,
      sh: s.height,
      bays: bayRefs.current.map((b) => {
        const r = b?.getBoundingClientRect()
        return r ? { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2 } : { x: 0, y: 0 }
      }),
    })
  }, [])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (cardRef.current) ro.observe(cardRef.current)
    const t = window.setTimeout(measure, 900)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      clearTimeout(t)
      window.removeEventListener('resize', measure)
    }
  }, [measure, phase])

  // orbital revolution once the system is complete
  useEffect(() => {
    if (phase !== 'done' || reduced) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      setRev((t - t0) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase, reduced])

  const slotPos = (k: number, t: number) => {
    if (!L) return { x: 0, y: 0 }
    const rx = orbitR(k)
    const a = ((ANG[k] + t * (34 / (1 + k * 0.55))) * Math.PI) / 180
    return {
      x: L.sx + ((CX + rx * Math.cos(a)) / VW) * L.sw,
      y: L.sy + ((CY + rx * 0.78 * Math.sin(a)) / VH) * L.sh,
    }
  }
  const sunPos = L ? { x: L.sx + (CX / VW) * L.sw, y: L.sy + (CY / VH) * L.sh } : { x: 0, y: 0 }
  const orbitBox = L ? L.sw * 0.135 : TRAY_BOX

  const burst = (at: { x: number; y: number }, count: number) => {
    fx.current?.emit({
      kind: 'spark',
      count,
      x: at.x,
      y: at.y,
      area: 4,
      speed: 150,
      size: 2.2,
      spread: 360,
      duration: 800,
      colors: ['#f3d9a0', '#ffffff', '#d9b77a'],
      gravity: 40,
    })
  }

  const tryPlace = (p: number, slot: number) => {
    setSel(null)
    if (p === slot) {
      streak.current = 0
      setPulse(null)
      setMsg('')
      const next = placedRef.current.map((v, i) => (i === p ? true : v))
      setPlaced(next)
      burst(slotPos(p, 0), 22)
      if (next.every(Boolean)) {
        window.setTimeout(() => {
          setPhase('done')
          burst(sunPos, 40)
        }, 700)
        window.setTimeout(onSolved, 3200)
      }
    } else {
      streak.current += 1
      setShake({ p, k: Date.now() })
      setMsg(p < slot ? T.nearer : T.farther)
      if (streak.current >= 3) {
        const firstFree = placedRef.current.findIndex((v) => !v)
        setPulse(firstFree)
        setMsg(T.help)
      }
    }
  }

  const nearestSlot = (x: number, y: number) => {
    let best: number | null = null
    let bd = SNAP * ((L?.sw ?? VW) / VW) + 6
    for (let k = 0; k < 8; k++) {
      if (placedRef.current[k]) continue
      const s = slotPos(k, 0)
      const d = Math.hypot(s.x - x, s.y - y)
      if (d < bd) {
        bd = d
        best = k
      }
    }
    return best
  }

  const rel = (e: { clientX: number; clientY: number }) => {
    const c = cardRef.current!.getBoundingClientRect()
    return { x: e.clientX - c.left, y: e.clientY - c.top }
  }

  const onDown = (e: RPointerEvent, p: number) => {
    if (placed[p] || phase === 'done') return
    e.currentTarget.setPointerCapture(e.pointerId)
    gesture.current = { p, sx: e.clientX, sy: e.clientY, moved: false, lx: e.clientX }
  }
  const onMove = (e: RPointerEvent, p: number) => {
    const g = gesture.current
    if (!g || g.p !== p) return
    if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 6) return
    g.moved = true
    const r = rel(e)
    const vx = Math.max(-1, Math.min(1, (e.clientX - g.lx) / 14))
    g.lx = e.clientX
    setDrag({ p, x: r.x, y: r.y, vx })
    setHot(nearestSlot(r.x, r.y))
  }
  const onUp = (e: RPointerEvent, p: number) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.p !== p) return
    if (g.moved) {
      const r = rel(e)
      const slot = nearestSlot(r.x, r.y)
      setDrag(null)
      setHot(null)
      if (slot !== null) tryPlace(p, slot)
    } else {
      setSel((s) => (s === p ? null : p))
      setMsg('')
    }
  }

  const nOk = placed.filter(Boolean).length
  const hint = sel !== null ? T.traySelected : msg || T.hint

  const planetPos = (p: number) => {
    if (drag?.p === p) return { x: drag.x, y: drag.y, scale: 1.15 }
    if (placed[p]) {
      const s = slotPos(p, phase === 'done' && !reduced ? rev : 0)
      return { ...s, scale: orbitBox / TRAY_BOX }
    }
    const b = L?.bays[BAY_OF[p]] ?? { x: 0, y: 0 }
    return { ...b, scale: 1 }
  }

  return (
    <div className={`sg${phase === 'done' ? ' is-done' : ''}`} ref={cardRef}>
      <div className="sg__stars" aria-hidden="true" />
      <div className="sg__scene" ref={sceneRef}>
        <svg viewBox={`0 0 ${VW} ${VH}`} className="sg__orbits" aria-hidden="true">
          {PLANETS.map((_, k) => (
            <ellipse
              key={k}
              cx={CX}
              cy={CY}
              rx={orbitR(k)}
              ry={orbitR(k) * 0.78}
              className={`sg-orbit${placed[k] ? ' is-lit' : ''}`}
              style={{ '--i': k } as CSSProperties}
            />
          ))}
        </svg>
        <div className="sg-sun" aria-hidden="true" />
        {PLANETS.map((pl, k) => {
          const a = ((ANG[k] * Math.PI) / 180)
          const left = ((CX + orbitR(k) * Math.cos(a)) / VW) * 100
          const top = ((CY + orbitR(k) * 0.78 * Math.sin(a)) / VH) * 100
          return (
            <button
              key={k}
              type="button"
              className={`sg-slot${hot === k ? ' is-hot' : ''}${placed[k] ? ' is-filled' : ''}${sel !== null && !placed[k] ? ' is-open' : ''}`}
              style={{ left: `${left}%`, top: `${top}%` }}
              aria-label={`Orbite ${k + 1}${placed[k] ? ` : ${pl.name}` : ''}`}
              disabled={placed[k] || sel === null}
              tabIndex={sel === null || placed[k] ? -1 : 0}
              onClick={() => sel !== null && tryPlace(sel, k)}
            >
              <span>{k + 1}</span>
            </button>
          )
        })}
        {phase === 'done' && (
          <p className="sg__badge">
            <Check size={14} strokeWidth={2.6} aria-hidden="true" /> {T.done}
          </p>
        )}
      </div>

      <p className="sg__msg" aria-live="polite">{phase === 'done' ? '' : hint}</p>

      {phase === 'play' ? (
        <ul className="sg__tray" aria-label="Planètes à placer">
          {TRAY.map((p, b) => (
            <li key={p} className="sg-bay">
              <div
                className="sg-bay__spot"
                ref={(el) => {
                  bayRefs.current[b] = el
                }}
              />
              <span className="sg-bay__name">{PLANETS[p].name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="sg__mnemo">
          <h3 className="sg__mt">{T.mnemonicTitle}</h3>
          <ul className="sg__ml">
            {T.mnemonic.map((m, i) => (
              <li key={m.planet} style={{ '--d': `${300 + i * 260}ms` } as CSSProperties}>
                <span className="sg__mw">{m.word || '\u00a0'}</span>
                <span className="sg__ma" aria-hidden="true">→</span>
                <strong>{m.planet}</strong>
              </li>
            ))}
            <li className="is-sun" style={{ '--d': `${300 + T.mnemonic.length * 260}ms` } as CSSProperties}>
              <span className="sg__mw">{T.sun.word}</span>
              <span className="sg__ma" aria-hidden="true">→</span>
              <strong>{T.sun.planets.join(', ')}</strong>
            </li>
          </ul>
        </div>
      )}

      {/* planets: one layer so that they can fly between the tray and the orbits */}
      {L && (
        <div className="sg__layer">
          {PLANETS.map((pl, k) => {
            const { x, y, scale } = planetPos(k)
            const dragging = drag?.p === k
            const lit = placed[k]
            const sun = Math.atan2(sunPos.y - y, sunPos.x - x) * (180 / Math.PI)
            const light = lit ? Math.round(sun / 6) * 6 : -135
            return (
              <button
                key={`${k}-${shake?.p === k ? shake.k : 0}`}
                type="button"
                className={[
                  'sg-pl',
                  dragging && 'is-drag',
                  lit && 'is-placed',
                  sel === k && 'is-sel',
                  pulse === k && !lit && 'is-pulse',
                  shake?.p === k && 'is-shake',
                  phase === 'done' && !reduced && 'is-orbiting',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  transform: `translate(${x - TRAY_BOX / 2}px, ${y - TRAY_BOX / 2}px) scale(${scale}) rotate(${dragging ? drag!.vx * 10 : 0}deg)`,
                }}
                aria-label={`${pl.name}${lit ? `, orbite ${k + 1}` : ''}`}
                aria-pressed={sel === k}
                disabled={lit || phase === 'done'}
                onPointerDown={(e) => onDown(e, k)}
                onPointerMove={(e) => onMove(e, k)}
                onPointerUp={(e) => onUp(e, k)}
                onPointerCancel={() => {
                  gesture.current = null
                  setDrag(null)
                  setHot(null)
                }}
                onClick={(e) => {
                  if (e.detail === 0) {
                    setSel((s) => (s === k ? null : k))
                    setMsg('')
                  }
                }}
              >
                <Planet k={k} spin={!reduced} light={light} />
              </button>
            )
          })}
        </div>
      )}

      <div className="sg__fx" aria-hidden="true">
        <ParticleCanvas ref={fx} />
      </div>
      <p className="sg__count" aria-hidden="true">{nOk} / 8</p>
    </div>
  )
}
