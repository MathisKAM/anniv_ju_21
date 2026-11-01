import { Check, RotateCcw } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import { defaultFeedback } from '../content/quiz'
import { isResolved } from '../logic/quizLogic'
import { prefersReducedMotion } from '../fx/env'
import type { Question, QuestionState } from '../types'
import { Button } from './ui'

export function FeedbackPanel({
  question,
  state,
  isLast,
  onNext,
}: {
  question: Question
  state: QuestionState
  isLast: boolean
  onNext: () => void
}) {
  const resolved = isResolved(state, question)
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (resolved) box.current?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [resolved])
  let title = ''
  let message = ''
  if (state.correct) {
    title = 'Bonne réponse !'
    message = question.successMessage ?? defaultFeedback.success
  } else if (resolved) {
    title = 'On passe à la suite'
    message = defaultFeedback.reveal
  } else if (state.wrong.length === 1 || (question.unlimited && state.wrong.length > 0)) {
    title = 'Pas tout à fait'
    message = question.retryMessage ?? defaultFeedback.retry
  }

  // In the lab scene the in-scene card already carries the "good answer" message.
  const sceneOwnsTitle = question.kind === 'lab' && state.correct

  return (
    <div className="feedback" role="status" aria-live="polite" ref={box}>
      {title && (
        <div className={`feedback__box${state.correct ? ' is-success' : ''}`}>
          {!sceneOwnsTitle && (
            <p className="feedback__title">
              {state.correct && (
                <span className="feedback__check" aria-hidden="true">
                  <Check size={16} strokeWidth={2.5} />
                  <span className="burst">
                    {Array.from({ length: 8 }, (_, i) => (
                      <i key={i} style={{ '--a': `${i * 45}deg` } as CSSProperties} />
                    ))}
                  </span>
                </span>
              )}
              {!resolved && <RotateCcw size={16} aria-hidden="true" />}
              {title}
            </p>
          )}
          {!sceneOwnsTitle && <p className="feedback__text">{message}</p>}
          {resolved && question.explanation && <p className="feedback__fact">{question.explanation}</p>}
        </div>
      )}
      {resolved && <Button onClick={onNext}>{isLast ? 'Voir mon résumé' : 'Question suivante'}</Button>}
    </div>
  )
}
