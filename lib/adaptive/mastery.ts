/**
 * Mastery is tracked as five independent 0-100 components rather than a
 * single "completed" flag — see product spec's Mastery System. The
 * aggregate `mastery` score is a weighted blend that requires *production*
 * (active recall) to reach high values, not just passive exposure.
 */
export interface MasteryComponents {
  exposure: number;
  understanding: number;
  accuracy: number;
  retention: number;
  production: number;
}

const WEIGHTS: Record<keyof MasteryComponents, number> = {
  exposure: 0.1,
  understanding: 0.2,
  accuracy: 0.25,
  retention: 0.2,
  production: 0.25,
};

export function computeMastery(c: MasteryComponents): number {
  const total =
    c.exposure * WEIGHTS.exposure +
    c.understanding * WEIGHTS.understanding +
    c.accuracy * WEIGHTS.accuracy +
    c.retention * WEIGHTS.retention +
    c.production * WEIGHTS.production;
  return Math.round(Math.max(0, Math.min(100, total)) * 10) / 10;
}

/** Nudges components toward a new event outcome using exponential smoothing. */
export function updateMasteryComponents(
  current: MasteryComponents,
  event: {
    sawIt?: boolean; // exposure
    understood?: boolean; // e.g. answered a comprehension-check correctly
    wasCorrect?: boolean; // accuracy
    wasRecalledAfterDelay?: boolean; // retention (correct on a *review*, not first pass)
    wasProduced?: boolean; // production: free-form writing/speaking use, not multiple choice
  },
  alpha = 0.25,
): MasteryComponents {
  const next = { ...current };
  if (event.sawIt) next.exposure = smooth(next.exposure, 100, alpha);
  if (event.understood !== undefined) next.understanding = smooth(next.understanding, event.understood ? 100 : 30, alpha);
  if (event.wasCorrect !== undefined) next.accuracy = smooth(next.accuracy, event.wasCorrect ? 100 : 0, alpha);
  if (event.wasRecalledAfterDelay !== undefined) next.retention = smooth(next.retention, event.wasRecalledAfterDelay ? 100 : 10, alpha);
  if (event.wasProduced !== undefined) next.production = smooth(next.production, event.wasProduced ? 100 : 20, alpha);
  return next;
}

function smooth(current: number, target: number, alpha: number): number {
  const value = current + alpha * (target - current);
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}

export function masteryLabel(mastery: number): string {
  if (mastery >= 85) return "Mastered";
  if (mastery >= 60) return "Solid";
  if (mastery >= 35) return "Developing";
  if (mastery > 0) return "Introduced";
  return "Not started";
}
