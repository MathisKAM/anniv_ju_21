import type { CSSProperties } from 'react'
import { Check, X } from 'lucide-react'
import type { OptionArtKind } from '../types'
import { OptionArt } from './OptionArt'

export type OptionStatus = 'idle' | 'wrong' | 'correct' | 'revealed' | 'disabled'

const LETTERS = ['A', 'B', 'C', 'D']

export function AnswerOption({
  index,
  text,
  status,
  shake,
  art,
  onSelect,
}: {
  index: number
  text: string
  status: OptionStatus
  shake: boolean
  art?: OptionArtKind
  onSelect: () => void
}) {
  const locked = status !== 'idle'
  return (
    <li className="answer-li" style={{ '--i': index } as CSSProperties}>
      <button
        type="button"
        className={`answer answer--${status}${art ? ` answer--art art-${art}` : ''}${shake ? ' is-shaking' : ''}`}
        onClick={onSelect}
        aria-disabled={locked}
        disabled={locked}
      >
        {art && <OptionArt kind={art} />}
        <span className="answer__letter" aria-hidden="true">{LETTERS[index]}</span>
        <span className="answer__text">{text}</span>
        {(status === 'correct' || status === 'revealed') && (
          <Check className="answer__icon" size={18} aria-label="Bonne réponse" />
        )}
        {status === 'wrong' && <X className="answer__icon" size={18} aria-label="Mauvaise réponse" />}
      </button>
    </li>
  )
}
