"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { saveWordForUser, searchVocabulary } from "@/services/vocabulary-service";

export async function saveWordAction(vocabularyId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await saveWordForUser(session.user.id, vocabularyId);
  revalidatePath("/vocabulary");
}

export async function searchVocabularyAction(query: string, cefr?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return searchVocabulary(query, cefr || undefined);
}
