import "server-only";
import type { SkillType, CEFRLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { CEFR_LEVELS, levelIndex } from "@/lib/cefr";
import { pickRandom } from "@/lib/utils";

function skillLevel(skillProfile: { grammarLevel: CEFRLevel; vocabularyLevel: CEFRLevel; readingLevel: CEFRLevel; listeningLevel: CEFRLevel; writingLevel: CEFRLevel; speakingLevel: CEFRLevel } | null, skill: SkillType): CEFRLevel {
  if (!skillProfile) return "A1";
  switch (skill) {
    case "GRAMMAR":
      return skillProfile.grammarLevel;
    case "VOCABULARY":
      return skillProfile.vocabularyLevel;
    case "READING":
      return skillProfile.readingLevel;
    case "LISTENING":
      return skillProfile.listeningLevel;
    case "WRITING":
      return skillProfile.writingLevel;
    case "SPEAKING":
      return skillProfile.speakingLevel;
  }
}

/** A same-level-first, one-level-tolerant window around the learner's current ability for this skill. */
function candidateLevels(level: CEFRLevel): CEFRLevel[] {
  const idx = levelIndex(level);
  return [CEFR_LEVELS[idx], CEFR_LEVELS[Math.max(0, idx - 1)], CEFR_LEVELS[Math.min(CEFR_LEVELS.length - 1, idx + 1)]].filter(
    (v, i, arr) => arr.indexOf(v) === i,
  ) as CEFRLevel[];
}

export async function getQuickPracticeSet(userId: string, skill: SkillType, count = 8) {
  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  const level = skillLevel(skillProfile, skill);
  const levels = candidateLevels(level);

  const exercises = await db.exercise.findMany({
    where: { skillTag: skill, cefrLevel: { in: levels } },
    take: 300,
  });
  if (exercises.length === 0) return [];

  const attempted = await db.exerciseAttempt.findMany({
    where: { userId, exerciseId: { in: exercises.map((e) => e.id) }, isCorrect: true },
    select: { exerciseId: true },
    distinct: ["exerciseId"],
  });
  const attemptedIds = new Set(attempted.map((a) => a.exerciseId));
  const unseen = exercises.filter((e) => !attemptedIds.has(e.id));
  const pool = unseen.length >= count ? unseen : exercises;

  return pickRandom(pool, Math.min(count, pool.length));
}
