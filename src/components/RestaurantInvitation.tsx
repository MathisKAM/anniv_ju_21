import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarPlus, RotateCw } from 'lucide-react'
import { restaurant } from '../content/rewards'
import { downloadInvitation } from '../logic/calendar'
import { prefersReducedMotion } from '../fx/env'
import { BackButton, Button, Eyebrow, MaskTitle } from './ui'
import { ScratchReveal } from './ScratchReveal'
import { GoldDefs, PlaceSetting } from './RestaurantArt'
import { RestaurantMenu } from './RestaurantMenu'

const LEAVE_MS = 860

export function RestaurantInvitation({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [revealed, setRevealed] = useState(false)
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [turned, setTurned] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timers = useRef<number[]>([])
  const reduced = useMemo(() => prefersReducedMotion(), [])

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const flip = () => {
    if (!revealed || leaving) return
    setTurned(true)
    setSide((s) => (s === 'front' ? 'back' : 'front'))
  }

  const leave = () => {
    if (leaving) return
    setLeaving(true)
    timers.current.push(window.setTimeout(onNext, reduced ? 0 : LEAVE_MS))
  }

  const cardLabel = `Invitation : ${restaurant.cardTitle}. ${restaurant.note}. ${revealed ? 'Touche la carte pour la retourner et feuilleter le menu.' : ''}`

  const inner = ['rs-card__inner', turned && (side === 'back' ? 'is-to-back' : 'is-to-front'), revealed && !turned && 'is-nudge']
    .filter(Boolean)
    .join(' ')

  return (
    <section className={`reward rs${leaving ? ' is-leaving' : ''}${turned ? ' is-turned' : ''}${side === 'back' ? ' is-back' : ''}`} aria-labelledby="resto-title">
      <BackButton onClick={onBack} />
      <header className="rs-head">
        <Eyebrow>Surprise 02</Eyebrow>
        <MaskTitle id="resto-title" className="title title--xl" text="Notre prochain rendez-vous" delay={150} />
        <p className="lead">{restaurant.message}</p>
      </header>

      <div className="rs-stage">
        <GoldDefs />
        <ScratchReveal
          onReveal={() => setRevealed(true)}
          after={turned ? null : <p className="hint rs-hint">{restaurant.flipHint}</p>}
        >
          <div className="rs-flip">
            <span className="rs-ground" aria-hidden="true" data-turn={turned ? side : undefined} />
            <div className={`rs-card${revealed ? ' is-live' : ''}`}>
              <span className={inner}>
                <span className="rs-edge rs-edge--t" aria-hidden="true" />
                <span className="rs-edge rs-edge--b" aria-hidden="true" />
                <span className="rs-edge rs-edge--l" aria-hidden="true" />
                <span className="rs-edge rs-edge--r" aria-hidden="true" />

                <span className="rs-face rs-face--front" aria-hidden="true">
                  <span className="rs-frame" />
                  <span className="rs-front__label">{restaurant.cardLabel}</span>
                  <PlaceSetting className="rs-art" />
                  <span className="rs-front__title">{restaurant.cardTitle}</span>
                  <span className="rs-rule"><i /></span>
                  <span className="rs-front__note">{restaurant.note}</span>
                  <RotateCw className="rs-turn-ico" aria-hidden="true" />
                  <span className="rs-shade" />
                  <span className="rs-glint" />
                </span>

                <span className="rs-face rs-face--back" aria-hidden={side !== 'back'}>
                  <RestaurantMenu active={side === 'back' && !leaving} onTurnBack={flip} />
                  <span className="rs-shade" />
                  <span className="rs-glint" />
                </span>
              </span>
              {side === 'front' && (
                <button type="button" className="rs-hit" aria-label={cardLabel} disabled={!revealed} onClick={flip} />
              )}
            </div>
          </div>
        </ScratchReveal>
      </div>

      {revealed && (
        <div className="reward__actions rs-actions">
          {restaurant.dateISO && (
            <Button
              variant="ghost"
              onClick={() => downloadInvitation(restaurant.dateISO!, restaurant.cardTitle, restaurant.restaurantName)}
            >
              <CalendarPlus size={18} aria-hidden="true" /> Ajouter au calendrier
            </Button>
          )}
          <Button onClick={leave}>Passer à la suite</Button>
        </div>
      )}

      {leaving && createPortal(<div className="rs-dim" aria-hidden="true" />, document.body)}
    </section>
  )
}
