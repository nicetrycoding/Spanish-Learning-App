"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { PlacementAnswer, PlacementResult } from "@/lib/placement/engine";
import type { CEFRLevelKey } from "@/lib/cefr";
import { recordAssessment, estimateSpeakingFromOverall } from "@/services/assessment-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function submitLevelAssessmentAction(
  result: PlacementResult,
  responses: PlacementAnswer[],
  writingEstimate?: { level: CEFRLevelKey; sub: number },
) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const writing = writingEstimate ?? { level: result.overallLevel, sub: result.overallSub };
  const speaking = estimateSpeakingFromOverall(result.overallLevel, result.overallSub);

  const assessment = await recordAssessment(userId, "LEVEL_COMPLETION", result, responses, writing, speaking);
  await checkAndUnlockAchievements(userId);

  revalidatePath("/assessments");
  revalidatePath("/dashboard");
  redirect(`/assessments/${assessment.id}`);
}
