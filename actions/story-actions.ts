"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { chooseStoryOption } from "@/services/story-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function chooseStoryOptionAction(storyId: string, nextStepKey: string, choiceLabel: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const result = await chooseStoryOption(session.user.id, storyId, nextStepKey, choiceLabel);
  if (result.completed) await checkAndUnlockAchievements(session.user.id);
  revalidatePath("/stories");
  return result;
}
