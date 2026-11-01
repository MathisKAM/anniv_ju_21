import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Mic } from 'lucide-react'
import { wishGame } from '../content/games'
import { isLowPower, prefersReducedMotion } from '../fx/env'
import { rng } from '../fx/noise'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { BackButton, Button, Eyebrow, MaskTitle } from './ui'
import { BOX, CakeArt, CakeLight, CandleBody, CandleFlame, layoutCandles } from './CakeScene'

const TICK_MS = 50
const GAIN = 0.03
const DECAY = 0.045
const MIC_THRESHOLD = 0.06
const WARM = ['#fff1d8', '#ffd9a0', '#d9b77a', '#DCC0B8']

/** Candle i goes out once the breath level passes its own threshold, so they die one after the other. */
const threshold = (i: number, n: number) => 0.3 + (n > 1 ? (i / (n - 1)) * 0.5 : 0)
const rand = (a: number, b: number) => a + Math.random() * (b - a)

/** Out-of-focus lights of the room: warm gold and rose, never in the lower third. */
const BOKEH = (() => {
  const r = rng(11)
  return Array.from({ length: 12 }, (_, i) => ({
    x: r() * 100,
    y: 4 + r() * 52,
    s: 28 + r() * 70,
    c: i % 3 === 0 ? '255,226,170' : i % 3 === 1 ? '217,183,122' : '220,160,150',
    o: 0.16 + r() * 0.22,
    d: 9 + r() * 9,
    b: 3 + r() * 6,
  }))
})()

/** A sentence that reveals itself word by word. */
function Words({ text, delay, step = 55, className }: { text: string; delay: number; step?: number; className?: string }) {
  const words = text.split(' ')
  return (
    <p className={className}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="bd-w" style={{ animationDelay: `${delay + i * step}ms` }}>{w}</span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  )
}

function Layer({ on, children, className = '' }: { on: boolean; children: ReactNode; className?: string }) {
  return <div className={`bd-l ${className}${on ? ' is-on' : ''}`}>{children}</div>
}

export function WishGame({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const n = wishGame.candles
  const cands = useMemo(() => layoutCandles(n), [n])
  // Each candle catches slightly differently, so the three never ignite in unison.
  const traits = useMemo(
    () => cands.map(() => ({ dl: Math.round(rand(40, 260)), pk: rand(1, 1.1), ph: -rand(0, 2) })),
    [cands],
  )

  const [lit, setLit] = useState<boolean[]>(() => Array(n).fill(false))
  const [out, setOut] = useState<boolean[]>(() => Array(n).fill(false))
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [blowing, setBlowing] = useState(false)
  const [mic, setMic] = useState<'off' | 'on' | 'denied'>('off')

  const stage = useRef<HTMLDivElement>(null)
  const room = useRef<HTMLDivElement>(null)
  const meter = useRef<HTMLSpanElement>(null)
  const fx = useRef<FxHandle>(null)
  const held = useRef(false)
  const micLevel = useRef(0)
  const level = useRef(0)
  const audio = useRef<{ ctx: AudioContext; stream: MediaStream } | null>(null)
  const timers = useRef<number[]>([])
  const wasOut = useRef<boolean[]>(Array(n).fill(false))
  const phase = useRef(0)
  const reduced = prefersReducedMotion()
  const low = isLowPower()
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, reduced ? 0 : ms))

  const litCount = lit.filter(Boolean).length
  const allLit = litCount === n
  const allOut = ready && out.every(Boolean)
  phase.current = done ? 2 : ready ? 1 : 0

  const setBreath = (v: number) => {
    stage.current?.style.setProperty('--b', v.toFixed(3))
    if (meter.current) meter.current.style.transform = `scaleX(${v.toFixed(3)})`
  }

  const stopMic = useCallback(() => {
    audio.current?.stream.getTracks().forEach((t) => t.stop())
    void audio.current?.ctx.close()
    audio.current = null
  }, [])
  useEffect(
    () => () => {
      stopMic()
      timers.current.forEach(window.clearTimeout)
    },
    [stopMic],
  )

  /** Screen position of a point of the 320 x 320 cake box. */
  const at = (x: number, y: number) => {
    const r = stage.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0, k: 1 }
    const k = r.width / BOX
    return { x: r.left + x * k, y: r.top + y * k, k }
  }

  // The fixed room is anchored to the cake: the table edge sits behind the plate.
  const place = useCallback(() => {
    const r = stage.current?.getBoundingClientRect()
    const el = room.current
    if (!r || !el) return
    el.style.setProperty('--cx', `${(r.left + r.width / 2).toFixed(1)}px`)
    el.style.setProperty('--ty', `${(r.top + r.height * 0.8).toFixed(1)}px`)
  }, [])
  useLayoutEffect(() => {
    place()
    const t = window.setTimeout(place, 700)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, { passive: true })
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place)
    }
  }, [place])
  useEffect(() => {
    const id = window.setTimeout(place, 80)
    return () => window.clearTimeout(id)
  }, [place, ready, done])

  // The last flame takes a moment to settle before the wish is asked.
  useEffect(() => {
    if (!allLit) return
    const id = window.setTimeout(() => setReady(true), reduced ? 0 : 900)
    return () => window.clearTimeout(id)
  }, [allLit, reduced])

  // One light loop: breath rises while blowing, falls otherwise; candles react to the level.
  useEffect(() => {
    if (!ready || allOut) return
    const id = window.setInterval(() => {
      const active = held.current || micLevel.current > MIC_THRESHOLD
      const next = active ? Math.min(1, level.current + GAIN + micLevel.current * 0.4) : Math.max(0, level.current - DECAY)
      level.current = next
      setBreath(next)
      setBlowing(active)
      if (active && !reduced) {
        // The breath carries a few motes of light across the candles.
        const p = at(-14, 70 + rand(0, 90))
        fx.current?.emit({
          kind: 'dust', count: 1, x: p.x, y: p.y, area: 10, speed: 170 + next * 120, size: 1.6, opacity: 0.6,
          direction: rand(-10, 8), spread: 18, duration: 1100, colors: WARM,
        })
      }
      setOut((o) => {
        let changed = false
        const r = o.map((v, i) => {
          if (!v && next >= threshold(i, n)) {
            changed = true
            return true
          }
          return v
        })
        return changed ? r : o
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, allOut, n])

  // A flame that has just died leaves a few embers and a last glow.
  useEffect(() => {
    out.forEach((v, i) => {
      if (!v || wasOut.current[i]) return
      wasOut.current[i] = true
      const p = at(cands[i].x, cands[i].wick)
      fx.current?.emit({ kind: 'spark', count: 6, x: p.x, y: p.y - 6 * p.k, area: 4, speed: 38, size: 1.2, opacity: 0.9, direction: -90, spread: 70, duration: 1300, colors: ['#ffb24a', '#ffd9a0', '#fff1d8'] })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [out])

  useEffect(() => {
    if (!allOut) return
    held.current = false
    stopMic()
    setBreath(0)
    setBlowing(false)
    navigator.vibrate?.([20, 40, 20])
    // The last wisps rise before the wish is announced.
    later(() => setDone(true), 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOut, stopMic])

  // Quiet motes drift upwards all along; the light of the finale makes them gather around the cake.
  useEffect(() => {
    if (reduced || low) return
    const id = window.setInterval(() => {
      const c = at(BOX / 2, 150)
      const p = phase.current
      fx.current?.emit({
        kind: 'dust', count: p === 2 ? 2 : 1, x: c.x, y: c.y + 20 * c.k, area: p === 2 ? 90 * c.k : 150 * c.k,
        speed: p === 2 ? 26 : 10, size: 1.5, opacity: p === 2 ? 0.8 : 0.45, direction: -90, spread: 50,
        duration: p === 2 ? 5200 : 4600, colors: WARM,
      })
    }, 700)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, low])

  useEffect(() => {
    if (!done || reduced) return
    const c = at(BOX / 2, 150)
    fx.current?.emit({ kind: 'star', count: low ? 8 : 16, x: c.x, y: c.y, area: 110 * c.k, speed: 14, size: 2, opacity: 0.9, direction: -90, spread: 120, duration: 4800, colors: WARM, delayJitter: 900 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done])

  const light = (i: number) => {
    if (lit[i] || ready) return
    navigator.vibrate?.(8)
    const p = at(cands[i].x, cands[i].wick)
    // The spark comes first; the flame follows after a beat.
    fx.current?.emit({ kind: 'spark', count: 7, x: p.x, y: p.y - 2 * p.k, area: 3, speed: 70, size: 1.5, opacity: 1, direction: -90, spread: 150, duration: 800, colors: WARM, gravity: 30 })
    setLit((l) => l.map((v, j) => (j === i ? true : v)))
  }

  const startMic = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const src = ctx.createMediaStreamSource(s)
      const an = ctx.createAnalyser()
      an.fftSize = 512
      src.connect(an)
      audio.current = { ctx, stream: s }
      const buf = new Float32Array(an.fftSize)
      const read = () => {
        if (!audio.current) {
          micLevel.current = 0
          return
        }
        an.getFloatTimeDomainData(buf)
        let sum = 0
        for (const v of buf) sum += v * v
        micLevel.current = Math.sqrt(sum / buf.length)
        window.setTimeout(read, 40)
      }
      read()
      setMic('on')
    } catch {
      setMic('denied')
    }
  }

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    navigator.vibrate?.(12)
    const c = at(BOX / 2, 150)
    fx.current?.emit({ kind: 'dust', count: 30, x: c.x, y: c.y + 10 * c.k, area: 70 * c.k, speed: 110, size: 2, opacity: 0.9, direction: -90, spread: 80, duration: 1500, colors: WARM })
    later(onNext, 950)
  }

  const title = done ? wishGame.doneTitle : ready ? wishGame.blowTitle : wishGame.lightTitle
  const state = `${ready ? ' is-ready' : ''}${allOut ? ' is-allout' : ''}${done ? ' is-done' : ''}${leaving ? ' is-leaving' : ''}${blowing ? ' is-blowing' : ''}`
  const vars = { '--lit': litCount / n } as CSSProperties
  const traitVars = (i: number) =>
    ({ '--dl': `${traits[i].dl}ms`, '--pk': traits[i].pk, '--lean': cands[i].lean, '--fd': `${cands[i].fd}s`, '--ph': `${traits[i].ph}s` }) as CSSProperties

  return (
    <>
      {createPortal(
        <div ref={room} className={`bd${state}`} style={vars} aria-hidden="true">
          <div className="bd__room" />
          <div className="bd__win" />
          <div className="bd__lampshade" />
          {BOKEH.slice(0, low ? 6 : BOKEH.length).map((b, i) => (
            <i
              key={i}
              className="bd__bk"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, '--c': b.c, '--o': b.o, '--d': `${b.d}s`, '--bl': `${b.b}px` } as CSSProperties}
            />
          ))}
          <div className="bd__glow" />
          <div className="bd__table"><i className="bd__pool" /></div>
          <div className="bd__dim" />
          <div className="bd__vig" />
          <div className="bd__bloom" />
        </div>,
        document.body,
      )}
      {createPortal(
        <div className="bd-fx" aria-hidden="true">
          <ParticleCanvas ref={fx} className="fx" />
        </div>,
        document.body,
      )}

      <section className={`story center bd-sec${state}`} aria-labelledby="wish-title">
        <div className="story__back"><BackButton onClick={onBack} /></div>
        <div className="bd-head">
          <Eyebrow>{wishGame.eyebrow}</Eyebrow>
          <MaskTitle id="wish-title" className="title" key={title} text={title} />
        </div>

        <div ref={stage} className={`bd-stage${blowing ? ' is-blowing' : ''}`} style={vars}>
          <div className="bd-aura" />
          <svg viewBox={`0 0 ${BOX} ${BOX}`} aria-hidden="true" focusable="false">
            <g className="bd-cake">
              <CakeArt />
              <CakeLight cands={cands} lit={lit} out={out} />
              {cands.map((c, i) => (
                <CandleBody key={i} c={c} lit={lit[i]} out={out[i]} style={traitVars(i)} />
              ))}
              {cands.map((c, i) => (
                <CandleFlame key={i} c={c} lit={lit[i]} out={out[i]} style={traitVars(i)} />
              ))}
            </g>
          </svg>
          <div className="bd-cands">
            {cands.map((c, i) => (
              <button
                key={i}
                type="button"
                className={`bd-c${lit[i] ? ' is-lit' : ''}`}
                style={{ left: `${(c.x / BOX) * 100}%`, top: `${((c.wick - 28) / BOX) * 100}%`, height: `${((c.base - c.wick + 28) / BOX) * 100}%` }}
                disabled={lit[i] || ready}
                aria-label={out[i] ? `Bougie ${i + 1} soufflée` : lit[i] ? `Bougie ${i + 1} allumée` : `Allumer la bougie ${i + 1}`}
                onClick={() => light(i)}
              />
            ))}
          </div>
        </div>

        <div className="bd-low">
          <Layer on={!ready} className="bd-l--note">
            <div className="bd-note">
              <span className="bd-note__rule" aria-hidden="true" />
              <Words className="bd-note__a" text={wishGame.introA} delay={500} />
              <Words className="bd-note__b" text={wishGame.introB} delay={2500} />
            </div>
            <p className="hint bd-count" role="status">
              {wishGame.lightIntro} {litCount} / {n}
            </p>
          </Layer>

          <Layer on={ready && !done} className="bd-l--blow">
            <p className="lead">{mic === 'on' ? wishGame.micOn : wishGame.blowIntro}</p>
            <button
              type="button"
              className={`blow${blowing ? ' is-active' : ''}`}
              onPointerDown={(e) => {
                held.current = true
                e.currentTarget.setPointerCapture(e.pointerId)
              }}
              onPointerUp={() => (held.current = false)}
              onPointerLeave={() => (held.current = false)}
              onPointerCancel={() => (held.current = false)}
              onContextMenu={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') held.current = true
              }}
              onKeyUp={() => (held.current = false)}
            >
              <span ref={meter} className="blow__meter" />
              <span className="blow__wind" aria-hidden="true"><i /><i /><i /><i /></span>
              <span className="blow__label">{wishGame.blowButton}</span>
            </button>
            {mic === 'off' && typeof navigator.mediaDevices?.getUserMedia === 'function' && (
              <button type="button" className="link link--icon" onClick={startMic}>
                <Mic size={16} aria-hidden="true" /> {wishGame.micButton}
              </button>
            )}
            {mic === 'denied' && <p className="hint" role="status">{wishGame.micDenied}</p>}
          </Layer>

          <Layer on={done} className="bd-l--done">
            <div role="status" className="bd-done">
              <p className="lead">{wishGame.doneText}</p>
              <Button onClick={leave} disabled={leaving}>{wishGame.next}</Button>
            </div>
          </Layer>
        </div>
      </section>
    </>
  )
}
