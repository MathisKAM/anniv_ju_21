import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { letter } from '../content/rewards'
import { prefersReducedMotion } from '../fx/env'
import { BackButton, Eyebrow, MaskTitle } from './ui'
import { Ink, WaxSeal, wordsOf } from './LetterArt'

/** sealed -> breaking (wax cracks and falls) -> opening (flap lifts, sheet rises) -> open (letter unfolds). */
type Seal = 'sealed' | 'breaking' | 'opening' | 'open'

const UNFOLD_MS = 1250
const WORD_MS = 70
const PARAGRAPH_MAX_MS = 3400
const BREAK_TO_OPEN_MS = 1000
const LEAVE_MS = 760

const MOTES = [
  { x: 8, y: 78, d: 0, s: 3 },
  { x: 20, y: 90, d: 1.4, s: 2 },
  { x: 36, y: 84, d: 0.6, s: 2.5 },
  { x: 52, y: 92, d: 2.2, s: 2 },
  { x: 66, y: 80, d: 0.9, s: 3 },
  { x: 80, y: 90, d: 1.8, s: 2 },
  { x: 92, y: 76, d: 0.3, s: 2.5 },
]

export function LetterReward({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [seal, setSeal] = useState<Seal>('sealed')
  const [read, setRead] = useState(false)
  const [skip, setSkip] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<number[]>([])
  const reduced = useMemo(() => prefersReducedMotion(), [])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms))
  }

  // Each text is written at its own pace; the whole letter never drags on, however long it is.
  const plan = useMemo(() => {
    let t = UNFOLD_MS - 150
    const place = (text: string, pause: number) => {
      const n = Math.max(wordsOf(text).length, 1)
      const per = Math.min(WORD_MS, PARAGRAPH_MAX_MS / n)
      const start = t
      t = start + n * per + 380 + pause
      return { start, per }
    }
    const greeting = place(letter.greeting, 380)
    const paragraphs = letter.paragraphs.map((p) => place(p, 480))
    const closing = place(letter.closing, 380)
    const sign = t
    return { greeting, paragraphs, closing, sign, flourish: sign + 1250 }
  }, [])

  const strike = () => {
    if (seal !== 'sealed') return
    setSeal('breaking')
    later(() => setSeal((s) => (s === 'breaking' ? 'opening' : s)), reduced ? 120 : BREAK_TO_OPEN_MS)
  }

  useEffect(() => {
    if (seal !== 'opening') return
    const t = window.setTimeout(() => setSeal('open'), reduced ? 200 : 3400)
    return () => window.clearTimeout(t)
  }, [seal, reduced])

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    later(onNext, reduced ? 0 : LEAVE_MS)
  }

  const cls = ['reward', 'lt', `lt--${seal}`, read && 'is-read', skip && 'is-skip', leaving && 'is-leaving'].filter(Boolean).join(' ')

  return (
    <section className={cls} aria-labelledby="letter-title">
      <BackButton onClick={onBack} />
      <header className="lt-head">
        <Eyebrow>Surprise 01</Eyebrow>
        <MaskTitle id="letter-title" className="title title--xl" text="Quelques mots pour toi" delay={150} />
        <p className="lead">{letter.intro}</p>
      </header>

      <div className="lt-stage">
        <div className="lt-env-clip">
          <div className="lt-env">
            <div className="lt-env__ground" aria-hidden="true" />
            <div className="lt-env__back" aria-hidden="true" />
            <div className="lt-cast" aria-hidden="true" />
            <div
              className="lt-prev"
              aria-hidden="true"
              onAnimationEnd={(e) => {
                if (e.target === e.currentTarget && e.animationName === 'lt-rise') setSeal('open')
              }}
            >
              <i />
              <i />
              <i />
            </div>
            <div className="lt-front" aria-hidden="true">
              <div className="lt-face lt-face--l" />
              <div className="lt-face lt-face--r" />
              <div className="lt-face lt-face--b" />
              <svg className="lt-folds" viewBox="0 0 300 200" preserveAspectRatio="none">
                <defs>
                  <clipPath id="ltTri">
                    <polygon points="0,0 150,116 300,0" />
                  </clipPath>
                  <filter id="ltSoft" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="4" />
                  </filter>
                </defs>
                <g clipPath="url(#ltTri)">
                  <path d="M0 0L150 116L300 0" fill="none" stroke="#2a1216" strokeOpacity="0.3" strokeWidth="12" filter="url(#ltSoft)" />
                </g>
                <g fill="none">
                  <path d="M0 0L150 116L0 200M300 0L150 116L300 200M0 200L150 116L300 200" className="lt-fold-d" vectorEffect="non-scaling-stroke" />
                  <path d="M0 1L150 117L0 201M300 1L150 117L300 201M0 201L150 117L300 201" className="lt-fold-l" vectorEffect="non-scaling-stroke" />
                </g>
              </svg>
              <p className="lt-addr">Pour toi</p>
            </div>
            <div className="lt-flapwrap" aria-hidden="true">
              <div className="lt-flap">
                <div className="lt-flap__out" />
                <div className="lt-flap__in" />
              </div>
            </div>
            {seal !== 'open' && (
              <button
                type="button"
                className={`lt-seal${seal !== 'sealed' ? ' is-breaking' : ''}`}
                aria-label="Briser le sceau pour ouvrir la lettre"
                onClick={strike}
                disabled={seal !== 'sealed'}
                tabIndex={seal === 'sealed' ? 0 : -1}
              >
                <WaxSeal breaking={seal !== 'sealed'} />
              </button>
            )}
          </div>
        </div>
        {(seal === 'sealed' || seal === 'breaking') && (
          <p className={`hint lt-hint${seal === 'breaking' ? ' is-gone' : ''}`}>Touche le sceau</p>
        )}
      </div>

      {seal === 'open' && (
        <>
          <article className="lt-paper" onClick={() => !read && setSkip(true)}>
            <div className="lt-fold" aria-hidden="true" />
            <Ink className="lt-greet" text={letter.greeting} start={plan.greeting.start} per={plan.greeting.per} />
            <div className="lt-body">
              {letter.paragraphs.map((p, i) => (
                <Ink key={i} className="lt-p" text={p} start={plan.paragraphs[i].start} per={plan.paragraphs[i].per} />
              ))}
              <Ink className="lt-p lt-closing" text={letter.closing} start={plan.closing.start} per={plan.closing.per} />
            </div>
            <div className="lt-signoff">
              <p className="lt-sign" style={{ animationDelay: `${plan.sign}ms` }}>
                {letter.signature}
              </p>
              <svg className="lt-flourish" viewBox="0 0 170 16" aria-hidden="true">
                <path
                  d="M3 11C32 3 54 15 88 8S142 5 167 10"
                  pathLength={1}
                  style={{ animationDelay: `${plan.flourish}ms` }}
                  onAnimationEnd={() => setRead(true)}
                />
              </svg>
            </div>
            {read && (
              <div className="lt-motes" aria-hidden="true">
                {MOTES.map((m, i) => (
                  <i key={i} style={{ left: `${m.x}%`, top: `${m.y}%`, width: m.s, height: m.s, animationDelay: `${m.d}s` }} />
                ))}
              </div>
            )}
          </article>
          {read && (
            <div className="lt-end">
              <button type="button" className="btn btn--primary" onClick={leave} disabled={leaving}>
                Passer à la suite
              </button>
            </div>
          )}
        </>
      )}

      {leaving && createPortal(<div className="lt-light" aria-hidden="true" />, document.body)}
    </section>
  )
}
