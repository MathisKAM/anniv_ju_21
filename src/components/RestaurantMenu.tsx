import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react'
import { restaurant, restaurantIdeas, restaurantMenu as t } from '../content/rewards'
import { PlateArt, Stamp, monogramOf } from './RestaurantArt'

const TURN_MS = 950
const DRAG_SPAN = 0.85

type Anim = { turning: number; under: number } | null
type Drag = { page: number; deg: number; progress: number } | null

const dateLabel = restaurant.dateISO
  ? new Date(restaurant.dateISO).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })
  : null

const fill = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

/** The back of the card: a small printed menu whose pages turn around a spine (arrows, swipe, keyboard). */
export function RestaurantMenu({ active, onTurnBack }: { active: boolean; onTurnBack: () => void }) {
  const n = restaurantIdeas.length
  const total = n + 2 // when + ideas + closing
  const last = total - 1
  const [idx, setIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const [anim, setAnim] = useState<Anim>(null)
  const [drag, setDrag] = useState<Drag>(null)
  const [moved, setMoved] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const timer = useRef<number>(0)
  const start = useRef<{ x: number; t: number; w: number; id: number } | null>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!active) return
    const r = window.setTimeout(() => setReady(true), 560)
    const f = window.setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body || (document.activeElement as HTMLElement).classList?.contains('rs-hit')) {
        menu.current?.focus({ preventScroll: true })
      }
    }, 1250)
    return () => {
      window.clearTimeout(r)
      window.clearTimeout(f)
    }
  }, [active])

  const go = useCallback(
    (d: 1 | -1) => {
      const next = idx + d
      if (next < 0 || next > last) return
      setMoved(true)
      setIdx(next)
      setAnim({ turning: d === 1 ? idx : next, under: d === 1 ? next : idx })
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setAnim(null), TURN_MS + 60)
    },
    [idx, last],
  )

  useEffect(() => {
    if (!active) return
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      const el = e.target as HTMLElement | null
      if (el && /^(input|textarea|select)$/i.test(el.tagName)) return
      go(e.key === 'ArrowRight' ? 1 : -1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [active, go])

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    start.current = { x: e.clientX, t: performance.now(), w: e.currentTarget.getBoundingClientRect().width, id: e.pointerId }
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current
    if (!s) return
    const dx = e.clientX - s.x
    if (!drag && Math.abs(dx) < 8) return
    if (!drag) e.currentTarget.setPointerCapture(s.id)
    const p = Math.min(1, Math.abs(dx) / (s.w * DRAG_SPAN))
    if (dx < 0 && idx < last) setDrag({ page: idx, deg: -120 * p, progress: p })
    else if (dx > 0 && idx > 0) setDrag({ page: idx - 1, deg: -180 + 120 * p, progress: 1 - p })
    else setDrag(null)
  }
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current
    start.current = null
    if (!s) return
    const dx = e.clientX - s.x
    const v = dx / Math.max(1, performance.now() - s.t)
    const p = Math.abs(dx) / (s.w * DRAG_SPAN)
    setDrag(null)
    if (!drag) return
    if (dx < 0 && (p > 0.24 || v < -0.45)) go(1)
    else if (dx > 0 && (p > 0.24 || v > 0.45)) go(-1)
  }

  const names = useMemo(() => restaurantIdeas.map((r) => r.name), [])
  const status =
    idx === 0
      ? n > 0
        ? fill(t.countFirst, { n })
        : ''
      : idx === last
        ? ''
        : `${fill(t.count, { i: idx, n })}${n - idx > 0 ? ` · ${fill(t.countLeft, { r: n - idx })}` : ''}`
  const announce = idx === 0 ? restaurant.whenLabel : idx === last ? `${t.closingTitle} ${t.closingNote}` : `${fill(t.count, { i: idx, n })} : ${names[idx - 1]}`

  const pageStyle = (i: number): CSSProperties => {
    const base: CSSProperties = { zIndex: 100 - i }
    if (!drag || drag.page !== i) return base
    return { ...base, transform: `rotateY(${drag.deg}deg)`, ['--shade' as string]: (drag.progress * 0.62).toFixed(3) }
  }

  const pageClass = (i: number) =>
    [
      'rs-pg',
      i < idx && 'is-turned',
      i > idx + 1 && 'is-far',
      i === idx && ready && 'is-active',
      anim?.turning === i && 'is-lifting',
      anim?.under === i && 'is-casting',
      drag?.page === i && 'is-drag',
    ]
      .filter(Boolean)
      .join(' ')

  return (
    <div
      ref={menu}
      className="rs-menu"
      role="group"
      aria-roledescription="menu à feuilleter"
      aria-label={t.ariaLabel}
      tabIndex={-1}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* page 1: when */}
      <section className={pageClass(0)} style={pageStyle(0)} aria-hidden={idx !== 0} data-page="0">
        <span className="rs-frame" />
        <span className="rs-back__label rs-j" style={{ '--j': 0 } as CSSProperties}>{restaurant.whenLabel}</span>
        <span className="rs-rule rs-j" style={{ '--j': 1 } as CSSProperties}><i /></span>
        <p className="rs-pg__when rs-j" style={{ '--j': 2 } as CSSProperties}>{dateLabel ?? restaurant.whenText}</p>
        {n > 0 && <p className="rs-pg__hint rs-j" style={{ '--j': 5 } as CSSProperties}>{t.hint}</p>}
        <span className="rs-pg__shade" />
        <span className="rs-pg__cast" />
      </section>

      {/* ideas: one page each */}
      {restaurantIdeas.map((r, k) => {
        const i = k + 1
        return (
          <section key={r.id} className={pageClass(i)} style={pageStyle(i)} aria-hidden={idx !== i} data-page={i}>
            <span className="rs-frame" />
            <span className="rs-pg__num rs-j" style={{ '--j': 0 } as CSSProperties}>{String(i).padStart(2, '0')}</span>
            <span className="rs-pg__media rs-j" style={{ '--j': 1 } as CSSProperties}>
              {r.image ? (
                <img src={r.image} alt="" loading="lazy" decoding="async" draggable={false} />
              ) : (
                <>
                  <PlateArt letter={r.monogram ?? monogramOf(r.name)} index={k} className="rs-plate" />
                  {t.mediaSlot && <span className="rs-pg__slot">{t.mediaSlot}</span>}
                </>
              )}
            </span>
            <h3 className="rs-pg__name rs-j" style={{ '--j': 2 } as CSSProperties}>{r.name}</h3>
            <span className="rs-rule rs-j" style={{ '--j': 3 } as CSSProperties}><i /></span>
            {r.description && <p className="rs-pg__desc rs-j" style={{ '--j': 4 } as CSSProperties}>{r.description}</p>}
            {(r.info || r.budget) && (
              <p className="rs-pg__info rs-j" style={{ '--j': 5 } as CSSProperties}>
                {r.info && <span>{r.info}</span>}
                {r.budget && <span className="rs-pg__budget">{r.budget}</span>}
              </p>
            )}
            <span className="rs-pg__shade" />
            <span className="rs-pg__cast" />
          </section>
        )
      })}

      {/* closing page */}
      <section className={pageClass(last)} style={pageStyle(last)} aria-hidden={idx !== last} data-page={last}>
        <span className="rs-frame" />
        <Stamp text={restaurant.stamp} className="rs-pg__stamp rs-j" />
        <p className="rs-pg__close rs-j" style={{ '--j': 2 } as CSSProperties}>{t.closingTitle}</p>
        <span className="rs-rule rs-j" style={{ '--j': 3 } as CSSProperties}><i /></span>
        <p className="rs-pg__closenote rs-j" style={{ '--j': 4 } as CSSProperties}>{t.closingNote}</p>
        <span className="rs-pg__shade" />
        <span className="rs-pg__cast" />
      </section>

      <span className="rs-spine" aria-hidden="true" />

      <button type="button" className="rs-menu__turn" aria-label={t.turnBack} onClick={onTurnBack}>
        <RotateCw size={15} aria-hidden="true" />
      </button>

      <div className="rs-menu__bar">
        <button type="button" className="rs-arrow" aria-label={t.prev} disabled={idx === 0} onClick={() => go(-1)}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div className="rs-menu__mid" aria-hidden="true">
          <span className="rs-menu__count">{status}</span>
          <span className="rs-dots">
            {Array.from({ length: total }, (_, k) => (
              <i key={k} className={k === idx ? 'is-on' : k < idx ? 'is-seen' : ''} />
            ))}
          </span>
        </div>
        <button
          type="button"
          className={`rs-arrow${!moved && ready ? ' is-hint' : ''}`}
          aria-label={t.next}
          disabled={idx === last}
          onClick={() => go(1)}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <p className="rs-sr" aria-live="polite">{moved ? announce : ''}</p>
    </div>
  )
}
