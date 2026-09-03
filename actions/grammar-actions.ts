"use server";

import { revalidatePath } from "next/cache";
import type { ConfidenceLevel } from "@prisma/client";
import { auth } from "@/lib/auth";
import { submitExerciseAttempt } from "@/services/exercise-service";
import { applyGrammarPracticeOutcome } from "@/services/grammar-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function practiceGrammarTopicAction(input: {
  topicId: string;
  exerciseId: string;
  userAnswer: unknown;
  confidence?: ConfidenceLevel;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const result = await submitExerciseAttempt({
    userId: session.user.id,
    exerciseId: input.exerciseId,
    userAnswer: input.userAnswer,
    confidence: input.confidence,
  });
  await applyGrammarPracticeOutcome(session.user.id, input.topicId, result.isCorrect);
  await checkAndUnlockAchievements(session.user.id);
  revalidatePath("/grammar");
  return result;
}
