import { useState } from 'react'
import { welcome } from '../content/rewards'
import { Button, Eyebrow } from './ui'

/** Same path drives the drawn line and the pen, so the nib follows the ink exactly. */
const HEART =
  'M120 205 C 60 160, 15 125, 15 75 C 15 40, 42 18, 72 18 C 98 18, 114 34, 120 50 C 126 34, 142 18, 168 18 C 198 18, 225 40, 225 75 C 225 125, 180 160, 120 205 Z'

type Phase = 'idle' | 'playing' | 'done'

export function WelcomeScreen({ onStart, skipIntro }: { onStart: () => void; skipIntro: boolean }) {
  const [phase, setPhase] = useState<Phase>(skipIntro ? 'done' : 'idle')

  return (
    <section className="center welcome" data-phase={phase} aria-labelledby="welcome-title">
      <div className="inkheart">
        <svg viewBox="0 0 240 220" aria-hidden="true">
          <path className="inkheart__fill" d={HEART} />
          <path className="inkheart__line" pathLength={1} d={HEART} />
        </svg>
        {phase !== 'done' && (
          <button
            type="button"
            className="pen"
            style={{ offsetPath: `path('${HEART}')` }}
            aria-label="Prendre le stylo pour commencer"
            disabled={phase === 'playing'}
            onClick={() => setPhase('playing')}
          >
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <g transform="translate(6 58) rotate(-45)">
                <path d="M0 0 L14 -4.5 L14 4.5 Z" fill="#8E766B" />
                <path d="M2 0 L12 0" stroke="#F7EEE6" strokeWidth="0.8" />
                <rect x="14" y="-5.5" width="3" height="11" fill="#A85C61" />
                <rect x="17" y="-4.5" width="14" height="9" rx="2" fill="#DCC0B8" />
                <rect x="31" y="-5.5" width="34" height="11" rx="5" fill="#4D2028" />
                <rect x="36" y="-5.5" width="2.5" height="11" fill="#A85C61" />
                <rect x="33" y="-4.8" width="30" height="2" rx="1" fill="#d9b77a" opacity="0.5" />
                <rect x="33" y="3" width="30" height="2" rx="1" fill="#000" opacity="0.25" />
                <rect x="42" y="-3.5" width="18" height="1.6" rx="0.8" fill="#F7EEE6" opacity="0.35" />
              </g>
            </svg>
          </button>
        )}
      </div>
      {phase === 'idle' && <p className="hint pen-hint">Touche le stylo</p>}

      <Eyebrow><span className="ink ink-eyebrow">{welcome.label}</span></Eyebrow>
      <h1 id="welcome-title" className="display ink ink-title">{welcome.title}</h1>
      <p
        className="lead ink ink-lead"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget && phase === 'playing') setPhase('done')
        }}
      >
        {welcome.text}
      </p>
      {phase === 'done' && (
        <div className="ink-cta">
          <Button onClick={onStart}>{welcome.button}</Button>
          <p className="hint">{welcome.duration}</p>
        </div>
      )}
    </section>
  )
}
