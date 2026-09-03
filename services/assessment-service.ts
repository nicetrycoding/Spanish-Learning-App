import "server-only";
import type { AssessmentType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { PlacementAnswer, PlacementResult } from "@/lib/placement/engine";
import type { CEFRLevelKey } from "@/lib/cefr";

/**
 * Persists one completed assessment (placement test or level-completion
 * check — both use the same adaptive item-based engine, just labeled
 * differently and triggered from different places) and syncs the skill
 * profile + level history from its results.
 */
export async function recordAssessment(
  userId: string,
  type: AssessmentType,
  result: PlacementResult,
  responses: PlacementAnswer[],
  writing: { level: CEFRLevelKey; sub: number },
  speaking: { level: CEFRLevelKey; sub: number },
) {
  const assessment = await db.assessment.create({
    data: {
      userId,
      type,
      startedAt: new Date(),
      completedAt: new Date(),
      overallLevel: result.overallLevel,
      overallSub: result.overallSub,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendation: result.recommendation,
      responses: responses as unknown as Prisma.InputJsonValue,
      results: {
        create: [
          { skill: "GRAMMAR", cefrLevel: result.bySkill.GRAMMAR.level, score: result.bySkill.GRAMMAR.score },
          { skill: "VOCABULARY", cefrLevel: result.bySkill.VOCABULARY.level, score: result.bySkill.VOCABULARY.score },
          { skill: "READING", cefrLevel: result.bySkill.READING.level, score: result.bySkill.READING.score },
          { skill: "LISTENING", cefrLevel: result.bySkill.LISTENING.level, score: result.bySkill.LISTENING.score },
          { skill: "WRITING", cefrLevel: writing.level, score: 0 },
          { skill: "SPEAKING", cefrLevel: speaking.level, score: 0 },
        ],
      },
    },
  });

  await db.skillProfile.update({
    where: { userId },
    data: {
      overallLevel: result.overallLevel,
      overallSub: result.overallSub,
      grammarLevel: result.bySkill.GRAMMAR.level,
      grammarSub: result.bySkill.GRAMMAR.sub,
      vocabularyLevel: result.bySkill.VOCABULARY.level,
      vocabularySub: result.bySkill.VOCABULARY.sub,
      readingLevel: result.bySkill.READING.level,
      readingSub: result.bySkill.READING.sub,
      listeningLevel: result.bySkill.LISTENING.level,
      listeningSub: result.bySkill.LISTENING.sub,
      writingLevel: writing.level,
      writingSub: writing.sub,
      speakingLevel: speaking.level,
      speakingSub: speaking.sub,
    },
  });

  await db.userLevel.create({
    data: { userId, level: result.overallLevel, subLevel: result.overallSub, source: type === "PLACEMENT" ? "placement_test" : "assessment" },
  });

  return assessment;
}

export function estimateSpeakingFromOverall(overallLevel: CEFRLevelKey, overallSub: number) {
  const CEFR_LEVELS: CEFRLevelKey[] = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const overallContinuous = CEFR_LEVELS.indexOf(overallLevel) + overallSub;
  const speakingContinuous = Math.max(0, overallContinuous - 0.5);
  const idx = Math.max(0, Math.floor(speakingContinuous));
  return { level: CEFR_LEVELS[Math.min(idx, 6)], sub: Math.round((speakingContinuous - idx) * 10) / 10 };
}

export async function getAssessmentHistory(userId: string) {
  return db.assessment.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    include: { results: true },
  });
}
