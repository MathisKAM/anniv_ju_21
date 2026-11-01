import type { CSSProperties } from 'react'

const LETTERS = ['A', 'B', 'C', 'D']

/** Text version of the four answers, under a scene (same look as the football legend). */
export function SceneLegend({
  options,
  statusOf,
  hover,
  setHover,
  locked,
  onPick,
}: {
  options: readonly string[]
  statusOf: (i: number) => '' | 'found' | 'wrong'
  hover: number | null
  setHover: (i: number | null) => void
  locked: boolean
  onPick: (i: number) => void
}) {
  return (
    <ul className="fb__legend">
      {LETTERS.map((l, i) => {
        const st = statusOf(i)
        return (
          <li key={l}>
            <button
              type="button"
              className={`fb-chip${st ? ` is-${st}` : ''}${hover === i ? ' is-hover' : ''}`}
              disabled={locked || st === 'found'}
              onClick={() => onPick(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              style={{ '--i': i } as CSSProperties}
            >
              <span className="fb-chip__l">{l}</span>
              <span>{options[i]}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
