"use server";

import { auth } from "@/lib/auth";
import { updateStreakAndXp } from "@/services/progress-service";

export async function completeShadowingSentenceAction(accuracy: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await updateStreakAndXp(session.user.id, accuracy >= 80 ? 6 : 3, {});
}
