import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { Star, X } from 'lucide-react'
import { trophies, trophyText, type Trophy, type TrophyId } from '../content/trophies'
import { ParticleCanvas, type FxHandle } from '../fx/ParticleCanvas'
import { prefersReducedMotion } from '../fx/env'
import { TrophyArt, TrophyDefs } from './scene/TrophyArt'
import { BackButton, Button, Eyebrow, MaskTitle } from './ui'

const GOLD = ['#f3dcaa', '#d9b77a', '#fff4d6']
const LEAVE_MS = 700

const ultimate = trophies.find((t) => t.id === 'copine') as Trophy
const regulars = trophies.filter((t) => t.id !== 'copine')

/** Words rising one after the other: the compliment is "written" in front of her. */
function Reveal({ text, delay = 0, step = 70 }: { text: string; delay?: number; step?: number }) {
  return (
    <>
      {text.split(' ').map((w, i, all) => (
        <span key={i}>
          <span className="gal__w" style={{ animationDelay: `${delay + i * step}ms` } as CSSProperties}>{w}</span>
          {i < all.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  )
}

export function TrophyGallery({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [open, setOpen] = useState<TrophyId | null>(null)
  const [found, setFound] = useState<TrophyId[]>([])
  const [leaving, setLeaving] = useState(false)
  const fx = useRef<FxHandle>(null)
  const room = useRef<HTMLDivElement>(null)
  const objs = useRef<Partial<Record<TrophyId, HTMLElement | null>>>({})
  const opener = useRef<HTMLElement | null>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const timers = useRef<number[]>([])

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])
  useEffect(() => clearTimers, [clearTimers])

  const centerOf = (id: TrophyId) => {
    const r = room.current?.getBoundingClientRect()
    const o = objs.current[id]?.getBoundingClientRect()
    if (!r || !o) return null
    return { x: o.left - r.left + o.width / 2, y: o.top - r.top + o.height / 2, w: o.width }
  }

  const choose = (id: TrophyId, el: HTMLElement) => {
    if (leaving) return
    clearTimers()
    opener.current = el
    setOpen(id)
    setFound((f) => (f.includes(id) ? f : [...f, id]))

    const o = el.getBoundingClientRect()
    const mid = o.top + o.height / 2
    const smooth = prefersReducedMotion() ? 'auto' : 'smooth'
    if (id === 'copine') {
      window.scrollBy({ top: o.top - window.innerHeight * 0.05, behavior: smooth })
    } else if (mid > window.innerHeight * 0.55 || o.top < 70) {
      window.scrollBy({ top: mid - window.innerHeight * 0.3, behavior: smooth })
    }

    const c = () => centerOf(id)
    if (id !== 'copine') {
      later(() => {
        const p = c()
        if (p) fx.current?.emit({ kind: 'spark', count: 10, x: p.x, y: p.y, area: p.w * 0.25, speed: 50, size: 1.3, opacity: 0.8, spread: 360, duration: 1100, colors: GOLD })
      }, 150)
      return
    }
    later(() => {
      const p = c()
      if (p) fx.current?.emit({ kind: 'dust', count: 22, x: p.x, y: p.y, area: p.w * 0.3, speed: 18, size: 1.4, opacity: 0.6, direction: -90, spread: 120, duration: 3200, colors: GOLD })
    }, 1300)
    later(() => {
      const p = c()
      if (p) fx.current?.emit({ kind: 'spark', count: 16, x: p.x, y: p.y, area: p.w * 0.35, speed: 70, size: 1.3, opacity: 0.8, spread: 360, duration: 1200, colors: GOLD })
    }, 2300)
    later(() => {
      const p = c()
      if (p) {
        fx.current?.emit({ kind: 'spark', count: 28, x: p.x, y: p.y, area: 12, speed: 150, size: 1.4, opacity: 0.85, spread: 360, duration: 1300, colors: GOLD })
        fx.current?.emit({ kind: 'dust', count: 30, x: p.x, y: p.y, area: p.w * 0.4, speed: 22, size: 1.5, opacity: 0.7, spread: 360, duration: 4200, colors: GOLD })
      }
    }, 3000)
  }

  const close = useCallback(() => {
    clearTimers()
    setOpen(null)
    opener.current?.focus({ preventScroll: true })
  }, [clearTimers])

  useEffect(() => {
    if (!open) return
    closeBtn.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const next = () => {
    if (leaving) return
    clearTimers()
    setOpen(null)
    if (prefersReducedMotion()) return onNext()
    setLeaving(true)
    later(onNext, LEAVE_MS)
  }

  const others = found.filter((f) => f !== 'copine').length
  const ready = others >= regulars.length
  const active = trophies.find((t) => t.id === open)
  const activeUlt = active?.id === 'copine'

  const renderTrophy = (t: Trophy, i: number) => {
    const isUlt = t.id === 'copine'
    const isOpen = open === t.id
    const done = found.includes(t.id)
    const cls = [
      'tro',
      isUlt ? 'tro--ult' : `tro--${i + 1}`,
      isUlt && ready ? 'is-ready' : '',
      isOpen ? 'is-open' : '',
      done ? 'is-found' : '',
    ].join(' ')
    return (
      <div key={t.id} className={cls} style={{ '--i': i } as CSSProperties}>
        <button
          type="button"
          className="tro__btn"
          aria-label={`${t.title}${done ? ' (découvert)' : ''}`}
          aria-haspopup="dialog"
          onClick={(e) => choose(t.id, e.currentTarget)}
        >
          <span className="tro__beam" aria-hidden="true" />
          <span className="tro__obj" ref={(el) => { objs.current[t.id] = el }}>
            <span className="tro__halo" aria-hidden="true" />
            <TrophyArt id={t.id} />
          </span>
          <span className="tro__ped" aria-hidden="true">
            <span className="tro__top" />
            <span className="tro__pool" />
          </span>
          <span className="tro__plate">
            {isUlt ? <span className="tro__prize">{trophyText.mainPrize}</span> : null}
            <span className="tro__name">{t.title}</span>
            <Star className="tro__check" size={13} aria-hidden="true" />
          </span>
        </button>
      </div>
    )
  }

  return (
    <section
      className={`gal${open ? ' has-open' : ''}${activeUlt ? ' is-ult' : ''}${leaving ? ' is-leaving' : ''}`}
      aria-labelledby="gal-title"
    >
      <TrophyDefs />
      <div className="story__back"><BackButton onClick={onBack} label={trophyText.back} /></div>
      <header className="gal__head">
        <Eyebrow>{trophyText.eyebrow}</Eyebrow>
        <MaskTitle id="gal-title" className="title" text={trophyText.title} />
        <p className="lead">{trophyText.lead}</p>
      </header>

      <div className="gal__room" ref={room}>
        <div className="gal__wall" aria-hidden="true" />
        <div className="gal__floor" aria-hidden="true" />
        <div className="gal__stage">
          {renderTrophy(ultimate, 5)}
          {regulars.map((t, i) => renderTrophy(t, i))}
        </div>
        <ParticleCanvas ref={fx} className="gal__fx" />
      </div>

      <p className="gal__count" aria-live="polite">
        {found.length} / {trophies.length} découverts
      </p>
      <p className="gal__hint">{trophyText.hint}</p>
      <div className="gal__cta">
        <Button onClick={next}>{trophyText.cta}</Button>
      </div>

      <div className={`gal__dim${open ? ' is-on' : ''}`} onClick={close} aria-hidden="true" />
      {active ? createPortal(
        <div
          key={active.id}
          className={`gal__panel${activeUlt ? ' gal__panel--ult' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gal-panel-text"
          style={{ '--d': activeUlt ? '2900ms' : '150ms' } as CSSProperties}
        >
          <button ref={closeBtn} type="button" className="gal__close" onClick={close} aria-label={trophyText.close}>
            <X size={18} aria-hidden="true" />
          </button>
          {activeUlt ? null : <p className="gal__kicker">{active.title}</p>}
          <p id="gal-panel-text" className="gal__text">
            <Reveal text={active.compliment} delay={activeUlt ? 3000 : 250} step={activeUlt ? 110 : 55} />
          </p>
          {active.tender ? (
            <p className="gal__tender">
              <Reveal text={active.tender} delay={4100} step={50} />
            </p>
          ) : null}
        </div>,
        document.body,
      ) : null}
    </section>
  )
}
