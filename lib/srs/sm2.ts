/**
 * Spaced repetition scheduling, derived from SM-2 (SuperMemo-2) with a
 * confidence-aware adjustment. Used for both vocabulary review and the
 * unified ReviewItem queue (grammar concepts, recurring mistakes).
 */

export type Quality = 0 | 1 | 2 | 3 | 4 | 5; // 0-2 = fail, 3-5 = pass, higher = easier

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
}

export interface SrsResult extends SrsState {
  nextReviewAt: Date;
}

/**
 * Maps a correctness + confidence pair to an SM-2 quality score.
 * High confidence + correct -> 5 (strong). Low confidence + correct -> 3
 * (unstable — schedule sooner than a confident correct answer).
 * High confidence + wrong -> 0 (possible misconception — needs the
 * shortest interval). Low confidence + wrong -> 2.
 */
export function qualityFromOutcome(
  isCorrect: boolean,
  confidence?: "NOT_SURE" | "SOMEWHAT_SURE" | "VERY_SURE" | null,
): Quality {
  if (isCorrect) {
    if (confidence === "VERY_SURE") return 5;
    if (confidence === "SOMEWHAT_SURE") return 4;
    if (confidence === "NOT_SURE") return 3;
    return 4;
  }
  if (confidence === "VERY_SURE") return 0; // high confidence + wrong = misconception
  if (confidence === "SOMEWHAT_SURE") return 1;
  return 2;
}

export function scheduleNext(state: SrsState, quality: Quality, now: Date = new Date()): SrsResult {
  let { easeFactor, intervalDays, repetitions } = state;

  if (quality < 3) {
    // Failure resets repetitions but keeps ease from collapsing entirely.
    repetitions = 0;
    intervalDays = quality === 0 ? 0.25 : 0.5; // misconception: review same/next day
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor * 10) / 10;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  const nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return { easeFactor, intervalDays, repetitions, nextReviewAt };
}

/**
 * Forgetting-curve estimate (0-1 probability the learner has now forgotten
 * the item), used as one input to review priority. Ebbinghaus-style decay
 * scaled by the item's ease factor (a proxy for item stability/strength).
 */
export function forgettingProbability(
  daysSinceReview: number,
  easeFactor: number,
  repetitions: number,
): number {
  if (repetitions === 0) return 0.9;
  const stability = Math.max(1, easeFactor * repetitions);
  const p = 1 - Math.exp(-daysSinceReview / stability);
  return Math.max(0, Math.min(1, p));
}

export interface ReviewPriorityInputs {
  forgettingProbability: number; // 0-1
  errorFrequency: number; // raw count, will be normalized
  difficulty: number; // 1-10
  daysOverdue: number; // negative if not yet due
  importance: number; // 0-1 (CEFR relevance / frequency-in-language weight)
  confidence?: number; // 0-1, lower = less stable knowledge
}

/**
 * Combines forgetting probability + error frequency + difficulty + recency
 * + importance + confidence into a single 0-1 priority score used to sort
 * the review queue. See product spec's "Intelligent Review Algorithm".
 */
export function computeReviewPriority(inputs: ReviewPriorityInputs): number {
  const overdueBoost = Math.max(0, Math.min(1, inputs.daysOverdue / 7)); // saturates at 1 week overdue
  const errorBoost = Math.min(1, inputs.errorFrequency / 5);
  const difficultyBoost = inputs.difficulty / 10;
  const confidencePenalty = inputs.confidence !== undefined ? 1 - inputs.confidence : 0.3;

  const score =
    inputs.forgettingProbability * 0.3 +
    overdueBoost * 0.25 +
    errorBoost * 0.2 +
    inputs.importance * 0.15 +
    difficultyBoost * 0.05 +
    confidencePenalty * 0.05;

  return Math.max(0, Math.min(1, score));
}
