"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SpanishRegion, CEFRLevel, ImmersionLevel } from "@prisma/client";
import { auth } from "@/lib/auth";
import {
  startRoleplayConversation,
  startTutorConversation,
  sendConversationMessage,
  endConversation,
} from "@/services/conversation-service";
import { checkAndUnlockAchievements } from "@/services/achievement-service";

export async function startRoleplayAction(input: {
  characterId: string;
  scenario?: string;
  region: SpanishRegion;
  difficulty: CEFRLevel;
  immersionLevel: ImmersionLevel;
  correctionMode: "after" | "immediate";
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const id = await startRoleplayConversation(session.user.id, input);
  await checkAndUnlockAchievements(session.user.id);
  redirect(`/conversation/${id}`);
}

export async function startTutorAction() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const id = await startTutorConversation(session.user.id);
  redirect(`/tutor/${id}`);
}

export async function sendMessageAction(conversationId: string, text: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return sendConversationMessage(session.user.id, conversationId, text);
}

export async function endConversationAction(conversationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const result = await endConversation(session.user.id, conversationId);
  await checkAndUnlockAchievements(session.user.id);
  revalidatePath("/conversation");
  return result;
}
