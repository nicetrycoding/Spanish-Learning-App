"use server";

import type { CEFRLevel } from "@prisma/client";
import { auth } from "@/lib/auth";
import { submitSpeakingAttempt } from "@/services/speaking-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function submitSpeakingAction(prompt: string, cefrLevel: CEFRLevel, transcript: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const attempt = await submitSpeakingAttempt(session.user.id, prompt, cefrLevel, transcript);
  await checkAndUnlockAchievements(session.user.id);
  return attempt.id;
}
