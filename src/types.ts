export type AnswerIndex = 0 | 1 | 2 | 3

export type OptionArtKind = 'computer' | 'network' | 'servers' | 'telecom'

export type QuestionKind = 'choice' | 'football' | 'planets' | 'animals' | 'meal' | 'lab' | 'venus' | 'arcade'

export interface Question {
  id: string
  /** choice (default) = classic multiple choice; the others are interactive mini-games played inside the quiz. */
  kind?: QuestionKind
  text: string
  /** Not displayed for planets (the game has its own pieces). Two or four answers. */
  options: string[]
  /** Optional discreet background illustration for each answer (same order as options). */
  optionArt?: OptionArtKind[]
  correctIndex: AnswerIndex
  /** No attempt limit: wrong answers never end the question, only the right one does. */
  unlimited?: boolean  /** Several right answers (all must be found). Includes correctIndex. */
  correctIndexes?: AnswerIndex[]
  /** Shown once the question is resolved (correct, or answer revealed). */
  explanation?: string
  /** Replaces the default message on a correct answer. */
  successMessage?: string
  /** Replaces the default message after a first wrong attempt. */
  retryMessage?: string
}

export interface QuestionState {
  /** Indexes of wrong options already tried. */
  wrong: AnswerIndex[]
  correct: boolean
  /** Right answers already found, for questions that have several. */
  found?: AnswerIndex[]
}

export type Stage = 'welcome' | 'story' | 'quiz' | 'memory' | 'distance' | 'wish' | 'trophies' | 'summary' | 'letter' | 'restaurant' | 'gift' | 'final'

export const REWARD_STAGES = ['letter', 'restaurant', 'gift'] as const
export type RewardStage = (typeof REWARD_STAGES)[number]

export interface Progress {
  stage: Stage
  /** Index of the question currently displayed. */
  index: number
  answers: Record<string, QuestionState>
  /** Number of rewards unlocked (0 to 3). */
  unlocked: number
}
