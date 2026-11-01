import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { gift } from '../content/rewards'
import { prefersReducedMotion } from '../fx/env'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { BackButton, Button, Eyebrow, MaskTitle, Sky } from './ui'
import { wordsOf } from './LetterArt'

const WORD_MS = 95
const ACT_MAX_MS = 3600
const FIRST_AT = 1500
const READ_MS = 150 // extra reading time granted per word once a paragraph is fully shown
const HOLD_MS = 2600 // stillness after the last paragraph, before it dissolves
const AWAY_MS = 2000
const EXTRA_LEAD = 1900
const EXTRA_WORD_MS = 105
const EXTRA_MAX_MS = 4200
const LEAVE_MS = 1400
const GOLD = ['#d9b77a', '#f6dfae', '#F7EEE6']

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}]/gu, '')
const EMPHASIS = new Set(gift.emphasis.map(norm))
const KINDS = ['first', 'middle', 'last'] as const

type Phase = 'msg' | 'away' | 'extra'

function Words({ text, id, lead, per }: { text: string; id: string; lead: number; per: number }) {
  const words = wordsOf(text)
  return (
    <p className="gf-p">
      <span className="gf-sr">{text}</span>
      <span aria-hidden="true">
        {words.map((w, j) => {
          const em = EMPHASIS.has(norm(w))
          const d = Math.round(lead + j * per)
          return (
            <span key={j}>
              <span className={`gf-wo${em ? ' is-em' : ''}`} data-em={em ? `${id}-${j}` : undefined} style={{ '--d': `${d}ms` } as CSSProperties}>
                <span className="gf-wi" style={{ animationDelay: `${d}ms` }}>{w}</span>
              </span>
              {j < words.length - 1 ? ' ' : ''}
            </span>
          )
        })}
      </span>
    </p>
  )
}

export function GiftReveal({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const texts = gift.paragraphs
  const [phase, setPhase] = useState<Phase>(reduced ? 'extra' : 'msg')
  const [act, setAct] = useState(reduced ? texts.length : 0)
  const [skip, setSkip] = useState(reduced)
  const [done, setDone] = useState(reduced)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<number[]>([])
  const fx = useRef<FxHandle>(null)
  const stage = useRef<HTMLDivElement>(null)
  const extra = useRef<HTMLDivElement>(null)
  const extraP = useRef<HTMLDivElement>(null)

  const sched = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const nExtra = Math.max(wordsOf(gift.extra).length, 1)
  const extraPer = Math.min(EXTRA_WORD_MS, EXTRA_MAX_MS / nExtra)
  const extraTotal = EXTRA_LEAD + nExtra * extraPer + 1300

  // Each paragraph waits for the previous one to be read; the pace follows the length of the text.
  const plan = useMemo(() => {
    let t = FIRST_AT
    const acts = texts.map((text) => {
      const n = Math.max(wordsOf(text).length, 1)
      const per = Math.min(WORD_MS, ACT_MAX_MS / n)
      const start = t
      t = start + n * per + 800 + n * READ_MS
      return { start, per, n }
    })
    return { acts, tail: t + HOLD_MS }
  }, [texts])

  const sparkAt = (key: string) => {
    const el = stage.current?.querySelector(`[data-em="${key}"]`)
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    fx.current?.emit({ kind: 'spark', count: 12, x, y, area: 6, speed: 70, spread: 360, size: 1.3, duration: 950, opacity: 0.95, colors: GOLD })
    fx.current?.emit({ kind: 'dust', count: 8, x, y, area: r.width / 2, speed: 14, direction: -90, spread: 90, size: 1.5, duration: 2600, opacity: 0.7, colors: GOLD })
  }

  const burstAtExtra = (count: number) => {
    const h = fx.current?.size()
    const r = extra.current?.getBoundingClientRect()
    if (!h || !r) return
    fx.current?.emit({ kind: 'spark', count, x: h.w / 2, y: r.top + r.height / 2, area: Math.min(r.width, 340) * 0.45, speed: 110, direction: -90, spread: 80, size: 1.5, duration: 1500, gravity: -10, opacity: 0.95, colors: GOLD })
    fx.current?.emit({ kind: 'dust', count: count / 2, x: h.w / 2, y: r.top + r.height / 2, area: Math.min(r.width, 340) * 0.5, speed: 24, direction: -90, spread: 120, size: 1.8, duration: 3200, opacity: 0.75, colors: GOLD })
  }

  const tail = (afterMs: number) => {
    sched(() => setPhase('away'), afterMs)
    sched(() => setPhase('extra'), afterMs + AWAY_MS)
    sched(() => setDone(true), afterMs + AWAY_MS + extraTotal)
  }

  useEffect(() => {
    if (reduced) return
    plan.acts.forEach((p, i) => {
      sched(() => setAct((a) => Math.max(a, i + 1)), p.start)
      wordsOf(texts[i]).forEach((w, j) => {
        if (EMPHASIS.has(norm(w))) sched(() => sparkAt(`${i}-${j}`), p.start + j * p.per + 380)
      })
    })
    tail(plan.tail)
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, reduced])

  // slow dust drifting upward behind the text, all along
  useEffect(() => {
    if (reduced) return
    const drift = () => {
      const s = fx.current?.size()
      if (!s) return
      fx.current?.emit({ kind: 'dust', count: 4, x: s.w / 2, y: s.h + 8, area: s.w / 2, speed: 16, direction: -90, spread: 36, size: 1.5, duration: 9000, opacity: 0.5, colors: GOLD })
    }
    drift()
    const id = window.setInterval(drift, 3000)
    return () => window.clearInterval(id)
  }, [reduced])

  useEffect(() => {
    if (phase !== 'extra' || reduced) return
    sched(() => burstAtExtra(30), 700)
    sched(() => burstAtExtra(16), EXTRA_LEAD + nExtra * extraPer * 0.55)
    sched(() => burstAtExtra(26), extraTotal - 900)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useLayoutEffect(() => {
    if (phase !== 'extra' && !reduced) return
    const h = extraP.current?.offsetHeight
    if (h) extra.current?.style.setProperty('--h', `${h}px`)
  }, [phase, reduced])

  const showAll = () => {
    if (leaving || done || phase === 'away') return
    if (phase === 'msg' && !skip) {
      clearTimers()
      setSkip(true)
      setAct(texts.length)
      tail(2800)
    } else if (phase === 'extra') {
      clearTimers()
      setSkip(true)
      sched(() => setDone(true), 700)
    }
  }

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    sched(onNext, reduced ? 0 : LEAVE_MS)
  }

  const cls = ['story', 'center', 'gift', 'gf', reduced && 'is-still', skip && 'is-skip', done && 'is-done', leaving && 'is-leaving'].filter(Boolean).join(' ')
  const showMsg = reduced || phase !== 'extra'
  const showExtra = reduced || phase === 'extra'
  const extraStyle = { '--lead': `${EXTRA_LEAD}ms`, '--span': `${Math.round(nExtra * extraPer + 500)}ms` } as CSSProperties

  return (
    <section className={cls} data-act={Math.min(act, 3)} data-phase={reduced ? 'extra' : phase} aria-labelledby="gift-title">
      <Sky />
      <div className="fx-screen"><ParticleCanvas ref={fx} /></div>
      <div className="gf-light" aria-hidden="true" />
      <div className="story__back"><BackButton onClick={onBack} /></div>
      <header className="gf-head">
        <Eyebrow>Surprise 03</Eyebrow>
        <MaskTitle id="gift-title" className="title title--xl" text={gift.title} delay={200} />
      </header>

      <div className="gf-stage" ref={stage} onClick={showAll}>
        {showMsg && (
          <div className="gf-msg">
            {texts.map((text, i) => {
              if (act <= i) return null
              const p = plan.acts[i]
              return (
                <div
                  key={i}
                  className={`gf-act gf-act--${KINDS[i % 3]}${act > i + 1 ? ' is-past' : ''}`}
                  style={{ '--k': i, '--reveal': `${Math.round(p.n * p.per)}ms` } as CSSProperties}
                >
                  <i className="gf-node" aria-hidden="true" />
                  <Words text={text} id={String(i)} lead={0} per={p.per} />
                </div>
              )
            })}
          </div>
        )}

        {showExtra && (
          <div className="gf-extra" ref={extra} style={extraStyle}>
            <i className="gf-ln gf-ln--t" aria-hidden="true" />
            <i className="gf-ln gf-ln--b" aria-hidden="true" />
            <i className="gf-flare" aria-hidden="true" />
            <div ref={extraP}>
              <Words text={gift.extra} id="x" lead={EXTRA_LEAD} per={extraPer} />
            </div>
          </div>
        )}
      </div>

      {done && (
        <div className="gf-cta">
          <Button onClick={leave}>{gift.button}</Button>
        </div>
      )}

      {leaving &&
        createPortal(
          <div className="gf-out" aria-hidden="true">
            <i className="gf-out__ring" />
            <i className="gf-out__star" />
          </div>,
          document.body,
        )}
    </section>
  )
}
