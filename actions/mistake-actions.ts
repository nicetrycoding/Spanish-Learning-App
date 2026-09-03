"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { explainMistakeForUser, resolveMistake } from "@/services/mistake-service";

export async function explainMistakeAction(mistakeId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return explainMistakeForUser(session.user.id, mistakeId);
}

export async function resolveMistakeAction(mistakeId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await resolveMistake(session.user.id, mistakeId);
  revalidatePath("/mistakes");
}
