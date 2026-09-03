import { fromContinuous, type CEFRLevelKey } from "@/lib/cefr";
import { updateAbilityContinuous } from "@/lib/adaptive/ability";
import {
  PLACEMENT_ITEMS_BY_SKILL,
  PLACEMENT_SKILLS,
  type PlacementItem,
  type PlacementSkill,
} from "./item-bank";

const LEARNING_RATE = 0.9;
const MIN_ITEMS_PER_SKILL = 4;
const MAX_ITEMS_PER_SKILL = 7;

export interface PlacementAnswer {
  itemId: string;
  skill: PlacementSkill;
  difficulty: number;
  isCorrect: boolean;
  userAnswer: unknown;
}

export interface AbilityState {
  bySkill: Record<PlacementSkill, number>;
}

export function createInitialAbility(seed = 1.0): AbilityState {
  return {
    bySkill: { GRAMMAR: seed, VOCABULARY: seed, READING: seed, LISTENING: seed },
  };
}

export function updateAbility(ability: number, difficulty: number, isCorrect: boolean): number {
  return updateAbilityContinuous(ability, difficulty, isCorrect, LEARNING_RATE);
}

/**
 * Picks the next item for a skill: the unused item whose difficulty is
 * closest to the current ability estimate (the core "increase difficulty
 * based on performance" adaptive behavior), with a small random jitter so
 * ties don't always resolve the same way.
 */
export function selectNextItem(
  skill: PlacementSkill,
  ability: number,
  askedIds: Set<string>,
): PlacementItem | null {
  const pool = PLACEMENT_ITEMS_BY_SKILL[skill].filter((i) => !askedIds.has(i.id));
  if (pool.length === 0) return null;

  let best = pool[0];
  let bestScore = Infinity;
  for (const item of pool) {
    const jitter = (hashString(item.id) % 10) / 100; // deterministic tiny jitter, avoids bias
    const score = Math.abs(item.difficulty - ability) + jitter;
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Decides whether a skill has enough signal to stop early: once the
 * minimum item count is reached, if the last two answers "bracketed" the
 * learner (one right, one wrong, at similar difficulty) we're confident
 * enough in the estimate to move on rather than grinding through every
 * remaining item in the bank.
 */
export function skillConverged(answersForSkill: PlacementAnswer[]): boolean {
  if (answersForSkill.length < MIN_ITEMS_PER_SKILL) return false;
  if (answersForSkill.length >= MAX_ITEMS_PER_SKILL) return true;

  const lastTwo = answersForSkill.slice(-2);
  if (lastTwo.length === 2) {
    const [a, b] = lastTwo;
    const bracketed = a.isCorrect !== b.isCorrect && Math.abs(a.difficulty - b.difficulty) < 1.2;
    if (bracketed) return true;
  }
  return false;
}

export interface PlacementProgress {
  currentSkillIndex: number;
  askedIds: Set<string>;
  ability: AbilityState;
  answers: PlacementAnswer[];
}

export function nextStep(progress: PlacementProgress): {
  done: boolean;
  item: PlacementItem | null;
  skill: PlacementSkill | null;
} {
  let skillIndex = progress.currentSkillIndex;

  while (skillIndex < PLACEMENT_SKILLS.length) {
    const skill = PLACEMENT_SKILLS[skillIndex];
    const answersForSkill = progress.answers.filter((a) => a.skill === skill);

    if (skillConverged(answersForSkill)) {
      skillIndex++;
      continue;
    }

    const item = selectNextItem(skill, progress.ability.bySkill[skill], progress.askedIds);
    if (!item) {
      skillIndex++;
      continue;
    }

    return { done: false, item, skill };
  }

  return { done: true, item: null, skill: null };
}

export interface SkillResult {
  level: CEFRLevelKey;
  sub: number;
  score: number; // 0-100, share correct
}

export interface PlacementResult {
  overallLevel: CEFRLevelKey;
  overallSub: number;
  bySkill: Record<PlacementSkill, SkillResult>;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
}

const SKILL_LABEL: Record<PlacementSkill, string> = {
  GRAMMAR: "Grammar",
  VOCABULARY: "Vocabulary",
  READING: "Reading",
  LISTENING: "Listening",
};

export function computeResult(ability: AbilityState, answers: PlacementAnswer[]): PlacementResult {
  const bySkill = {} as Record<PlacementSkill, SkillResult>;
  let sum = 0;
  let count = 0;

  for (const skill of PLACEMENT_SKILLS) {
    const { level, sub } = fromContinuous(ability.bySkill[skill]);
    const skillAnswers = answers.filter((a) => a.skill === skill);
    const correct = skillAnswers.filter((a) => a.isCorrect).length;
    const score = skillAnswers.length ? Math.round((correct / skillAnswers.length) * 100) : 0;
    bySkill[skill] = { level, sub, score };
    sum += ability.bySkill[skill];
    count++;
  }

  const overallContinuous = count ? sum / count : 1;
  const { level: overallLevel, sub: overallSub } = fromContinuous(overallContinuous);

  const entries = Object.entries(bySkill) as [PlacementSkill, SkillResult][];
  const sorted = [...entries].sort((a, b) => b[1].score - a[1].score);
  const strengths = sorted.slice(0, 2).map(([skill]) => SKILL_LABEL[skill]);
  const weaknesses = sorted
    .slice(-2)
    .map(([skill]) => SKILL_LABEL[skill])
    .reverse();

  const recommendation = `Start in ${overallLevel} — your ${weaknesses[0]?.toLowerCase() ?? "weaker skills"} could use the most attention early on, while your ${strengths[0]?.toLowerCase() ?? "stronger skills"} are ahead of the rest.`;

  return { overallLevel, overallSub, bySkill, strengths, weaknesses, recommendation };
}
