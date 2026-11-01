import { useState } from 'react'
import type { AnswerIndex, Progress, Question } from '../types'
import { isResolved } from '../logic/quizLogic'
import { AnswerOption, type OptionStatus } from './AnswerOption'
import { FeedbackPanel } from './FeedbackPanel'
import { BackButton, MaskTitle } from './ui'
import { FootballGame } from './FootballGame'
import { SolarGame } from './SolarGame'
import { SolarAide } from './SolarAide'
import { AnimalField } from './AnimalField'
import { MealTable } from './MealTable'
import { LabGame } from './LabGame'
import { VenusGame } from './VenusGame'
import { ArcadeGame } from './ArcadeGame'

export function QuizQuestion({
  question,
  state,
  isLast,
  onAnswer,
  onNext,
}: {
  question: Question
  state: { wrong: AnswerIndex[]; correct: boolean; found?: AnswerIndex[] }
  isLast: boolean
  onAnswer: (o: AnswerIndex) => void
  onNext: () => void
}) {
  const [lastTried, setLastTried] = useState<AnswerIndex | null>(null)
  const resolved = isResolved(state, question)

  const statusOf = (i: number): OptionStatus => {
    if (state.wrong.includes(i as AnswerIndex)) return 'wrong'
    if (i === question.correctIndex) {
      if (state.correct) return 'correct'
      if (resolved) return 'revealed'
    }
    return resolved ? 'disabled' : 'idle'
  }

  return (
    <>
      {question.kind === 'arcade' ? null : (
        <MaskTitle as="h2" className="question" id="question-title" text={question.text} step={35} />
      )}
      {question.kind === 'arcade' ? (
        <ArcadeGame question={question} state={state} onAnswer={onAnswer} />
      ) : question.kind === 'football' ? (
        <FootballGame question={question} state={state} onAnswer={onAnswer} />
      ) : question.kind === 'planets' ? (
        <div className="sg-wrap">
          <SolarAide />
          <SolarGame solved={state.correct} onSolved={() => onAnswer(0)} />
        </div>
      ) : question.kind === 'animals' ? (
        <AnimalField question={question} state={state} onAnswer={onAnswer} />
      ) : question.kind === 'lab' ? (
        <LabGame question={question} state={state} onAnswer={onAnswer} />
      ) : question.kind === 'venus' ? (
        <VenusGame question={question} state={state} onAnswer={onAnswer} />
      ) : question.kind === 'meal' ? (
        <MealTable question={question} state={state} onAnswer={onAnswer} />
      ) : (
      <ul className={`answers${question.options.length === 2 ? ' answers--duo' : ''}`} aria-labelledby="question-title">
        {question.options.map((text, i) => (
          <AnswerOption
            key={i}
            index={i}
            text={text}
            status={statusOf(i)}
            art={question.optionArt?.[i]}
            shake={lastTried === i && state.wrong.includes(i as AnswerIndex)}
            onSelect={() => {
              setLastTried(i as AnswerIndex)
              onAnswer(i as AnswerIndex)
            }}
          />
        ))}
      </ul>
      )}
      <FeedbackPanel question={question} state={state} isLast={isLast} onNext={onNext} />
    </>
  )
}

export function QuizScreen({
  questions,
  progress,
  onAnswer,
  onNext,
  onBack,
}: {
  questions: Question[]
  progress: Progress
  onAnswer: (o: AnswerIndex) => void
  onNext: () => void
  onBack: () => void
}) {
  const question = questions[progress.index]
  const state = progress.answers[question.id] ?? { wrong: [], correct: false }
  return (
    <section className="quiz" aria-label="Quiz">
      <BackButton onClick={onBack} />
      <p className="counter">Question {progress.index + 1} sur {questions.length}</p>
      {/* key remounts the question so it fades in and transient state resets */}
      <div className="question-wrap" key={question.id}>
        <QuizQuestion
          question={question}
          state={state}
          isLast={progress.index === questions.length - 1}
          onAnswer={onAnswer}
          onNext={onNext}
        />
      </div>
    </section>
  )
}
