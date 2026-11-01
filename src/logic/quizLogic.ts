import type { AnswerIndex, Progress, Question, QuestionState, Stage } from '../types'
import { REWARD_STAGES } from '../types'

export const MAX_ATTEMPTS = 2

/** Mini-games played right after the question at index `after`. */
export const INTERLUDES = [
  { after: 2, stage: 'memory' },
  { after: 5, stage: 'distance' },
] as const

export const initialProgress: Progress = { stage: 'welcome', index: 0, answers: {}, unlocked: 0 }

export type Action =
  | { type: 'start' }
  | { type: 'answer'; option: AnswerIndex }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goto'; stage: Stage }
  | { type: 'restart' }
  | { type: 'reset' }

export const isResolved = (s?: QuestionState, q?: Question) =>
  !!s && (s.correct || (!q?.unlimited && s.wrong.length >= MAX_ATTEMPTS))

/** Every right answer of a question (one for classic questions, several for the football one). */
export const correctSet = (q: Question): AnswerIndex[] => q.correctIndexes ?? [q.correctIndex]

export const getScore = (p: Progress, questions: Question[]) =>
  questions.filter((q) => p.answers[q.id]?.correct).length

/** Pure reducer: all quiz and reward rules live here. */
export function reduce(p: Progress, a: Action, questions: Question[]): Progress {
  const q = questions[p.index]
  switch (a.type) {
    case 'start':
      return p.stage === 'welcome' ? { ...p, stage: 'story' } : p
    case 'answer': {
      if (p.stage !== 'quiz' || !q) return p
      const s = p.answers[q.id] ?? { wrong: [], correct: false }
      if (isResolved(s, q) || s.wrong.includes(a.option) || s.found?.includes(a.option)) return p
      const right = correctSet(q)
      let next: QuestionState
      if (right.includes(a.option)) {
        const found = [...(s.found ?? []), a.option]
        next = { ...s, found, correct: right.every((r) => found.includes(r)) }
      } else {
        next = { ...s, wrong: [...s.wrong, a.option] }
      }
      return { ...p, answers: { ...p.answers, [q.id]: next } }
    }
    case 'next': {
      if (p.stage === 'story') return { ...p, stage: 'quiz' }
      if (p.stage === 'quiz') {
        if (!isResolved(p.answers[q?.id], q)) return p
        if (p.index >= questions.length - 1) return { ...p, stage: 'trophies' }
        const gate = INTERLUDES.find((g) => g.after === p.index)
        return gate ? { ...p, stage: gate.stage } : { ...p, index: p.index + 1 }
      }
      if (p.stage === 'trophies') return { ...p, stage: 'summary' }
      const interlude = INTERLUDES.find((g) => g.stage === p.stage)
      if (interlude) return { ...p, stage: 'quiz', index: interlude.after + 1 }
      if (p.stage === 'summary') return { ...p, stage: 'wish' }
      if (p.stage === 'wish') return { ...p, stage: 'letter', unlocked: Math.max(p.unlocked, 1) }
      const r = REWARD_STAGES.indexOf(p.stage as (typeof REWARD_STAGES)[number])
      if (r === -1) return p
      if (r === REWARD_STAGES.length - 1) return { ...p, stage: 'final', unlocked: REWARD_STAGES.length }
      return { ...p, stage: REWARD_STAGES[r + 1], unlocked: Math.max(p.unlocked, r + 2) }
    }
    case 'back': {
      if (p.stage === 'story') return { ...p, stage: 'welcome' }
      const gateBack = INTERLUDES.find((g) => g.stage === p.stage)
      if (gateBack) return { ...p, stage: 'quiz', index: gateBack.after }
      if (p.stage === 'wish') return { ...p, stage: 'summary' }
      if (p.stage === 'quiz') return p.index > 0 ? { ...p, index: p.index - 1 } : { ...p, stage: 'welcome' }
      if (p.stage === 'summary') return { ...p, stage: 'trophies' }
      if (p.stage === 'trophies') return { ...p, stage: 'quiz', index: questions.length - 1 }
      const r = REWARD_STAGES.indexOf(p.stage as (typeof REWARD_STAGES)[number])
      if (r > 0) return { ...p, stage: REWARD_STAGES[r - 1] }
      if (r === 0) return { ...p, stage: 'summary' }
      if (p.stage === 'final') return { ...p, stage: REWARD_STAGES[REWARD_STAGES.length - 1] }
      return p
    }
    case 'goto': {
      const r = REWARD_STAGES.indexOf(a.stage as (typeof REWARD_STAGES)[number])
      return r !== -1 && r < p.unlocked ? { ...p, stage: a.stage } : p
    }
    case 'restart':
      return { ...initialProgress, stage: 'quiz' }
    case 'reset':
      return initialProgress  }
}
