import "server-only";
import type { CEFRLevel } from "@prisma/client";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai/service";
import { updateStreakAndXp } from "@/services/progress-service";

export async function submitSpeakingAttempt(userId: string, prompt: string, cefrLevel: CEFRLevel, transcript: string) {
  const skillProfile = await db.skillProfile.findUnique({ where: { userId } });
  const evaluation = await AIService.evaluateSpeaking({
    transcript,
    prompt,
    learner: { level: skillProfile?.overallLevel ?? cefrLevel },
  });

  const attempt = await db.speakingAttempt.create({
    data: { userId, prompt, cefrLevel, transcript, evaluation: evaluation as unknown as object },
  });

  await updateStreakAndXp(userId, 18, { studyMinutes: 5 });
  return attempt;
}

export async function getSpeakingAttempt(userId: string, id: string) {
  const attempt = await db.speakingAttempt.findUnique({ where: { id } });
  if (!attempt || attempt.userId !== userId) return null;
  return attempt;
}
