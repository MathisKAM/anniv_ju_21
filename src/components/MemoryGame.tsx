import { useEffect, useRef, useState } from 'react'
import { Heart, ImageOff } from 'lucide-react'
import { memoryGame } from '../content/games'
import { nousPhoto } from '../content/photos'
import { BackButton, Button, Eyebrow, MaskTitle } from './ui'

const FACES: { id: string; label: string; src?: string }[] = ([1, 2, 3, 4] as const).map((n) => ({
  id: `photoNous${n}`,
  label: `Photo ${n}`,
  src: nousPhoto(n),
}))

function deal() {
  const deck = [...FACES, ...FACES]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

const FLIP_BACK_MS = 900
const MATCH_MS = 450

export function MemoryGame({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [deck] = useState(deal)
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const won = matched.length === FACES.length

  const flip = (i: number) => {
    if (open.length >= 2 || open.includes(i) || matched.includes(deck[i].id)) return
    const next = [...open, i]
    setOpen(next)
    if (next.length < 2) return
    setMoves((m) => m + 1)
    const [a, b] = next
    if (deck[a].id === deck[b].id) {
      timer.current = window.setTimeout(() => {
        setMatched((m) => [...m, deck[a].id])
        setOpen([])
      }, MATCH_MS)
    } else {
      timer.current = window.setTimeout(() => setOpen([]), FLIP_BACK_MS)
    }
  }

  return (
    <section className="center" aria-labelledby="memory-title">
      <div className="story__back"><BackButton onClick={onBack} label="Revenir à la question" /></div>
      <Eyebrow>{memoryGame.eyebrow}</Eyebrow>
      <MaskTitle id="memory-title" className="title" text={memoryGame.title} />
      <p className="lead">{memoryGame.intro}</p>
      <div className="memory">
        {deck.map((card, i) => {
          const isMatched = matched.includes(card.id)
          const up = isMatched || open.includes(i)
          return (
            <button
              key={i}
              type="button"
              className={`mcard${up ? ' is-up' : ''}${isMatched ? ' is-matched' : ''}`}
              disabled={isMatched}
              aria-label={up ? card.label : 'Carte face cachée'}
              onClick={() => flip(i)}
            >
              <span className="mcard__inner">
                <span className="mcard__face mcard__back" aria-hidden="true"><Heart size={18} strokeWidth={1} /></span>
                <span className="mcard__face mcard__front" aria-hidden="true">
                  {card.src ? (
                    <img className="mcard__photo" src={card.src} alt="" draggable={false} />
                  ) : (
                    <ImageOff size={28} strokeWidth={1.25} />
                  )}
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {won ? (
        <div className="ink-cta" role="status">
          <p className="lead">{memoryGame.done}</p>
          <Button onClick={onNext}>{memoryGame.next}</Button>
        </div>
      ) : (
        <p className="hint" role="status">{moves === 0 ? 'Aucun essai pour l’instant' : `${moves} essai${moves > 1 ? 's' : ''}`}</p>
      )}
    </section>
  )
}
