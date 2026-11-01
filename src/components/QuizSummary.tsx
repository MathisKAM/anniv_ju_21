import { useEffect, useState, type CSSProperties } from 'react'
import { names } from '../content/rewards'
import { isLowPower, prefersReducedMotion } from '../fx/env'
import { BackButton, Button, MaskTitle } from './ui'

/** The ring starts to fill after DELAY; the ticks light up over the same COUNT_MS with the same easing. */
const DELAY = 700
const COUNT_MS = 1700
const DUST = Array.from({ length: 9 }, (_, i) => ({
  x: 8 + ((i * 37) % 84),
  d: 3600 + ((i * 520) % 2600),
  s: 1.6 + (i % 3) * 0.8,
  t: 5200 + ((i * 710) % 2400),
}))

function useCountUp(target: number) {
  const [value, setValue] = useState(0)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion() || target === 0) {
      setValue(target)
      setReady(true)
      return
    }
    let frame = 0
    const id = window.setTimeout(() => {
      setReady(true)
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / COUNT_MS)
        setValue(Math.round(target * (1 - (1 - t) ** 3)))
        if (t < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, DELAY)
    return () => {
      window.clearTimeout(id)
      cancelAnimationFrame(frame)
    }
  }, [target])
  return { value, ready }
}

export function QuizSummary({
  score,
  total,
  onContinue,
  onBack,
  onRestart,
}: {
  score: number
  total: number
  onContinue: () => void
  onBack: () => void
  onRestart: () => void
}) {
  const { value: shown, ready } = useCountUp(score)
  const dust = !isLowPower()

  return (
    <section
      className="center sum"
      aria-labelledby="summary-title"
      style={{ '--cm': `${COUNT_MS}ms`, '--dl': `${DELAY}ms`, '--q': shown / total } as CSSProperties}
    >
      <div className="ring sum__ring" role="img" aria-label={`Score : ${score} sur ${total}`}>
        <span className="sum__halo" />
        {dust && (
          <span className="sum__dust">
            {DUST.map((p, i) => (
              <i key={i} style={{ left: `${p.x}%`, width: p.s, height: p.s, animationDelay: `${p.d}ms`, animationDuration: `${p.t}ms` }} />
            ))}
          </span>
        )}
        <svg viewBox="0 0 120 120">
          <defs>
            <linearGradient id="sumGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#4d2028" />
              <stop offset=".55" stopColor="#a85c61" />
              <stop offset="1" stopColor="#d9b77a" />
            </linearGradient>
          </defs>
          <circle className="ring__track" cx="60" cy="60" r="54" />
          {Array.from({ length: total }, (_, i) => {
            const a = (((i + 1) / total) * 360 * Math.PI) / 180
            return (
              <line
                key={i}
                className={`sum__tick${shown >= i + 1 ? ' is-on' : ''}`}
                x1={60 + Math.cos(a) * 58.5} y1={60 + Math.sin(a) * 58.5}
                x2={60 + Math.cos(a) * 62} y2={60 + Math.sin(a) * 62}
              />
            )
          })}
          <circle
            className="ring__bar"
            cx="60" cy="60" r="54"
            pathLength={100}
            strokeDasharray={`${ready ? (score / total) * 100 : 0} 100`}
          />
        </svg>
        <span className="sum__orbit" style={{ transform: `rotate(${ready ? (score / total) * 360 : 0}deg)` }}>
          <i />
        </span>
        <i className="sum__pulse" />
        <p className="score" aria-hidden="true">
          <span className="sum__n">{shown}</span><span className="score__total"> / {total}</span>
        </p>
      </div>

      <span className="sum__rule" aria-hidden="true" />
      <MaskTitle id="summary-title" className="title title--xl" text={`Quiz terminé, ${names.her} !`} delay={DELAY + COUNT_MS * 0.4} />
      <p className="lead sum__msg">Félicitations, tu es arrivée au bout du quiz !</p>
      <div className="sum__end">
        <Button onClick={onContinue}>Passer à la suite</Button>
        <div className="row">
          <BackButton onClick={onBack} label="Revoir la galerie" />
          <button type="button" className="link" onClick={onRestart}>Rejouer le quiz</button>
        </div>
      </div>
    </section>
  )
}
