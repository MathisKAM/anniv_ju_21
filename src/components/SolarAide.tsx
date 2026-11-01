import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { solarText } from '../content/quiz'
import { PLANETS } from './PlanetArt'

const T = solarText.aide

/** Small help box above the solar system game: the first hint is visible right away. */
export function SolarAide() {
  const [hint2, setHint2] = useState(false)
  const [solution, setSolution] = useState(false)

  return (
    <aside className="aide" aria-label={T.title}>
      <p className="aide__title">
        <Lightbulb size={14} strokeWidth={1.6} aria-hidden="true" /> {T.title}
      </p>
      <p className="aide__hint">{T.hint1}</p>
      {hint2 && (
        <p className="aide__more">
          <strong>{T.hint2Title}</strong> {T.hint2}
        </p>
      )}
      {solution && (
        <div className="aide__more">
          <strong>{T.solutionTitle}</strong>
          <ol className="aide__list">
            {PLANETS.map((p) => (
              <li key={p.name}>{p.name}</li>
            ))}
          </ol>
        </div>
      )}
      {(!hint2 || !solution) && (
        <div className="aide__actions">
          {!hint2 && (
            <button type="button" className="aide__btn" onClick={() => setHint2(true)}>
              {T.hint2Button}
            </button>
          )}
          {!solution && (
            <button type="button" className="aide__btn" onClick={() => setSolution(true)}>
              {T.solutionButton}
            </button>
          )}
        </div>
      )}
    </aside>
  )
}
