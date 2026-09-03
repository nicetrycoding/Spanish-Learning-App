"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding";
import type { CEFRLevelKey } from "@/lib/cefr";
import type { PlacementResult, PlacementAnswer } from "@/lib/placement/engine";
import { recordAssessment, estimateSpeakingFromOverall } from "@/services/assessment-service";

const SELF_LEVEL_TO_CEFR: Record<string, CEFRLevelKey> = {
  NOTHING: "A0",
  A1: "A1",
  A2: "A2",
  B1: "B1",
  B2: "B2",
  C1: "C1",
  C2: "C2",
};

export interface OnboardingActionState {
  error?: string;
  needsPlacement?: boolean;
}

export async function saveOnboardingAction(input: OnboardingInput): Promise<OnboardingActionState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in." };

  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return { error: "Please complete all steps." };
  const data = parsed.data;

  const userId = session.user.id;

  await db.$transaction(async (tx) => {
    await tx.profile.update({
      where: { userId },
      data: {
        dailyGoalMinutes: data.dailyGoalMinutes,
        focusAreas: data.focusAreas,
        region: data.region,
        selfReportedLevel: data.selfLevel === "NOT_SURE" ? null : SELF_LEVEL_TO_CEFR[data.selfLevel],
        onboardingCompleted: data.selfLevel !== "NOT_SURE", // finalized once placement test runs, if needed
      },
    });

    await tx.userLearningGoal.deleteMany({ where: { userId } });
    await tx.userLearningGoal.createMany({
      data: data.goals.map((goal) => ({ userId, goal })),
    });

    if (data.selfLevel !== "NOT_SURE") {
      const level = SELF_LEVEL_TO_CEFR[data.selfLevel];
      await tx.skillProfile.update({
        where: { userId },
        data: {
          overallLevel: level,
          grammarLevel: level,
          vocabularyLevel: level,
          readingLevel: level,
          listeningLevel: level,
          writingLevel: level,
          speakingLevel: level,
        },
      });
      await tx.userLevel.create({
        data: { userId, level, subLevel: 0, source: "manual_override" },
      });
    }
  });

  revalidatePath("/dashboard");

  if (data.selfLevel === "NOT_SURE") {
    return { needsPlacement: true };
  }
  redirect("/dashboard");
}

export async function submitPlacementTestAction(
  result: PlacementResult,
  responses: PlacementAnswer[],
  writingEstimate?: { level: CEFRLevelKey; sub: number },
) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id;

  const writing = writingEstimate ?? { level: result.overallLevel, sub: result.overallSub };
  // Speaking has no live production sample in the placement test; estimate
  // it as slightly behind comprehension skills — refined automatically
  // once the learner does real Speaking Lab attempts.
  const speaking = estimateSpeakingFromOverall(result.overallLevel, result.overallSub);

  await recordAssessment(userId, "PLACEMENT", result, responses, writing, speaking);
  await db.profile.update({ where: { userId }, data: { onboardingCompleted: true } });

  revalidatePath("/dashboard");
  redirect("/placement-test/result");
}
