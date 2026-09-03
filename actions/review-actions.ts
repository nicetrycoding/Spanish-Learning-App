"use server";

import { revalidatePath } from "next/cache";
import type { ConfidenceLevel } from "@prisma/client";
import { auth } from "@/lib/auth";
import { submitReviewOutcome, type ReviewKind } from "@/services/review-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function submitReviewAction(input: {
  type: ReviewKind;
  refId: string;
  mode: "recognition" | "production";
  isCorrect: boolean;
  confidence?: ConfidenceLevel;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const result = await submitReviewOutcome(
    session.user.id,
    { type: input.type, refId: input.refId, mode: input.mode },
    input.isCorrect,
    input.confidence,
  );
  await checkAndUnlockAchievements(session.user.id);
  revalidatePath("/dashboard");
  return result;
}
