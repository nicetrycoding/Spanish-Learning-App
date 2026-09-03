import "server-only";
import type { CEFRLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai/service";
import { updateAbilityContinuous, ONGOING_LEARNING_RATE } from "@/lib/adaptive/ability";
import { CEFR_LEVELS, fromContinuous, toContinuous } from "@/lib/cefr";
import { updateStreakAndXp } from "@/services/progress-service";

export async function submitWritingSubmission(userId: string, prompt: string, cefrLevel: CEFRLevel, content: string) {
  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  const learnerLevel = skillProfile?.overallLevel ?? cefrLevel;

  const evaluation = await AIService.evaluateWriting({ text: content, prompt, learner: { level: learnerLevel } });

  const submission = await db.writingSubmission.create({
    data: { userId, prompt, cefrLevel, content, evaluation: evaluation as unknown as object },
  });

  if (skillProfile) {
    const currentAbility = toContinuous(skillProfile.writingLevel, skillProfile.writingSub);
    const observedAbility = CEFR_LEVELS.indexOf(evaluation.cefr);
    // Treat the AI's CEFR read as an "item" whose implied difficulty is the
    // exercise's target level and whose "correctness" is whether the
    // learner's writing met or exceeded it — nudges writingLevel toward the
    // AI's independent read over time rather than jumping to it instantly.
    const metOrExceeded = observedAbility >= CEFR_LEVELS.indexOf(cefrLevel);
    const nextAbility = updateAbilityContinuous(currentAbility, CEFR_LEVELS.indexOf(cefrLevel), metOrExceeded, ONGOING_LEARNING_RATE);
    const { level, sub } = fromContinuous(nextAbility);
    await db.skillProfile.update({ where: { userId }, data: { writingLevel: level, writingSub: sub } });
  }

  await updateStreakAndXp(userId, 20, { studyMinutes: 8 });

  return submission;
}

export async function getWritingSubmission(userId: string, id: string) {
  const submission = await db.writingSubmission.findUnique({ where: { id } });
  if (!submission || submission.userId !== userId) return null;
  return submission;
}

export async function getWritingHistory(userId: string) {
  return db.writingSubmission.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 10 });
}
