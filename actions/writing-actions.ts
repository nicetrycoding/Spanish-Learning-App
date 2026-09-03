"use server";

import type { CEFRLevel } from "@prisma/client";
import { auth } from "@/lib/auth";
import { submitWritingSubmission } from "@/services/writing-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function submitWritingAction(prompt: string, cefrLevel: CEFRLevel, content: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const submission = await submitWritingSubmission(session.user.id, prompt, cefrLevel, content);
  await checkAndUnlockAchievements(session.user.id);
  return submission.id;
}
