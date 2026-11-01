import type { AnswerIndex, Progress, Question, QuestionState, Stage } from '../types'
import { INTERLUDES, correctSet, initialProgress, isResolved } from './quizLogic'

const KEY = 'anniv-surprise:v1'
const STAGES: Stage[] = ['welcome', 'story', 'memory', 'distance', 'wish', 'quiz', 'trophies', 'summary', 'letter', 'restaurant', 'gift', 'final']
const REWARD_ORDER: Stage[] = ['letter', 'restaurant', 'gift']

const isOption = (v: unknown): v is AnswerIndex => v === 0 || v === 1 || v === 2 || v === 3

/** Reads and sanitises saved progress; falls back to a fresh state on anything suspicious. */
export function loadProgress(questions: Question[]): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialProgress
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return initialProgress
    const d = data as Record<string, unknown>

    const answers: Progress['answers'] = {}
    const saved = typeof d.answers === 'object' && d.answers !== null ? (d.answers as Record<string, unknown>) : {}
    for (const q of questions) {
      const s = saved[q.id] as Partial<QuestionState> | undefined
      if (!s || !Array.isArray(s.wrong)) continue
      const right = correctSet(q)
      const wrong = [...new Set(s.wrong.filter(isOption))].filter((o) => !right.includes(o) && o < q.options.length).slice(0, q.unlimited ? 3 : 2)
      const found = Array.isArray(s.found) ? [...new Set(s.found.filter(isOption))].filter((o) => right.includes(o)) : []
      answers[q.id] = { wrong, correct: s.correct === true, ...(found.length ? { found } : {}) }
    }

    const firstOpen = questions.findIndex((q) => !isResolved(answers[q.id], q))
    const stage = STAGES.includes(d.stage as Stage) ? (d.stage as Stage) : 'welcome'
    const unlocked = typeof d.unlocked === 'number' ? Math.min(3, Math.max(0, Math.floor(d.unlocked))) : 0
    const rawIndex = typeof d.index === 'number' ? Math.floor(d.index) : 0
    const index = Math.min(questions.length - 1, Math.max(0, rawIndex))

    // Mini-game screens are only valid right after their question.
    const gate = INTERLUDES.find((g) => g.stage === stage)
    if (gate) {
      const valid = index === gate.after && isResolved(answers[questions[gate.after]?.id], questions[gate.after])
      return valid
        ? { stage, index, answers, unlocked: 0 }
        : { stage: 'quiz', index: Math.min(index, firstOpen === -1 ? questions.length - 1 : firstOpen), answers, unlocked: 0 }
    }

    // Quiz unfinished: cannot be past it.
    if (firstOpen !== -1) {
      if (stage === 'welcome' || stage === 'story') return { stage, index: 0, answers, unlocked: 0 }
      return { stage: 'quiz', index: Math.min(index, firstOpen), answers, unlocked: 0 }
    }
    if (stage === 'welcome' || stage === 'story' || stage === 'quiz') return { stage, index, answers, unlocked }
    if (stage === 'trophies' || stage === 'summary') return { stage, index, answers, unlocked }
    const r = REWARD_ORDER.indexOf(stage)
    if (stage === 'final' && unlocked < 3) return { stage: 'summary', index, answers, unlocked }
    if (r !== -1 && r >= unlocked) return { stage: 'summary', index, answers, unlocked }
    return { stage, index, answers, unlocked }
  } catch {
    return initialProgress
  }
}

export function saveProgress(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable: the experience still works without persistence */
  }
}
