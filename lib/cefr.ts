export const CEFR_LEVELS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CEFRLevelKey = (typeof CEFR_LEVELS)[number];

export const CEFR_LABELS: Record<CEFRLevelKey, string> = {
  A0: "Absolute Beginner",
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export const SKILLS = ["GRAMMAR", "VOCABULARY", "READING", "LISTENING", "WRITING", "SPEAKING"] as const;
export type SkillKey = (typeof SKILLS)[number];

export const SKILL_LABELS: Record<SkillKey, string> = {
  GRAMMAR: "Grammar",
  VOCABULARY: "Vocabulary",
  READING: "Reading",
  LISTENING: "Listening",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

export function levelIndex(level: CEFRLevelKey): number {
  return CEFR_LEVELS.indexOf(level);
}

export function levelFromIndex(index: number): CEFRLevelKey {
  return CEFR_LEVELS[Math.max(0, Math.min(CEFR_LEVELS.length - 1, index))];
}

/** Continuous 0..7 scale combining level + fractional sub-level, for math/sorting. */
export function toContinuous(level: CEFRLevelKey, sub: number): number {
  return levelIndex(level) + Math.max(0, Math.min(0.99, sub));
}

export function fromContinuous(value: number): { level: CEFRLevelKey; sub: number } {
  const clamped = Math.max(0, Math.min(CEFR_LEVELS.length - 0.01, value));
  const idx = Math.floor(clamped);
  return { level: levelFromIndex(idx), sub: Math.round((clamped - idx) * 10) / 10 };
}

/** Displays a fine-grained sub-level, e.g. "B1.4" — see product spec's skill map. */
export function formatSubLevel(level: CEFRLevelKey, sub: number): string {
  const tenths = Math.round(Math.max(0, Math.min(0.9, sub)) * 10);
  return `${level}.${tenths}`;
}

export function nextLevel(level: CEFRLevelKey): CEFRLevelKey {
  return levelFromIndex(levelIndex(level) + 1);
}

export function previousLevel(level: CEFRLevelKey): CEFRLevelKey {
  return levelFromIndex(levelIndex(level) - 1);
}

export const LEVEL_COLOR_VAR: Record<CEFRLevelKey, string> = {
  A0: "var(--level-a0)",
  A1: "var(--level-a1)",
  A2: "var(--level-a2)",
  B1: "var(--level-b1)",
  B2: "var(--level-b2)",
  C1: "var(--level-c1)",
  C2: "var(--level-c2)",
};
