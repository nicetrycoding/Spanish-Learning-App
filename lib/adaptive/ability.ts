/**
 * Shared logistic ability-update math (Elo-derived) on the continuous 0
 * (A0) – 6.9 (high C2) CEFR scale. Used both by the placement test (large
 * learning rate — form a strong estimate fast from few items) and by
 * ongoing SkillProfile updates from regular practice (small learning rate
 * — nudge gradually so one lucky/unlucky answer can't swing your level).
 */
const LOGISTIC_SCALE = 1.6;

export function expectedProbability(ability: number, difficulty: number): number {
  return 1 / (1 + Math.pow(10, (difficulty - ability) / LOGISTIC_SCALE));
}

export function updateAbilityContinuous(
  ability: number,
  difficulty: number,
  isCorrect: boolean,
  learningRate: number,
): number {
  const expected = expectedProbability(ability, difficulty);
  const outcome = isCorrect ? 1 : 0;
  const next = ability + learningRate * (outcome - expected);
  return Math.max(0, Math.min(6.9, next));
}

/** Ongoing (post-placement) skill-profile nudges use a gentle learning rate. */
export const ONGOING_LEARNING_RATE = 0.12;
