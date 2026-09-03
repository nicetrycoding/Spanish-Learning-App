"use server";

import { revalidatePath } from "next/cache";
import type { ConfidenceLevel } from "@prisma/client";
import { auth } from "@/lib/auth";
import { submitExerciseAttempt } from "@/services/exercise-service";
import { isLessonFullyComplete } from "@/services/content-service";
import { updateStreakAndXp } from "@/services/progress-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";
import { db } from "@/lib/db";

export async function submitExerciseAction(input: {
  exerciseId: string;
  userAnswer: unknown;
  confidence?: ConfidenceLevel;
  timeSpentMs?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const result = await submitExerciseAttempt({
    userId: session.user.id,
    exerciseId: input.exerciseId,
    userAnswer: input.userAnswer,
    confidence: input.confidence,
    timeSpentMs: input.timeSpentMs,
  });

  await checkAndUnlockAchievements(session.user.id);
  revalidatePath("/dashboard");
  revalidatePath("/learn");
  return result;
}

/** Called once, when the learner finishes the last exercise in a lesson. */
export async function completeLessonAction(lessonId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const complete = await isLessonFullyComplete(lessonId, userId);
  if (complete) {
    const lesson = await db.lesson.findUnique({ where: { id: lessonId }, select: { estimatedMinutes: true } });
    await updateStreakAndXp(userId, 20, {
      lessonsCompleted: 1,
      studyMinutes: lesson?.estimatedMinutes ?? 8,
    });
    await checkAndUnlockAchievements(userId);
  }
  revalidatePath("/dashboard");
  revalidatePath("/learn");
  return { complete };
}
