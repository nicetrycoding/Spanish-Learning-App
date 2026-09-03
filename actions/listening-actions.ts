"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { submitListeningAttempt } from "@/services/listening-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function submitListeningAction(exerciseId: string, answers: Record<string, number>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const result = await submitListeningAttempt(session.user.id, exerciseId, answers);
  await checkAndUnlockAchievements(session.user.id);
  revalidatePath("/listening");
  return result;
}
