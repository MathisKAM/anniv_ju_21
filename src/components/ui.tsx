import { ArrowLeft } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
}) {
  return (
    <button type="button" className={`btn btn--${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function BackButton({ onClick, label = 'Retour' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="back" onClick={onClick}>
      <ArrowLeft size={18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

const LAYERS = [
  { n: 11, size: 1.5, opacity: 0.4, dur: 90 },
  { n: 8, size: 2.5, opacity: 0.6, dur: 60 },
  { n: 5, size: 3.5, opacity: 0.9, dur: 40 },
]

/** Three star depths drifting slightly at different speeds (a slow camera move). */
export function Sky() {
  return (
    <div className="sky story__sky" aria-hidden="true">
      {LAYERS.map((l, li) => (
        <div key={li} className="sky__layer" style={{ '--dur': `${l.dur}s`, '--dir': li % 2 ? 1 : -1 } as CSSProperties}>
          {Array.from({ length: l.n }, (_, i) => {
            const k = i * (li + 3)
            return (
              <span
                key={i}
                style={{
                  left: `${(k * 37 + li * 19) % 100}%`,
                  top: `${(k * 53 + li * 7 + 11) % 100}%`,
                  width: l.size,
                  height: l.size,
                  animationDelay: `${(i % 5) * 0.8}s`,
                  '--o': l.opacity,
                } as CSSProperties}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** Heading whose words rise out of a mask one after the other. */
export function MaskTitle({
  as: Tag = 'h1',
  id,
  className,
  text,
  delay = 0,
  step = 70,
}: {
  as?: 'h1' | 'h2'
  id?: string
  className?: string
  text: string
  delay?: number
  step?: number
}) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={`${className ?? ''} mask`} aria-label={text}>
      {words.map((w, i) => (
        <span key={i}>
          <span className="mask__w" aria-hidden="true">
            <span className="mask__i" style={{ animationDelay: `${delay + i * step}ms` }}>{w}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}
